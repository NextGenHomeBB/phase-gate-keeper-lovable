import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ProjectDashboard } from "@/components/ProjectDashboard";
import { ProjectDetail } from "@/components/ProjectDetail";
import { TeamPage, TeamMember } from "@/components/TeamPage";
import { UserMenu } from "@/components/UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { projectService } from "@/services/projectService";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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
  projectFiles?: {
    id: string;
    name: string;
    data: string;
    uploadedAt: string;
  }[];
}

const Index = () => {
  const {
    user,
    loading
  } = useAuth();
  const { role, isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'team' | 'reports' | 'settings'>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Load projects when user is authenticated
  useEffect(() => {
    async function loadProjects() {
      if (!user || roleLoading) return;
      
      try {
        setProjectsLoading(true);
        const fetchedProjects = await projectService.fetchProjects();
        setProjects(fetchedProjects);
      } catch (error) {
        console.error('Error loading projects:', error);
        toast({
          title: "Fout",
          description: "Kon projecten niet laden",
          variant: "destructive",
        });
      } finally {
        setProjectsLoading(false);
      }
    }

    loadProjects();
  }, [user, roleLoading, toast]);

  // Show loading spinner while checking auth
  if (loading || roleLoading) {
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

  const updateProject = async (updatedProject: Project) => {
    try {
      await projectService.updateProject(updatedProject);
      setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
      setSelectedProject(updatedProject);
      toast({
        title: "Project bijgewerkt",
        description: "Het project is succesvol bijgewerkt",
      });
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: "Fout",
        description: "Kon project niet bijwerken",
        variant: "destructive",
      });
    }
  };

  const handleReorderProjects = async (reorderedProjects: Project[]) => {
    try {
      setProjects(reorderedProjects);
      // Here you could add API call to persist the new order if needed
      // await projectService.updateProjectOrder(reorderedProjects);
    } catch (error) {
      console.error('Error reordering projects:', error);
      toast({
        title: "Fout",
        description: "Kon project volgorde niet bijwerken",
        variant: "destructive",
      });
    }
  };

  const handleAddProject = async () => {
    if (!isAdmin()) {
      toast({
        title: "Geen toegang",
        description: "Alleen administrators kunnen projecten toevoegen",
        variant: "destructive",
      });
      return;
    }

    const newProject: Omit<Project, 'id' | 'phases'> = {
      name: `Nieuw Project ${projects.length + 1}`,
      description: "Beschrijving van het nieuwe project",
      currentPhase: 1,
      startDate: new Date().toISOString().split('T')[0],
      teamMembers: [],
    };
    
    try {
      const addedProject = await projectService.addProject(newProject);
      setProjects([...projects, addedProject]);
      toast({
        title: "Project toegevoegd",
        description: "Het nieuwe project is succesvol aangemaakt",
      });
    } catch (error) {
      console.error('Error adding project:', error);
      toast({
        title: "Fout",
        description: "Kon project niet toevoegen",
        variant: "destructive",
      });
    }
  };

  const handleBackToProjectDashboard = () => {
    setSelectedProject(null);
  };

  const renderMainContent = () => {
    if (selectedProject) {
      return <ProjectDetail 
        project={selectedProject} 
        onUpdateProject={updateProject} 
        onBack={handleBackToProjectDashboard}
      />;
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Gebruiker Informatie</h2>
              <div className="space-y-2">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Naam:</strong> {user.user_metadata?.full_name || 'Niet ingesteld'}</p>
                <p><strong>Rol:</strong> {role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Laden...'}</p>
                <p><strong>Account aangemaakt:</strong> {new Date(user.created_at).toLocaleDateString('nl-NL')}</p>
              </div>
            </div>
          </div>;
      default:
        return <ProjectDashboard 
          projects={projects} 
          onSelectProject={setSelectedProject} 
          onAddProject={handleAddProject}
          onUpdateProject={updateProject}
          onReorderProjects={handleReorderProjects}
          loading={projectsLoading}
          canAddProjects={isAdmin()}
        />;
    }
  };

  return <div className="min-h-screen bg-gray-50">
      <SidebarProvider>
        <div className="flex w-full min-h-screen">
          <AppSidebar 
            projects={projects} 
            selectedProject={selectedProject} 
            onSelectProject={setSelectedProject} 
            currentView={currentView} 
            onViewChange={setCurrentView} 
          />
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
