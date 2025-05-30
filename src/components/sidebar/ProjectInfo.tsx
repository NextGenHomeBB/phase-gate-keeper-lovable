
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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

interface ProjectInfoProps {
  selectedProject: Project;
}

export function ProjectInfo({ selectedProject }: ProjectInfoProps) {
  const { t } = useLanguage();

  const getProjectProgress = (project: Project) => {
    const completedPhases = project.phases.filter(phase => phase.completed).length;
    return (completedPhases / 20) * 100;
  };

  return (
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
  );
}
