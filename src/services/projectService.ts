import { supabase } from "@/integrations/supabase/client";
import { Project, Phase, ChecklistItem, Material, Labour } from "@/pages/Index";
import { TeamMember } from "@/components/TeamPage";
import { materialService } from "./materialService";
import { labourService } from "./labourService";

function getPhaseChecklist(phaseNumber: number): ChecklistItem[] {
  const baseItems = ["Alle stakeholders geïnformeerd", "Documentatie bijgewerkt", "Kwaliteitscontrole uitgevoerd", "Deliverables goedgekeurd door projectleider"];
  return baseItems.map((item, index) => ({
    id: `${phaseNumber}-${index}`,
    description: item,
    completed: false,
    required: true
  }));
}

export interface DatabaseProject {
  id: string;
  name: string;
  description: string | null;
  current_phase: number | null;
  start_date: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Extended fields for renovation/splitting projects
  address?: string | null;
  postal_code?: string | null;
  city?: string | null;
  building_year?: number | null;
  existing_building_type?: string | null;
  transformation_description?: string | null;
  number_of_units_after_split?: number | null;
  unit_areas?: any | null; // JSONB
  unit_purposes?: any | null; // JSONB
  installation_concept?: any | null; // JSONB
  unit_access_type?: string | null;
  energy_labels?: any | null; // JSONB
  project_manager?: string | null;
  executor?: string | null;
  planned_delivery_date?: string | null;
  special_considerations?: string | null;
}

export interface DatabasePhase {
  id: string;
  project_id: string;
  phase_number: number;
  name: string;
  description: string | null;
  completed: boolean;
  locked: boolean;
  color_index: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseChecklistItem {
  id: string;
  project_id: string;
  phase_id: number;
  item_id: string;
  description: string;
  completed: boolean;
  required: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const projectService = {
  async fetchProjects(): Promise<Project[]> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to fetch projects');
    }

    // Get user role
    const { data: userRole } = await supabase.rpc('get_user_role', { _user_id: user.id });

    let query;

    if (userRole === 'admin') {
      // Admins can see all projects
      query = supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
    } else {
      // For non-admin users, get projects they created OR are team members of
      // First get team member IDs for this user
      const { data: teamMemberData } = await supabase
        .from('team_members')
        .select('id')
        .eq('user_id', user.id);

      const teamMemberIds = teamMemberData?.map(tm => tm.id) || [];

      if (teamMemberIds.length > 0) {
        // Get projects where user is creator OR assigned as team member
        const { data: projectTeamData } = await supabase
          .from('project_team_members')
          .select('project_id')
          .in('team_member_id', teamMemberIds);

        const assignedProjectIds = projectTeamData?.map(ptm => ptm.project_id) || [];

        if (assignedProjectIds.length > 0) {
          query = supabase
            .from('projects')
            .select('*')
            .or(`created_by.eq.${user.id},id.in.(${assignedProjectIds.join(',')})`)
            .order('created_at', { ascending: false });
        } else {
          query = supabase
            .from('projects')
            .select('*')
            .eq('created_by', user.id)
            .order('created_at', { ascending: false });
        }
      } else {
        // User has no team member record, only show projects they created
        query = supabase
          .from('projects')
          .select('*')
          .eq('created_by', user.id)
          .order('created_at', { ascending: false });
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }

    // For each project, fetch associated team members, materials, labour, and phases
    const projectsWithData = await Promise.all(
      (data || []).map(async (project) => {
        const teamMembers = await this.fetchProjectTeamMembers(project.id);
        const materialsByPhase = await materialService.fetchAllMaterialsForProject(project.id);
        const labourByPhase = await labourService.fetchAllLabourForProject(project.id);
        const phases = await this.fetchProjectPhases(project.id);
        
        return {
          id: project.id,
          name: project.name,
          description: project.description || '',
          currentPhase: project.current_phase || 1,
          startDate: project.start_date || new Date().toISOString().split('T')[0],
          teamMembers: teamMembers.map(tm => tm.name),
          // Extended project info fields
          address: project.address || undefined,
          postal_code: project.postal_code || undefined,
          city: project.city || undefined,
          building_year: project.building_year || undefined,
          existing_building_type: project.existing_building_type || undefined,
          transformation_description: project.transformation_description || undefined,
          number_of_units_after_split: project.number_of_units_after_split || undefined,
          unit_areas: project.unit_areas as any || undefined,
          unit_purposes: project.unit_purposes as any || undefined,
          installation_concept: project.installation_concept as any || undefined,
          unit_access_type: project.unit_access_type as 'gemeenschappelijke_entree' | 'eigen_opgang' || undefined,
          energy_labels: project.energy_labels as any || undefined,
          project_manager: project.project_manager || undefined,
          executor: project.executor || undefined,
          planned_delivery_date: project.planned_delivery_date || undefined,
          special_considerations: project.special_considerations || undefined,
          phases: await Promise.all(phases.map(async (phase) => {
            const checklist = await this.fetchPhaseChecklist(project.id, phase.phase_number);
        return {
          id: phase.phase_number,
          name: phase.name,
          description: phase.description || '',
          completed: phase.completed,
          locked: phase.locked,
          color_index: phase.color_index,
          start_date: phase.start_date || undefined,
          end_date: phase.end_date || undefined,
          actual_start_date: phase.actual_start_date || undefined,
          actual_end_date: phase.actual_end_date || undefined,
          estimated_duration_days: phase.estimated_duration_days || undefined,
          checklist: checklist,
          materials: materialsByPhase[phase.phase_number] || [],
          labour: labourByPhase[phase.phase_number] || []
        };
          }))
        };
      })
    );

    return projectsWithData;
  },

  async getProject(projectId: string): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
      throw error;
    }

    const teamMembers = await this.fetchProjectTeamMembers(projectId);
    const materialsByPhase = await materialService.fetchAllMaterialsForProject(projectId);
    const labourByPhase = await labourService.fetchAllLabourForProject(projectId);
    const phases = await this.fetchProjectPhases(projectId);
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      currentPhase: data.current_phase || 1,
      startDate: data.start_date || new Date().toISOString().split('T')[0],
      teamMembers: teamMembers.map(tm => tm.name),
      // Extended project info fields
      address: data.address || undefined,
      postal_code: data.postal_code || undefined,
      city: data.city || undefined,
      building_year: data.building_year || undefined,
      existing_building_type: data.existing_building_type || undefined,
      transformation_description: data.transformation_description || undefined,
      number_of_units_after_split: data.number_of_units_after_split || undefined,
      unit_areas: data.unit_areas as any || undefined,
      unit_purposes: data.unit_purposes as any || undefined,
      installation_concept: data.installation_concept as any || undefined,
      unit_access_type: data.unit_access_type as 'gemeenschappelijke_entree' | 'eigen_opgang' || undefined,
      energy_labels: data.energy_labels as any || undefined,
      project_manager: data.project_manager || undefined,
      executor: data.executor || undefined,
      planned_delivery_date: data.planned_delivery_date || undefined,
      special_considerations: data.special_considerations || undefined,
      phases: await Promise.all(phases.map(async (phase) => {
        const checklist = await this.fetchPhaseChecklist(projectId, phase.phase_number);
        return {
          id: phase.phase_number,
          name: phase.name,
          description: phase.description || '',
          completed: phase.completed,
          locked: phase.locked,
          color_index: phase.color_index,
          start_date: phase.start_date || undefined,
          end_date: phase.end_date || undefined,
          actual_start_date: phase.actual_start_date || undefined,
          actual_end_date: phase.actual_end_date || undefined,
          estimated_duration_days: phase.estimated_duration_days || undefined,
          checklist: checklist,
          materials: materialsByPhase[phase.phase_number] || [],
          labour: labourByPhase[phase.phase_number] || []
        };
      }))
    };
  },

  async fetchPhaseChecklist(projectId: string, phaseId: number): Promise<ChecklistItem[]> {
    const { data, error } = await supabase
      .from('project_checklist_items')
      .select('*')
      .eq('project_id', projectId)
      .eq('phase_id', phaseId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching checklist items:', error);
      throw error;
    }

    // If no checklist items exist, create default ones
    if (!data || data.length === 0) {
      const defaultItems = getPhaseChecklist(phaseId);
      await this.createDefaultChecklistItems(projectId, phaseId, defaultItems);
      return defaultItems;
    }

    return data.map(item => ({
      id: item.item_id,
      description: item.description,
      completed: item.completed,
      required: item.required,
      notes: item.notes || undefined
    }));
  },

  async createDefaultChecklistItems(projectId: string, phaseId: number, items: ChecklistItem[]): Promise<void> {
    const insertData = items.map(item => ({
      project_id: projectId,
      phase_id: phaseId,
      item_id: item.id,
      description: item.description,
      completed: item.completed,
      required: item.required,
      notes: item.notes || null
    }));

    const { error } = await supabase
      .from('project_checklist_items')
      .insert(insertData);

    if (error) {
      console.error('Error creating default checklist items:', error);
      throw error;
    }
  },

  async updateChecklistItem(projectId: string, phaseId: number, itemId: string, updates: Partial<{
    description: string;
    completed: boolean;
    required: boolean;
    notes: string;
  }>): Promise<void> {
    const { error } = await supabase
      .from('project_checklist_items')
      .update(updates)
      .eq('project_id', projectId)
      .eq('phase_id', phaseId)
      .eq('item_id', itemId);

    if (error) {
      console.error('Error updating checklist item:', error);
      throw error;
    }
  },

  async addChecklistItem(projectId: string, phaseId: number, item: ChecklistItem): Promise<void> {
    const { error } = await supabase
      .from('project_checklist_items')
      .insert({
        project_id: projectId,
        phase_id: phaseId,
        item_id: item.id,
        description: item.description,
        completed: item.completed,
        required: item.required,
        notes: item.notes || null
      });

    if (error) {
      console.error('Error adding checklist item:', error);
      throw error;
    }
  },

  async deleteChecklistItem(projectId: string, phaseId: number, itemId: string): Promise<void> {
    const { error } = await supabase
      .from('project_checklist_items')
      .delete()
      .eq('project_id', projectId)
      .eq('phase_id', phaseId)
      .eq('item_id', itemId);

    if (error) {
      console.error('Error deleting checklist item:', error);
      throw error;
    }
  },

  async fetchProjectPhases(projectId: string): Promise<DatabasePhase[]> {
    const { data, error } = await supabase
      .from('project_phases')
      .select('*')
      .eq('project_id', projectId)
      .order('phase_number', { ascending: true });

    if (error) {
      console.error('Error fetching project phases:', error);
      throw error;
    }

    return data || [];
  },

  async addProjectPhase(projectId: string, phaseName: string, phaseDescription: string, phaseNumber?: number): Promise<DatabasePhase> {
    if (phaseNumber) {
      // If specific phase number is provided, use it
      const { data, error } = await supabase
        .from('project_phases')
        .insert({
          project_id: projectId,
          phase_number: phaseNumber,
          name: phaseName,
          description: phaseDescription,
          completed: false,
          locked: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding project phase:', error);
        throw error;
      }

      return data;
    } else {
      // Get the highest phase number for this project (existing behavior)
      const { data: existingPhases, error: fetchError } = await supabase
        .from('project_phases')
        .select('phase_number')
        .eq('project_id', projectId)
        .order('phase_number', { ascending: false })
        .limit(1);

      if (fetchError) {
        console.error('Error fetching existing phases:', fetchError);
        throw fetchError;
      }

      const nextPhaseNumber = existingPhases && existingPhases.length > 0 
        ? existingPhases[0].phase_number + 1 
        : 1;

      const { data, error } = await supabase
        .from('project_phases')
        .insert({
          project_id: projectId,
          phase_number: nextPhaseNumber,
          name: phaseName,
          description: phaseDescription,
          completed: false,
          locked: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding project phase:', error);
        throw error;
      }

      return data;
    }
  },

  async shiftPhasesAfter(projectId: string, afterPhaseNumber: number): Promise<void> {
    // Get all phases after the insertion point
    const { data: phasesToShift, error: fetchError } = await supabase
      .from('project_phases')
      .select('id, phase_number')
      .eq('project_id', projectId)
      .gt('phase_number', afterPhaseNumber)
      .order('phase_number', { ascending: false }); // Process in reverse order to avoid conflicts

    if (fetchError) {
      console.error('Error fetching phases to shift:', fetchError);
      throw fetchError;
    }

    // Shift each phase number by 1
    for (const phase of phasesToShift || []) {
      const { error } = await supabase
        .from('project_phases')
        .update({ phase_number: phase.phase_number + 1 })
        .eq('id', phase.id);

      if (error) {
        console.error('Error shifting phase:', error);
        throw error;
      }
    }
  },

  async deleteProjectPhase(projectId: string, phaseNumber: number): Promise<void> {
    const { error } = await supabase
      .from('project_phases')
      .delete()
      .eq('project_id', projectId)
      .eq('phase_number', phaseNumber);

    if (error) {
      console.error('Error deleting project phase:', error);
      throw error;
    }
  },

  async updateProjectPhase(projectId: string, phaseId: number, updates: { 
    completed?: boolean; 
    locked?: boolean; 
    color_index?: number; 
    name?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    actual_start_date?: string;
    actual_end_date?: string;
  }): Promise<void> {
    const { error } = await supabase
      .from('project_phases')
      .update(updates)
      .eq('project_id', projectId)
      .eq('phase_number', phaseId);

    if (error) {
      console.error('Error updating project phase:', error);
      throw error;
    }
  },

  async fetchProjectTeamMembers(projectId: string): Promise<TeamMember[]> {
    const { data, error } = await supabase
      .from('project_team_members')
      .select(`
        team_members (
          id,
          name,
          email,
          role_title,
          phone,
          start_date
        )
      `)
      .eq('project_id', projectId);

    if (error) {
      console.error('Error fetching project team members:', error);
      throw error;
    }

    return (data || []).map(item => ({
      id: item.team_members.id,
      name: item.team_members.name,
      email: item.team_members.email,
      role: item.team_members.role_title || 'Team Member',
      phone: item.team_members.phone || undefined,
      startDate: item.team_members.start_date || new Date().toISOString().split('T')[0]
    }));
  },

  async addTeamMemberToProject(projectId: string, teamMemberId: string): Promise<void> {
    const { error } = await supabase
      .from('project_team_members')
      .insert({
        project_id: projectId,
        team_member_id: teamMemberId
      });

    if (error) {
      console.error('Error adding team member to project:', error);
      throw error;
    }
  },

  async removeTeamMemberFromProject(projectId: string, teamMemberId: string): Promise<void> {
    const { error } = await supabase
      .from('project_team_members')
      .delete()
      .eq('project_id', projectId)
      .eq('team_member_id', teamMemberId);

    if (error) {
      console.error('Error removing team member from project:', error);
      throw error;
    }
  },

  async addProject(project: Omit<Project, 'id' | 'phases'>): Promise<Project> {
    // Get the current session first, then check user
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('User must be authenticated to create projects');
    }

    const user = session.user;

    const { data, error } = await supabase
      .from('projects')
      .insert({
        name: project.name,
        description: project.description,
        current_phase: project.currentPhase,
        start_date: project.startDate,
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding project:', error);
      throw error;
    }

    // Create default phases for the new project
    const defaultPhases = [
      { name: 'Fase 1: Fundering en Grondwerk', description: 'Uitgraven, fundering gieten en grondwerk voorbereiden' },
      { name: 'Fase 2: Muren en Structuur', description: 'Muren optrekken, kolommen en balken plaatsen' },
      { name: 'Fase 3: Dak en Dakbedekking', description: 'Dakconstructie, dakpannen en dakgoten installeren' }
    ];

    const phaseInserts = defaultPhases.map((phase, index) => ({
      project_id: data.id,
      phase_number: index + 1,
      name: phase.name,
      description: phase.description,
      completed: false,
      locked: index > 0
    }));

    const { error: phasesError } = await supabase
      .from('project_phases')
      .insert(phaseInserts);

    if (phasesError) {
      console.error('Error creating default phases:', phasesError);
      throw phasesError;
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      currentPhase: data.current_phase || 1,
      startDate: data.start_date || new Date().toISOString().split('T')[0],
      teamMembers: [],
        phases: defaultPhases.map((phase, index) => ({
          id: index + 1,
          name: phase.name,
          description: phase.description,
          completed: false,
          locked: index > 0,
          color_index: index,
          start_date: undefined,
          end_date: undefined,
          actual_start_date: undefined,
          actual_end_date: undefined,
          estimated_duration_days: undefined,
          checklist: getPhaseChecklist(index + 1),
          materials: [],
          labour: []
        }))
    };
  },

  async updateProject(project: Project): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .update({
        name: project.name,
        description: project.description,
        current_phase: project.currentPhase,
        start_date: project.startDate,
        // Extended project info fields
        address: project.address || null,
        postal_code: project.postal_code || null,
        city: project.city || null,
        building_year: project.building_year || null,
        existing_building_type: project.existing_building_type || null,
        transformation_description: project.transformation_description || null,
        number_of_units_after_split: project.number_of_units_after_split || null,
        unit_areas: project.unit_areas as any || null,
        unit_purposes: project.unit_purposes as any || null,
        installation_concept: project.installation_concept as any || null,
        unit_access_type: project.unit_access_type || null,
        energy_labels: project.energy_labels as any || null,
        project_manager: project.project_manager || null,
        executor: project.executor || null,
        planned_delivery_date: project.planned_delivery_date || null,
        special_considerations: project.special_considerations || null,
      })
      .eq('id', project.id);

    if (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  async deleteProject(projectId: string): Promise<void> {
    // Get current user for authorization check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    // Delete the project (CASCADE should handle related data)
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }
};
