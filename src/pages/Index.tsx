import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ProjectDashboard } from "@/components/ProjectDashboard";
import { ProjectDetail } from "@/components/ProjectDetail";
import { TeamPage, TeamMember } from "@/components/TeamPage";
import { UserMenu } from "@/components/UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
export interface ChecklistItem {
  id: string;
  description: string;
  completed: boolean;
  required: boolean;
  photos?: string[]; // Array of base64 encoded images
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
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'team' | 'reports' | 'settings'>('dashboard');

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Show loading spinner while checking auth
  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Laden...</p>
        </div>
      </div>;
  }

  // Don't render anything if not authenticated
  if (!user) {
    return null;
  }

  // Sample project data - in een echte app zou dit uit een database komen
  const [projects, setProjects] = useState<Project[]>([{
    id: "1",
    name: "OETEWALERSTRAAT 42",
    description: "Volledig herontwerp van de bedrijfswebsite",
    currentPhase: 1,
    startDate: "2024-01-15",
    teamMembers: ["Alice Johnson", "Bob Smith", "Carol Williams"],
    phases: Array.from({
      length: 20
    }, (_, i) => ({
      id: i + 1,
      name: `Fase ${i + 1}: ${getPhaseName(i + 1)}`,
      description: getPhaseDescription(i + 1),
      completed: i === 0,
      locked: i > 1,
      checklist: getPhaseChecklist(i + 1)
    }))
  }, {
    id: "2",
    name: "Mobile App Development",
    description: "Ontwikkeling van een nieuwe mobiele applicatie",
    currentPhase: 3,
    startDate: "2024-02-01",
    teamMembers: ["David Brown", "Emma Davis", "Frank Wilson"],
    phases: Array.from({
      length: 20
    }, (_, i) => ({
      id: i + 1,
      name: `Fase ${i + 1}: ${getPhaseName(i + 1)}`,
      description: getPhaseDescription(i + 1),
      completed: i < 2,
      locked: i > 3,
      checklist: getPhaseChecklist(i + 1)
    }))
  }]);

  // Sample team members data
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([{
    id: "1",
    name: "Alice Johnson",
    email: "alice@nextgenhome.nl",
    role: "Project Manager",
    phone: "+31 6 12345678",
    startDate: "2024-01-15"
  }, {
    id: "2",
    name: "Bob Smith",
    email: "bob@nextgenhome.nl",
    role: "Frontend Developer",
    phone: "+31 6 87654321",
    startDate: "2024-02-01"
  }, {
    id: "3",
    name: "Carol Williams",
    email: "carol@nextgenhome.nl",
    role: "UX Designer",
    startDate: "2024-01-20"
  }]);
  const updateProject = (updatedProject: Project) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
    setSelectedProject(updatedProject);
  };
  const handleAddProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: `Nieuw Project ${projects.length + 1}`,
      description: "Beschrijving van het nieuwe project",
      currentPhase: 1,
      startDate: new Date().toISOString().split('T')[0],
      teamMembers: [],
      phases: Array.from({
        length: 20
      }, (_, i) => ({
        id: i + 1,
        name: `Fase ${i + 1}: ${getPhaseName(i + 1)}`,
        description: getPhaseDescription(i + 1),
        completed: false,
        locked: i > 0,
        checklist: getPhaseChecklist(i + 1)
      }))
    };
    
    setProjects([...projects, newProject]);
  };
  const renderMainContent = () => {
    if (selectedProject) {
      return <ProjectDetail project={selectedProject} onUpdateProject={updateProject} />;
    }
    switch (currentView) {
      case 'team':
        return <TeamPage teamMembers={teamMembers} onUpdateTeamMembers={setTeamMembers} />;
      case 'reports':
        return <div className="space-y-6">
            <h1 className="text-3xl font-bold text-blue-900">Rapportages</h1>
            <p className="text-gray-600">Rapportage functionaliteit komt binnenkort...</p>
          </div>;
      case 'settings':
        return <div className="space-y-6">
            <h1 className="text-3xl font-bold text-blue-900">Instellingen</h1>
            <p className="text-gray-600">Instellingen functionaliteit komt binnenkort...</p>
          </div>;
      default:
        return <ProjectDashboard 
          projects={projects} 
          onSelectProject={setSelectedProject} 
          onAddProject={handleAddProject}
          onUpdateProject={updateProject}
        />;
    }
  };
  return <div className="min-h-screen bg-gray-50">
      <SidebarProvider>
        <div className="flex w-full min-h-screen">
          <AppSidebar projects={projects} selectedProject={selectedProject} onSelectProject={setSelectedProject} currentView={currentView} onViewChange={setCurrentView} />
          <main className="flex-1 flex flex-col">
            {/* Header with logo and user menu */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <img alt="NextGen Home Logo" src="/lovable-uploads/2c4e8ba9-0963-4b30-b4f2-c9aec6f9e323.jpg" className="h-48 w-auto object-contain" />
                {!user && <Button onClick={() => navigate('/auth')}>
                    Inloggen
                  </Button>}
              </div>
              <div className="flex items-center gap-4">
                <UserMenu />
              </div>
            </header>
            
            {/* Main content */}
            <div className="flex-1 p-6">
              {renderMainContent()}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>;
};

// Helper functions voor sample data
function getPhaseName(phaseNumber: number): string {
  const phases = ["Projectinitiatie", "Requirements Analyse", "Ontwerp", "Planning", "Ontwikkeling Setup", "Frontend Ontwikkeling", "Backend Ontwikkeling", "Database Implementatie", "API Ontwikkeling", "Testing Setup", "Unit Testing", "Integratie Testing", "Performance Testing", "Security Testing", "User Acceptance Testing", "Deployment Voorbereiding", "Productie Deploy", "Monitoring Setup", "Documentatie", "Project Afsluiting"];
  return phases[phaseNumber - 1] || `Fase ${phaseNumber}`;
}
function getPhaseDescription(phaseNumber: number): string {
  const descriptions = ["Projectdoelen definiëren en stakeholders identificeren", "Gedetailleerde requirements verzamelen en documenteren", "Technische architectuur en UI/UX ontwerp maken", "Projectplanning en tijdlijnen opstellen", "Ontwikkelomgeving en tools configureren", "User interface en frontend componenten bouwen", "Server-side logica en functionaliteit implementeren", "Database schema ontwerpen en implementeren", "API endpoints ontwikkelen en documenteren", "Test frameworks en procedures opzetten", "Individuele componenten en functies testen", "Systeem integratie en data flow testen", "Prestaties en schaalbaarheid evalueren", "Beveiligingsaudit en penetratietests uitvoeren", "Eindgebruiker acceptatie tests uitvoeren", "Productieomgeving voorbereiden en configureren", "Live deployment en go-live activiteiten", "Monitoring en alerting systemen activeren", "Technische en gebruikersdocumentatie completeren", "Project evaluatie en knowledge transfer"];
  return descriptions[phaseNumber - 1] || `Beschrijving voor fase ${phaseNumber}`;
}
function getPhaseChecklist(phaseNumber: number): ChecklistItem[] {
  // Sample checklist items - in echte app zouden dit meer specifieke items zijn
  const baseItems = ["Alle stakeholders geïnformeerd", "Documentatie bijgewerkt", "Kwaliteitscontrole uitgevoerd", "Deliverables goedgekeurd door projectleider"];
  return baseItems.map((item, index) => ({
    id: `${phaseNumber}-${index}`,
    description: item,
    completed: false,
    required: true
  }));
}
export default Index;
