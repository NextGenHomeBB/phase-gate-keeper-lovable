
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ProjectDashboard } from "@/components/ProjectDashboard";
import { ProjectDetail } from "@/components/ProjectDetail";

export interface ChecklistItem {
  id: string;
  description: string;
  completed: boolean;
  required: boolean;
}

export interface Phase {
  id: number;
  name: string;
  description: string;
  checklist: ChecklistItem[];
  completed: boolean;
  locked: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  phases: Phase[];
  currentPhase: number;
  startDate: string;
  teamMembers: string[];
}

const Index = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Sample project data - in een echte app zou dit uit een database komen
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      name: "Website Redesign Project",
      description: "Volledig herontwerp van de bedrijfswebsite",
      currentPhase: 1,
      startDate: "2024-01-15",
      teamMembers: ["Alice Johnson", "Bob Smith", "Carol Williams"],
      phases: Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        name: `Fase ${i + 1}: ${getPhaseName(i + 1)}`,
        description: getPhaseDescription(i + 1),
        completed: i === 0,
        locked: i > 1,
        checklist: getPhaseChecklist(i + 1)
      }))
    },
    {
      id: "2", 
      name: "Mobile App Development",
      description: "Ontwikkeling van een nieuwe mobiele applicatie",
      currentPhase: 3,
      startDate: "2024-02-01",
      teamMembers: ["David Brown", "Emma Davis", "Frank Wilson"],
      phases: Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        name: `Fase ${i + 1}: ${getPhaseName(i + 1)}`,
        description: getPhaseDescription(i + 1),
        completed: i < 2,
        locked: i > 3,
        checklist: getPhaseChecklist(i + 1)
      }))
    }
  ]);

  const updateProject = (updatedProject: Project) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
    setSelectedProject(updatedProject);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarProvider>
        <div className="flex w-full min-h-screen">
          <AppSidebar 
            projects={projects}
            selectedProject={selectedProject}
            onSelectProject={setSelectedProject}
          />
          <main className="flex-1 p-6">
            {selectedProject ? (
              <ProjectDetail 
                project={selectedProject} 
                onUpdateProject={updateProject}
              />
            ) : (
              <ProjectDashboard 
                projects={projects}
                onSelectProject={setSelectedProject}
              />
            )}
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

// Helper functions voor sample data
function getPhaseName(phaseNumber: number): string {
  const phases = [
    "Projectinitiatie", "Requirements Analyse", "Ontwerp", "Planning", "Ontwikkeling Setup",
    "Frontend Ontwikkeling", "Backend Ontwikkeling", "Database Implementatie", "API Ontwikkeling", "Testing Setup",
    "Unit Testing", "Integratie Testing", "Performance Testing", "Security Testing", "User Acceptance Testing",
    "Deployment Voorbereiding", "Productie Deploy", "Monitoring Setup", "Documentatie", "Project Afsluiting"
  ];
  return phases[phaseNumber - 1] || `Fase ${phaseNumber}`;
}

function getPhaseDescription(phaseNumber: number): string {
  const descriptions = [
    "Projectdoelen definiëren en stakeholders identificeren",
    "Gedetailleerde requirements verzamelen en documenteren", 
    "Technische architectuur en UI/UX ontwerp maken",
    "Projectplanning en tijdlijnen opstellen",
    "Ontwikkelomgeving en tools configureren",
    "User interface en frontend componenten bouwen",
    "Server-side logica en functionaliteit implementeren",
    "Database schema ontwerpen en implementeren",
    "API endpoints ontwikkelen en documenteren",
    "Test frameworks en procedures opzetten",
    "Individuele componenten en functies testen",
    "Systeem integratie en data flow testen",
    "Prestaties en schaalbaarheid evalueren",
    "Beveiligingsaudit en penetratietests uitvoeren",
    "Eindgebruiker acceptatie tests uitvoeren",
    "Productieomgeving voorbereiden en configureren",
    "Live deployment en go-live activiteiten",
    "Monitoring en alerting systemen activeren",
    "Technische en gebruikersdocumentatie completeren",
    "Project evaluatie en knowledge transfer"
  ];
  return descriptions[phaseNumber - 1] || `Beschrijving voor fase ${phaseNumber}`;
}

function getPhaseChecklist(phaseNumber: number): ChecklistItem[] {
  // Sample checklist items - in echte app zouden dit meer specifieke items zijn
  const baseItems = [
    "Alle stakeholders geïnformeerd",
    "Documentatie bijgewerkt", 
    "Kwaliteitscontrole uitgevoerd",
    "Deliverables goedgekeurd door projectleider"
  ];
  
  return baseItems.map((item, index) => ({
    id: `${phaseNumber}-${index}`,
    description: item,
    completed: false,
    required: true
  }));
}

export default Index;
