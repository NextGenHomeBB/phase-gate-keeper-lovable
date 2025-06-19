
import { supabase } from '@/integrations/supabase/client';

export interface WorkerProject {
  id: string;
  name: string;
  description: string | null;
  assigned: boolean;
}

export const workerProjectService = {
  async getWorkerProjects(workerId: string): Promise<WorkerProject[]> {
    // Get all projects
    const { data: allProjects, error: projectsError } = await supabase
      .from('projects')
      .select('id, name, description')
      .order('name', { ascending: true });

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      throw projectsError;
    }

    // Get worker's current project assignments
    const { data: assignments, error: assignmentsError } = await supabase
      .from('project_team_members')
      .select('project_id')
      .eq('team_member_id', workerId);

    if (assignmentsError) {
      console.error('Error fetching worker assignments:', assignmentsError);
      throw assignmentsError;
    }

    const assignedProjectIds = new Set(assignments?.map(a => a.project_id) || []);

    return (allProjects || []).map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      assigned: assignedProjectIds.has(project.id)
    }));
  },

  async updateWorkerProjectAssignments(workerId: string, projectIds: string[]): Promise<void> {
    // First, remove all current assignments for this worker
    const { error: deleteError } = await supabase
      .from('project_team_members')
      .delete()
      .eq('team_member_id', workerId);

    if (deleteError) {
      console.error('Error removing current assignments:', deleteError);
      throw deleteError;
    }

    // Then, add new assignments if any
    if (projectIds.length > 0) {
      const assignments = projectIds.map(projectId => ({
        project_id: projectId,
        team_member_id: workerId
      }));

      const { error: insertError } = await supabase
        .from('project_team_members')
        .insert(assignments);

      if (insertError) {
        console.error('Error creating new assignments:', insertError);
        throw insertError;
      }
    }
  }
};
