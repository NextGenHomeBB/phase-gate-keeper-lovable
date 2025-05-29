
import { supabase } from '@/integrations/supabase/client';
import { TeamMember } from '@/components/TeamPage';

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

export const teamService = {
  async fetchTeamMembers(): Promise<TeamMember[]> {
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
      name: member.name,
      email: member.email,
      role: member.role_title || 'Team Member',
      phone: member.phone || undefined,
      startDate: member.start_date || new Date().toISOString().split('T')[0]
    }));
  },

  async addTeamMember(member: Omit<TeamMember, 'id'>): Promise<TeamMember> {
    const { data, error } = await supabase
      .from('team_members')
      .insert({
        name: member.name,
        email: member.email,
        role_title: member.role,
        phone: member.phone,
        start_date: member.startDate
      })
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
    // Send invitation email through Supabase Auth
    const { error } = await supabase.auth.signInWithOtp({
      email,
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
