
import { supabase } from '@/integrations/supabase/client';
import { TeamMember } from '@/components/TeamPage';
import { teamMemberSchema, sanitizeInput } from '@/lib/validationSchemas';

export interface DatabaseTeamMember {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  role_title: string | null;
  phone: string | null;
  start_date: string | null;
  created_at: string;
  updated_at: string;
}

export const secureTeamService = {
  async fetchTeamMembers(): Promise<TeamMember[]> {
    // Get current user to ensure they're authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }

    return (data || []).map(member => ({
      id: member.id,
      name: sanitizeInput(member.name),
      email: sanitizeInput(member.email),
      role: member.role_title ? sanitizeInput(member.role_title) : 'Team Member',
      phone: member.phone ? sanitizeInput(member.phone) : undefined,
      startDate: member.start_date || new Date().toISOString().split('T')[0]
    }));
  },

  async addTeamMember(member: Omit<TeamMember, 'id'>): Promise<TeamMember> {
    // Validate input
    const validatedMember = teamMemberSchema.parse(member);

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to add team members');
    }

    // Sanitize inputs
    const sanitizedMember = {
      name: sanitizeInput(validatedMember.name),
      email: sanitizeInput(validatedMember.email),
      role_title: sanitizeInput(validatedMember.role),
      phone: validatedMember.phone ? sanitizeInput(validatedMember.phone) : null,
      start_date: validatedMember.startDate,
      user_id: user.id
    };

    const { data, error } = await supabase
      .from('team_members')
      .insert(sanitizedMember)
      .select()
      .single();

    if (error) {
      console.error('Error adding team member:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role_title || 'Team Member',
      phone: data.phone || undefined,
      startDate: data.start_date || new Date().toISOString().split('T')[0]
    };
  },

  async deleteTeamMember(id: string): Promise<void> {
    // Validate ID format
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid team member ID');
    }

    // Get current user for authorization
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting team member:', error);
      throw error;
    }
  },

  async inviteUserToRegister(email: string): Promise<void> {
    // Validate email
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      throw new Error('Invalid email address');
    }

    const sanitizedEmail = sanitizeInput(email.toLowerCase());

    // Send invitation email through Supabase Auth
    const { error } = await supabase.auth.signInWithOtp({
      email: sanitizedEmail,
      options: {
        shouldCreateUser: true,
        data: {
          invitation: true
        }
      }
    });

    if (error) {
      console.error('Error sending invitation:', error);
      throw error;
    }
  }
};
