
import { supabase } from "@/integrations/supabase/client";
import { Project, Phase, ChecklistItem, Material } from "@/pages/Index";
import { TeamMember } from "@/components/TeamPage";
import { materialService } from "./materialService";

function getPhaseName(phaseNumber: number): string {
  const phases = [
    "Fundering en Grondwerk",
    "Muren en Structuur", 
    "Dak en Dakbedekking",
    "Isolatie en Dampscherm",
    "Elektrische Installatie",
    "Loodgieterswerk en Sanitair",
    "Vloeren en Ondervloer",
    "Gipsplaten en Afwerking",
    "Ramen en Deuren",
    "Keuken Installatie",
    "Badkamer Afwerking",
    "Schilderwerk Binnen",
    "Vloerbedekking en Tegels",
    "Verlichting en Schakelaars",
    "Buitenafwerking en Gevel",
    "Landschapsarchitectuur",
    "Oprit en Paden",
    "Finale Inspectie",
    "Schoonmaak en Oplevering",
    "Documentatie en Garantie"
  ];
  return phases[phaseNumber - 1] || `Fase ${phaseNumber}`;
}

function getPhaseDescription(phaseNumber: number): string {
  const descriptions = [
    "Uitgraven, fundering gieten en grondwerk voorbereiden",
    "Muren optrekken, kolommen en balken plaatsen", 
    "Dakconstructie, dakpannen en dakgoten installeren",
    "Isolatiemateriaal aanbrengen en dampscherm installeren",
    "Elektrische leidingen trekken en stopcontacten plaatsen",
    "Waterleidingen, riolering en sanitair installeren",
    "Ondervloer voorbereiden en vloerverwarming installeren",
    "Gipsplaten ophangen en voegen afwerken",
    "Ramen en deuren plaatsen en afstellen",
    "Keukenkasten, werkblad en apparatuur installeren",
    "Badkamertegels, sanitair en kranen afwerken",
    "Muren en plafonds schilderen",
    "Laminaat, tegels of andere vloerbedekking leggen",
    "Verlichtingsarmaturen en schakelaars monteren",
    "Gevel afwerken en buitenschilderwerk uitvoeren",
    "Tuin aanleggen en buitenruimte inrichten",
    "Oprit aanleggen en tuinpaden realiseren",
    "Eindcontrole en kwaliteitsinspectie uitvoeren",
    "Grondige schoonmaak en sleutels overdragen",
    "Papierwerk afronden en garantiebewijzen verstrekken"
  ];
  return descriptions[phaseNumber - 1] || `Beschrijving voor fase ${phaseNumber}`;
}

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
}

export const projectService = {
  async fetchProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }

    // For each project, fetch associated team members and materials
    const projectsWithData = await Promise.all(
      (data || []).map(async (project) => {
        const teamMembers = await this.fetchProjectTeamMembers(project.id);
        const materialsByPhase = await materialService.fetchAllMaterialsForProject(project.id);
        
        return {
          id: project.id,
          name: project.name,
          description: project.description || '',
          currentPhase: project.current_phase || 1,
          startDate: project.start_date || new Date().toISOString().split('T')[0],
          teamMembers: teamMembers.map(tm => tm.name),
          phases: Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            name: `Fase ${i + 1}: ${getPhaseName(i + 1)}`,
            description: getPhaseDescription(i + 1),
            completed: i < (project.current_phase || 1) - 1,
            locked: i >= (project.current_phase || 1),
            checklist: getPhaseChecklist(i + 1),
            materials: materialsByPhase[i + 1] || []
          }))
        };
      })
    );

    return projectsWithData;
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
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to create projects');
    }

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

    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      currentPhase: data.current_phase || 1,
      startDate: data.start_date || new Date().toISOString().split('T')[0],
      teamMembers: [],
      phases: Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        name: `Fase ${i + 1}: ${getPhaseName(i + 1)}`,
        description: getPhaseDescription(i + 1),
        completed: i < (data.current_phase || 1) - 1,
        locked: i >= (data.current_phase || 1),
        checklist: getPhaseChecklist(i + 1),
        materials: []
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
        start_date: project.startDate
      })
      .eq('id', project.id);

    if (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }
};
