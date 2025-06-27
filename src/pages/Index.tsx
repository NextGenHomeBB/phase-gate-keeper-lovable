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
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export interface ChecklistItem {
  id: string;
  description: string;
  completed: boolean;
  required?: boolean;
  photos?: string[]; // Array of base64 encoded images
  notes?: string;
}

export interface Material {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  estimatedCost?: number;
}

export interface Phase {
  id: number;
  name: string;
  description: string;
  completed: boolean;
  locked: boolean;
  color_index?: number | null; // Add color_index field
  checklist: ChecklistItem[];
  materials: Material[];
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
  const { role, isAdmin, loading: roleLoading } = useUserRole();
  const { t } = useLanguage();
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
          title: t('common.error'),
          description: t('project.loadError'),
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
          <p className="mt-4 text-gray-600">{t('loading.text')}</p>
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
        title: t('project.updated'),
        description: t('project.updateSuccess'),
      });
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: t('common.error'),
        description: t('project.updateError'),
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
        title: t('common.error'),
        description: t('project.reorderError'),
        variant: "destructive",
      });
    }
  };

  const handleAddProject = async () => {
    if (!isAdmin()) {
      toast({
        title: t('common.noAccess'),
        description: t('project.adminOnly'),
        variant: "destructive",
      });
      return;
    }

    const newProject: Omit<Project, 'id' | 'phases'> = {
      name: `${t('project.newProject')} ${projects.length + 1}`,
      description: t('project.newProjectDescription'),
      currentPhase: 1,
      startDate: new Date().toISOString().split('T')[0],
      teamMembers: [],
    };
    
    try {
      const addedProject = await projectService.addProject(newProject);
      setProjects([...projects, addedProject]);
      toast({
        title: t('project.added'),
        description: t('project.addSuccess'),
      });
    } catch (error) {
      console.error('Error adding project:', error);
      toast({
        title: t('common.error'),
        description: t('project.addError'),
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
            <h1 className="text-3xl font-bold text-blue-900">{t('navigation.reports')}</h1>
            <p className="text-gray-600">{t('reports.comingSoon')}</p>
          </div>;
      case 'settings':
        return <div className="space-y-6">
            <h1 className="text-3xl font-bold text-blue-900">{t('navigation.settings')}</h1>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">{t('settings.userInfo')}</h2>
              <div className="space-y-2">
                <p><strong>{t('settings.email')}:</strong> {user.email}</p>
                <p><strong>{t('settings.name')}:</strong> {user.user_metadata?.full_name || t('settings.notSet')}</p>
                <p><strong>{t('settings.role')}:</strong> {role ? role.charAt(0).toUpperCase() + role.slice(1) : t('common.loading')}</p>
                <p><strong>{t('settings.accountCreated')}:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
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
                <img alt="NextGen Home Logo" src="/lovable-uploads/2c4e8ba9-0963-4b30-b4f2-c9aec6f9e323.jpg" className="h-32 w-auto object-contain" />
                {!user && <Button onClick={() => navigate('/auth')}>
                    {t('auth.login')}
                  </Button>}
              </div>
              <div className="flex items-center gap-4">
                <LanguageSwitcher />
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
      { id: "1-1", name: "Beton C20/25", quantity: 15, unit: "m³", category: "Beton" },
      { id: "1-2", name: "Wapening staal", quantity: 800, unit: "kg", category: "Staal" },
      { id: "1-3", name: "Bekisting planken", quantity: 50, unit: "m²", category: "Hout" },
      { id: "1-4", name: "Grind fundering", quantity: 20, unit: "ton", category: "Granulaat" }
    ],
    2: [
      { id: "2-1", name: "Kalkzandsteen", quantity: 500, unit: "stuks", category: "Metselwerk" },
      { id: "2-2", name: "Metselmortel", quantity: 30, unit: "zakken", category: "Mortel" },
      { id: "2-3", name: "Hoekprofielen", quantity: 20, unit: "meter", category: "Staal" },
      { id: "2-4", name: "Latei balken", quantity: 10, unit: "stuks", category: "Beton" }
    ],
    3: [
      { id: "3-1", name: "Dakpannen", quantity: 800, unit: "stuks", category: "Dakbedekking" },
      { id: "3-2", name: "Dakgoten", quantity: 40, unit: "meter", category: "Zinwerk" },
      { id: "3-3", name: "Hemelwaterafvoer", quantity: 4, unit: "stuks", category: "Afvoer" },
      { id: "3-4", name: "Dakbeschot", quantity: 80, unit: "m²", category: "Hout" }
    ],
    4: [
      { id: "4-1", name: "Glaswol isolatie", quantity: 120, unit: "m²", category: "Isolatie" },
      { id: "4-2", name: "Dampscherm folie", quantity: 130, unit: "m²", category: "Folie" },
      { id: "4-3", name: "Tape dampscherm", quantity: 10, unit: "rollen", category: "Afdichting" },
      { id: "4-4", name: "Isolatiepluggen", quantity: 200, unit: "stuks", category: "Bevestiging" }
    ],
    5: [
      { id: "5-1", name: "Elektrische kabel", quantity: 500, unit: "meter", category: "Elektra" },
      { id: "5-2", name: "Stopcontacten", quantity: 25, unit: "stuks", category: "Elektra" },
      { id: "5-3", name: "Schakelaars", quantity: 15, unit: "stuks", category: "Elektra" },
      { id: "5-4", name: "Verdeelkast", quantity: 1, unit: "stuks", category: "Elektra" }
    ]
  };

  // Return materials for the phase, or default materials if not defined
  return materialsByPhase[phaseNumber] || [
    { id: `${phaseNumber}-1`, name: "Standaard materiaal", quantity: 1, unit: "stuks", category: "Diversen" }
  ];
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
