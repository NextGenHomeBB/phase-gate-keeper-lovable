
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

export interface TeamMemberRole {
  id: string;
  team_member_id: string;
  role_name: string;
  created_at: string;
  updated_at: string;
}

export const teamService = {
  async fetchTeamMembers(): Promise<TeamMember[]> {
    // Fetch team members with their roles
    const { data: membersData, error: membersError } = await supabase
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: false });

    if (membersError) {
      console.error('Error fetching team members:', membersError);
      throw membersError;
    }

    // Fetch all roles for these team members
    const { data: rolesData, error: rolesError } = await supabase
      .from('team_member_roles')
      .select('*');

    if (rolesError) {
      console.error('Error fetching team member roles:', rolesError);
      throw rolesError;
    }

    return (membersData || []).map(member => {
      // Get roles for this member
      const memberRoles = rolesData?.filter(role => role.team_member_id === member.id) || [];
      const roles = memberRoles.map(role => role.role_name);
      
      // If no roles in new table, use legacy role_title
      const finalRoles = roles.length > 0 ? roles : (member.role_title ? [member.role_title] : ['Team Member']);

      return {
        id: member.id,
        name: member.name,
        email: member.email,
        role: finalRoles.join(', '), // Display as comma-separated string for backward compatibility
        roles: finalRoles, // New field for multiple roles
        phone: member.phone || undefined,
        startDate: member.start_date || new Date().toISOString().split('T')[0]
      };
    });
  },

  async addTeamMember(member: Omit<TeamMember, 'id'>): Promise<TeamMember> {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to add team members');
    }

    // Extract roles from the member object
    const roles = (member as any).roles || [member.role];

    const { data, error } = await supabase
      .from('team_members')
      .insert({
        name: member.name,
        email: member.email,
        role_title: roles[0], // Keep first role in legacy field for compatibility
        phone: member.phone,
        start_date: member.startDate,
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding team member:', error);
      throw error;
    }

    // Add roles to the new roles table
    if (roles.length > 0) {
      const roleInserts = roles.map(role => ({
        team_member_id: data.id,
        role_name: role
      }));

      const { error: rolesError } = await supabase
        .from('team_member_roles')
        .insert(roleInserts);

      if (rolesError) {
        console.error('Error adding team member roles:', rolesError);
        // Don't throw here to avoid leaving orphaned team member
      }
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: roles.join(', '),
      roles: roles,
      phone: data.phone || undefined,
      startDate: data.start_date || new Date().toISOString().split('T')[0]
    };
  },

  async updateTeamMemberRoles(teamMemberId: string, roles: string[]): Promise<void> {
    // Delete existing roles
    await supabase
      .from('team_member_roles')
      .delete()
      .eq('team_member_id', teamMemberId);

    // Insert new roles
    if (roles.length > 0) {
      const roleInserts = roles.map(role => ({
        team_member_id: teamMemberId,
        role_name: role
      }));

      const { error } = await supabase
        .from('team_member_roles')
        .insert(roleInserts);

      if (error) {
        console.error('Error updating team member roles:', error);
        throw error;
      }

      // Update legacy role_title field with first role
      await supabase
        .from('team_members')
        .update({ role_title: roles[0] })
        .eq('id', teamMemberId);
    }
  },

  async deleteTeamMember(id: string): Promise<void> {
    // First delete roles (will cascade automatically due to foreign key constraint)
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
