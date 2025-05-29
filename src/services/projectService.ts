
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/pages/Index';

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

    // For now, return projects with sample phase data since phase structure is complex
    return (data || []).map(project => ({
      id: project.id,
      name: project.name,
      description: project.description || '',
      currentPhase: project.current_phase || 1,
      startDate: project.start_date || new Date().toISOString().split('T')[0],
      teamMembers: [],
      phases: Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        name: `Fase ${i + 1}: ${getPhaseName(i + 1)}`,
        description: getPhaseDescription(i + 1),
        completed: i < (project.current_phase || 1) - 1,
        locked: i >= (project.current_phase || 1),
        checklist: getPhaseChecklist(i + 1)
      }))
    }));
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

// Helper functions (same as in Index.tsx)
function getPhaseName(phaseNumber: number): string {
  const phases = ["Projectinitiatie", "Requirements Analyse", "Ontwerp", "Planning", "Ontwikkeling Setup", "Frontend Ontwikkeling", "Backend Ontwikkeling", "Database Implementatie", "API Ontwikkeling", "Testing Setup", "Unit Testing", "Integratie Testing", "Performance Testing", "Security Testing", "User Acceptance Testing", "Deployment Voorbereiding", "Productie Deploy", "Monitoring Setup", "Documentatie", "Project Afsluiting"];
  return phases[phaseNumber - 1] || `Fase ${phaseNumber}`;
}

function getPhaseDescription(phaseNumber: number): string {
  const descriptions = ["Projectdoelen definiëren en stakeholders identificeren", "Gedetailleerde requirements verzamelen en documenteren", "Technische architectuur en UI/UX ontwerp maken", "Projectplanning en tijdlijnen opstellen", "Ontwikkelomgeving en tools configureren", "User interface en frontend componenten bouwen", "Server-side logica en functionaliteit implementeren", "Database schema ontwerpen en implementeren", "API endpoints ontwikkelen en documenteren", "Test frameworks en procedures opzetten", "Individuele componenten en functies testen", "Systeem integratie en data flow testen", "Prestaties en schaalbaarheid evalueren", "Beveiligingsaudit en penetratietests uitvoeren", "Eindgebruiker acceptatie tests uitvoeren", "Productieomgeving voorbereiden en configureren", "Live deployment en go-live activiteiten", "Monitoring en alerting systemen activeren", "Technische en gebruikersdocumentatie completeren", "Project evaluatie en knowledge transfer"];
  return descriptions[phaseNumber - 1] || `Beschrijving voor fase ${phaseNumber}`;
}

function getPhaseChecklist(phaseNumber: number) {
  const baseItems = ["Alle stakeholders geïnformeerd", "Documentatie bijgewerkt", "Kwaliteitscontrole uitgevoerd", "Deliverables goedgekeurd door projectleider"];
  return baseItems.map((item, index) => ({
    id: `${phaseNumber}-${index}`,
    description: item,
    completed: false,
    required: true
  }));
}
