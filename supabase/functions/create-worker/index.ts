
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Create regular client to verify the requesting user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Verify the user is authenticated and is an admin
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()

    if (roleError || !roleData) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { email, fullName, phone, roleTitle } = await req.json()

    // Check if user already exists
    const { data: existingUser, error: userCheckError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (userCheckError) {
      console.error('Error checking existing users:', userCheckError)
      return new Response(JSON.stringify({ error: 'Failed to check existing users' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const existingUserRecord = existingUser.users.find(u => u.email === email)
    
    if (existingUserRecord) {
      // User already exists, let's check if they're already a worker
      const { data: existingRole } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', existingUserRecord.id)
        .eq('role', 'worker')
        .single()

      if (existingRole) {
        return new Response(JSON.stringify({ 
          error: `A worker with email ${email} already exists` 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // User exists but is not a worker, add worker role and sync data
      const { error: roleError2 } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: existingUserRecord.id,
          role: 'worker'
        })

      if (roleError2) {
        console.error('Role error:', roleError2)
        return new Response(JSON.stringify({ error: 'Failed to assign worker role' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Update profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: existingUserRecord.id,
          full_name: fullName,
          email: email,
          must_reset_password: true
        })

      if (profileError) {
        console.error('Profile error:', profileError)
      }

      // Add/update team member info
      if (phone || roleTitle) {
        const { error: teamError } = await supabaseAdmin
          .from('team_members')
          .upsert({
            user_id: existingUserRecord.id,
            name: fullName,
            email: email,
            phone: phone || null,
            role_title: roleTitle || null
          })

        if (teamError) {
          console.error('Team member error:', teamError)
        }
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: `${fullName} has been added as a worker (existing user)` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + 'A1!'

    // Create the user account using admin client
    const { data: authData, error: authError2 } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      user_metadata: {
        full_name: fullName
      },
      email_confirm: false
    })

    if (authError2) {
      console.error('Auth creation error:', authError2)
      return new Response(JSON.stringify({ error: authError2.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!authData.user) {
      return new Response(JSON.stringify({ error: 'Failed to create user' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('User created:', authData.user.id)

    // Add worker role
    const { error: roleError2 } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: 'worker'
      })

    if (roleError2) {
      console.error('Role error:', roleError2)
    }

    // Ensure profile exists with must_reset_password flag
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authData.user.id,
        full_name: fullName,
        email: email,
        must_reset_password: true
      })

    if (profileError) {
      console.error('Profile error:', profileError)
    }

    // Add to team members if needed
    if (phone || roleTitle) {
      const { error: teamError } = await supabaseAdmin
        .from('team_members')
        .insert({
          user_id: authData.user.id,
          name: fullName,
          email: email,
          phone: phone || null,
          role_title: roleTitle || null
        })

      if (teamError) {
        console.error('Team member error:', teamError)
      }
    }

    // Log the user creation
    const { error: logError } = await supabaseAdmin
      .from('created_users_log')
      .insert({
        admin_id: user.id,
        email: email
      })

    if (logError) {
      console.error('Log error:', logError)
    }

    return new Response(JSON.stringify({ 
      success: true, 
      tempPassword,
      message: `Worker ${fullName} created successfully` 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
