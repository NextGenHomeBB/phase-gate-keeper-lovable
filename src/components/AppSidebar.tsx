
import {
  Sidebar,
  SidebarContent,
} from "@/components/ui/sidebar";
import { Project } from "@/pages/Index";
import { AppSidebarHeader } from "@/components/sidebar/SidebarHeader";
import { NavigationMenu } from "@/components/sidebar/NavigationMenu";
import { ProjectInfo } from "@/components/sidebar/ProjectInfo";
import { ProjectsList } from "@/components/sidebar/ProjectsList";

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
  return (
    <Sidebar className="border-r border-gray-200">
      <AppSidebarHeader />
      
      <SidebarContent>
        <NavigationMenu 
          currentView={currentView}
          onViewChange={onViewChange}
          onSelectProject={onSelectProject}
        />

        {selectedProject && (
          <ProjectInfo selectedProject={selectedProject} />
        )}

        <ProjectsList 
          projects={projects}
          selectedProject={selectedProject}
          onSelectProject={onSelectProject}
          onViewChange={onViewChange}
        />
      </SidebarContent>
    </Sidebar>
  );
}
