import { supabase } from "@/integrations/supabase/client";
import { Project, Phase, ChecklistItem, Material } from "@/pages/Index";

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

function getPhaseMaterials(phaseNumber: number): Material[] {
  const materialsByPhase: { [key: number]: Material[] } = {
    1: [
      { id: "1-1", name: "Beton C20/25", quantity: 15, unit: "m³", category: "Beton", estimatedCost: 85.00 },
      { id: "1-2", name: "Wapening staal", quantity: 800, unit: "kg", category: "Staal", estimatedCost: 1.20 },
      { id: "1-3", name: "Bekisting planken", quantity: 50, unit: "m²", category: "Hout", estimatedCost: 25.00 },
      { id: "1-4", name: "Grind fundering", quantity: 20, unit: "ton", category: "Granulaat", estimatedCost: 30.00 }
    ],
    2: [
      { id: "2-1", name: "Kalkzandsteen", quantity: 500, unit: "stuks", category: "Metselwerk", estimatedCost: 2.50 },
      { id: "2-2", name: "Metselmortel", quantity: 30, unit: "zakken", category: "Mortel", estimatedCost: 8.50 },
      { id: "2-3", name: "Hoekprofielen", quantity: 20, unit: "meter", category: "Staal", estimatedCost: 15.00 },
      { id: "2-4", name: "Latei balken", quantity: 10, unit: "stuks", category: "Beton", estimatedCost: 45.00 }
    ],
    3: [
      { id: "3-1", name: "Dakpannen", quantity: 800, unit: "stuks", category: "Dakbedekking", estimatedCost: 1.80 },
      { id: "3-2", name: "Dakgoten", quantity: 40, unit: "meter", category: "Zinwerk", estimatedCost: 25.00 },
      { id: "3-3", name: "Hemelwaterafvoer", quantity: 4, unit: "stuks", category: "Afvoer", estimatedCost: 85.00 },
      { id: "3-4", name: "Dakbeschot", quantity: 80, unit: "m²", category: "Hout", estimatedCost: 18.00 }
    ],
    4: [
      { id: "4-1", name: "Glaswol isolatie", quantity: 120, unit: "m²", category: "Isolatie", estimatedCost: 12.00 },
      { id: "4-2", name: "Dampscherm folie", quantity: 130, unit: "m²", category: "Folie", estimatedCost: 3.50 },
      { id: "4-3", name: "Tape dampscherm", quantity: 10, unit: "rollen", category: "Afdichting", estimatedCost: 15.00 },
      { id: "4-4", name: "Isolatiepluggen", quantity: 200, unit: "stuks", category: "Bevestiging", estimatedCost: 0.25 }
    ],
    5: [
      { id: "5-1", name: "Elektrische kabel", quantity: 500, unit: "meter", category: "Elektra", estimatedCost: 2.80 },
      { id: "5-2", name: "Stopcontacten", quantity: 25, unit: "stuks", category: "Elektra", estimatedCost: 12.00 },
      { id: "5-3", name: "Schakelaars", quantity: 15, unit: "stuks", category: "Elektra", estimatedCost: 8.50 },
      { id: "5-4", name: "Verdeelkast", quantity: 1, unit: "stuks", category: "Elektra", estimatedCost: 350.00 }
    ]
  };

  // Return materials for the phase, or default materials if not defined
  return materialsByPhase[phaseNumber] || [
    { id: `${phaseNumber}-1`, name: "Standaard materiaal", quantity: 1, unit: "stuks", category: "Diversen", estimatedCost: 0 }
  ];
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

    // For each project, fetch associated team members
    const projectsWithTeamMembers = await Promise.all(
      (data || []).map(async (project) => {
        const teamMembers = await this.fetchProjectTeamMembers(project.id);
        
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
            checklist: getPhaseChecklist(i + 1)
          }))
        };
      })
    );

    return projectsWithTeamMembers;
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
        checklist: getPhaseChecklist(i + 1)
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
