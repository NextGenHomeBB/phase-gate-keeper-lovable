
import { FolderOpen, CheckCircle } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useLanguage } from "@/contexts/LanguageContext";

interface Project {
  id: string;
  name: string;
  description: string;
  phases: { completed: boolean }[];
  currentPhase: number;
  startDate: string;
  teamMembers: string[];
}

interface ProjectsListProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project | null) => void;
  onViewChange: (view: 'dashboard' | 'team' | 'reports' | 'settings') => void;
}

export function ProjectsList({ projects, selectedProject, onSelectProject, onViewChange }: ProjectsListProps) {
  const { t } = useLanguage();

  const getProjectProgress = (project: Project) => {
    const completedPhases = project.phases.filter(phase => phase.completed).length;
    return (completedPhases / 20) * 100;
  };

  return (
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
  );
}
