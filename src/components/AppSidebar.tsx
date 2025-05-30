
import { Home, FolderOpen, Settings, Users, BarChart3, CheckCircle, Clock } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/pages/Index";
import { useLanguage } from "@/contexts/LanguageContext";

interface AppSidebarProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project | null) => void;
  currentView: 'dashboard' | 'team' | 'reports' | 'settings';
  onViewChange: (view: 'dashboard' | 'team' | 'reports' | 'settings') => void;
}

export function AppSidebar({ 
  projects, 
  selectedProject, 
  onSelectProject,
  currentView,
  onViewChange
}: AppSidebarProps) {
  const { t } = useLanguage();

  const handleNavigationClick = (view: 'dashboard' | 'team' | 'reports' | 'settings') => {
    onViewChange(view);
    onSelectProject(null); // Clear selected project when navigating
  };

  const getProjectProgress = (project: Project) => {
    const completedPhases = project.phases.filter(phase => phase.completed).length;
    return (completedPhases / 20) * 100;
  };

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-blue-900">{t('navigation.projectManagement')}</h2>
          <SidebarTrigger className="h-8 w-8 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-md transition-colors duration-200" />
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('navigation.navigation')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => handleNavigationClick('dashboard')}
                  className={currentView === 'dashboard' && !selectedProject ? "bg-blue-100 text-blue-700" : ""}
                >
                  <Home className="w-4 h-4" />
                  <span>{t('navigation.dashboard')}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleNavigationClick('reports')}
                  className={currentView === 'reports' ? "bg-blue-100 text-blue-700" : ""}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>{t('navigation.reports')}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleNavigationClick('team')}
                  className={currentView === 'team' ? "bg-blue-100 text-blue-700" : ""}
                >
                  <Users className="w-4 h-4" />
                  <span>{t('navigation.team')}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleNavigationClick('settings')}
                  className={currentView === 'settings' ? "bg-blue-100 text-blue-700" : ""}
                >
                  <Settings className="w-4 h-4" />
                  <span>{t('navigation.settings')}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Selected Project Info Section */}
        {selectedProject && (
          <SidebarGroup>
            <SidebarGroupLabel>{t('navigation.projectInfo')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-2 py-3 space-y-3">
                <div>
                  <h3 className="font-medium text-sm text-gray-900 truncate" title={selectedProject.name}>
                    {selectedProject.name}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {selectedProject.description}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">{t('project.progress')}</span>
                    <span className="text-xs font-medium">
                      {Math.round(getProjectProgress(selectedProject))}%
                    </span>
                  </div>
                  <Progress value={getProjectProgress(selectedProject)} className="h-2" />
                  <div className="text-xs text-gray-500">
                    {selectedProject.phases.filter(p => p.completed).length}/20 {t('project.phasesCompleted')}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">{t('project.currentPhase')}</span>
                  <Badge variant="outline" className="text-xs">
                    {t('project.phase')} {selectedProject.currentPhase}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">{t('project.startDate')}</span>
                  <span className="text-xs text-gray-700">
                    {new Date(selectedProject.startDate).toLocaleDateString('nl-NL')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">{t('project.teamMembers')}</span>
                  <span className="text-xs text-gray-700">
                    {selectedProject.teamMembers.length}
                  </span>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>{t('navigation.projects')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton 
                    onClick={() => {
                      onSelectProject(project);
                      onViewChange('dashboard');
                    }}
                    className={selectedProject?.id === project.id ? "bg-blue-100 text-blue-700" : ""}
                  >
                    <FolderOpen className="w-4 h-4" />
                    <div className="flex flex-col items-start min-w-0 flex-1">
                      <span className="text-sm font-medium truncate w-full">{project.name}</span>
                      <div className="flex items-center space-x-2 w-full">
                        <span className="text-xs text-gray-500">
                          {t('project.phase')} {project.currentPhase}/20
                        </span>
                        {project.phases.filter(p => p.completed).length > 0 && (
                          <div className="flex items-center">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-green-600 ml-1">
                              {Math.round(getProjectProgress(project))}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
