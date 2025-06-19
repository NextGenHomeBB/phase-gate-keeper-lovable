
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
    console.log('=== CREATE WORKER FUNCTION START ===')
    
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
      console.error('No authorization header provided')
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Verifying user authentication...')
    
    // Verify the user is authenticated and is an admin
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      console.error('Authentication failed:', authError)
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('User authenticated:', user.id)

    // Check if user has admin role
    console.log('Checking admin role...')
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()

    if (roleError || !roleData) {
      console.error('Admin role check failed:', roleError)
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Admin role verified')

    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await req.json()
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError)
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { email, fullName, phone, roleTitle } = requestBody

    // Validate required fields
    if (!email || !fullName) {
      console.error('Missing required fields:', { email: !!email, fullName: !!fullName })
      return new Response(JSON.stringify({ error: 'Email and full name are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.error('Invalid email format:', email)
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Request validation passed for email:', email)

    // Check if user already exists
    console.log('Checking for existing users...')
    const { data: existingUser, error: userCheckError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (userCheckError) {
      console.error('Error checking existing users:', userCheckError)
      return new Response(JSON.stringify({ error: 'Failed to check existing users: ' + userCheckError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const existingUserRecord = existingUser.users.find(u => u.email === email)
    
    if (existingUserRecord) {
      console.log('User already exists:', existingUserRecord.id)
      
      // User already exists, let's check if they're already a worker
      const { data: existingRole, error: existingRoleError } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', existingUserRecord.id)
        .eq('role', 'worker')
        .single()

      if (existingRoleError && existingRoleError.code !== 'PGRST116') {
        console.error('Error checking existing role:', existingRoleError)
        return new Response(JSON.stringify({ error: 'Failed to check existing role: ' + existingRoleError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (existingRole) {
        console.log('User is already a worker - returning success')
        
        // Update profile and team member info if provided
        if (phone || roleTitle) {
          console.log('Updating existing worker info...')
          
          // Update profile
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
              id: existingUserRecord.id,
              full_name: fullName,
              email: email
            })

          if (profileError) {
            console.error('Profile update error:', profileError)
          }

          // Update team member info using upsert with conflict resolution
          const { error: teamError } = await supabaseAdmin
            .from('team_members')
            .upsert({
              user_id: existingUserRecord.id,
              name: fullName,
              email: email,
              phone: phone || null,
              role_title: roleTitle || null
            }, {
              onConflict: 'email'
            })

          if (teamError) {
            console.error('Team member update error (non-critical):', teamError)
            // Don't fail the entire operation for team member updates
          }
        }
        
        return new Response(JSON.stringify({ 
          success: true, 
          message: `${fullName} is already a worker and has been updated` 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log('Adding worker role to existing user...')
      
      // User exists but is not a worker, add worker role
      const { error: roleInsertError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: existingUserRecord.id,
          role: 'worker'
        })

      if (roleInsertError) {
        console.error('Failed to insert worker role:', roleInsertError)
        return new Response(JSON.stringify({ error: 'Failed to assign worker role: ' + roleInsertError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log('Worker role assigned successfully')

      // Update profile
      console.log('Updating profile...')
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: existingUserRecord.id,
          full_name: fullName,
          email: email,
          must_reset_password: false
        })

      if (profileError) {
        console.error('Profile update error:', profileError)
        return new Response(JSON.stringify({ error: 'Failed to update profile: ' + profileError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log('Profile updated successfully')

      // Add/update team member info with proper conflict resolution
      if (phone || roleTitle) {
        console.log('Updating team member info...')
        const { error: teamError } = await supabaseAdmin
          .from('team_members')
          .upsert({
            user_id: existingUserRecord.id,
            name: fullName,
            email: email,
            phone: phone || null,
            role_title: roleTitle || null
          }, {
            onConflict: 'email'
          })

        if (teamError) {
          console.error('Team member update error (non-critical):', teamError)
          // Don't fail the entire operation for team member updates
        } else {
          console.log('Team member info updated successfully')
        }
      }

      console.log('Successfully added existing user as worker')
      return new Response(JSON.stringify({ 
        success: true, 
        message: `${fullName} has been added as a worker (existing user)` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Creating new user...')

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + 'A1!'
    console.log('Generated temporary password')

    // Create the user account using admin client
    const { data: authData, error: authCreateError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      user_metadata: {
        full_name: fullName
      },
      email_confirm: false
    })

    if (authCreateError) {
      console.error('Auth creation error:', authCreateError)
      return new Response(JSON.stringify({ error: 'Failed to create user: ' + authCreateError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!authData.user) {
      console.error('User creation succeeded but no user data returned')
      return new Response(JSON.stringify({ error: 'Failed to create user - no user data returned' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('User created successfully:', authData.user.id)

    // Add worker role
    console.log('Adding worker role...')
    const { error: roleInsertError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: 'worker'
      })

    if (roleInsertError) {
      console.error('Failed to insert worker role:', roleInsertError)
      return new Response(JSON.stringify({ error: 'Failed to assign worker role: ' + roleInsertError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Worker role assigned successfully')

    // Ensure profile exists with must_reset_password flag
    console.log('Creating profile...')
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authData.user.id,
        full_name: fullName,
        email: email,
        must_reset_password: true
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      return new Response(JSON.stringify({ error: 'Failed to create profile: ' + profileError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Profile created successfully')

    // Add to team members if needed with proper conflict resolution
    if (phone || roleTitle) {
      console.log('Creating team member record...')
      const { error: teamError } = await supabaseAdmin
        .from('team_members')
        .upsert({
          user_id: authData.user.id,
          name: fullName,
          email: email,
          phone: phone || null,
          role_title: roleTitle || null
        }, {
          onConflict: 'email'
        })

      if (teamError) {
        console.error('Team member creation error (non-critical):', teamError)
        // Don't fail the entire operation for team member creation
      } else {
        console.log('Team member record created successfully')
      }
    }

    // Log the user creation
    console.log('Logging user creation...')
    const { error: logError } = await supabaseAdmin
      .from('created_users_log')
      .insert({
        admin_id: user.id,
        email: email
      })

    if (logError) {
      console.error('Log creation error:', logError)
      // Don't return error for logging failure, just log it
    } else {
      console.log('User creation logged successfully')
    }

    console.log('=== CREATE WORKER FUNCTION SUCCESS ===')

    return new Response(JSON.stringify({ 
      success: true, 
      tempPassword,
      message: `Worker ${fullName} created successfully` 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('=== CREATE WORKER FUNCTION ERROR ===')
    console.error('Unexpected error:', error)
    console.error('Error stack:', error.stack)
    return new Response(JSON.stringify({ error: 'Internal server error: ' + error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
