import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, Plus, Edit3, Shield, Copy, GripVertical, TrendingUp, Trash2, CalendarDays } from "lucide-react";
import { Project } from "@/pages/Index";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { useLanguage } from "@/contexts/LanguageContext";
import { ProjectDateDialog } from "@/components/ProjectDateDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProjectDashboardProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onAddProject: () => void;
  onUpdateProject: (project: Project) => void;
  onDeleteProject?: (projectId: string) => void;
  onReorderProjects?: (projects: Project[]) => void;
  loading?: boolean;
  canAddProjects?: boolean;
}

interface DragState {
  isDragging: boolean;
  draggedIndex: number | null;
  draggedProject: Project | null;
  startY: number;
  currentY: number;
  longPressTimer: NodeJS.Timeout | null;
}

export function ProjectDashboard({ 
  projects, 
  onSelectProject, 
  onAddProject, 
  onUpdateProject,
  onDeleteProject,
  onReorderProjects,
  loading = false,
  canAddProjects = false
}: ProjectDashboardProps) {
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [dateDialogOpen, setDateDialogOpen] = useState(false);
  const [projectForDate, setProjectForDate] = useState<Project | null>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedIndex: null,
    draggedProject: null,
    startY: 0,
    currentY: 0,
    longPressTimer: null
  });
  const { toast } = useToast();
  const { isAdmin } = useUserRole();
  const { t } = useLanguage();
  const dragRef = useRef<HTMLDivElement>(null);

  const handleEditStart = (project: Project) => {
    setEditingProject(project.id);
    setEditName(project.name);
  };

  const handleDescriptionEditStart = (project: Project) => {
    setEditingDescription(project.id);
    setEditDescription(project.description);
  };

  const handleEditSave = (project: Project) => {
    if (editName.trim() && editName !== project.name) {
      const uppercaseName = editName.trim().toUpperCase();
      const updatedProject = { ...project, name: uppercaseName };
      onUpdateProject(updatedProject);
      toast({
        title: t('dashboard.projectNameUpdated'),
        description: `${t('dashboard.projectRenamed')} "${uppercaseName}"`,
      });
    }
    setEditingProject(null);
    setEditName("");
  };

  const handleDescriptionSave = (project: Project) => {
    if (editDescription.trim() !== project.description) {
      const updatedProject = { ...project, description: editDescription.trim() };
      onUpdateProject(updatedProject);
      toast({
        title: t('dashboard.projectDescriptionUpdated'),
        description: t('dashboard.descriptionUpdateSuccess'),
      });
    }
    setEditingDescription(null);
    setEditDescription("");
  };

  const handleEditCancel = () => {
    setEditingProject(null);
    setEditName("");
  };

  const handleDescriptionCancel = () => {
    setEditingDescription(null);
    setEditDescription("");
  };

  const handleKeyPress = (e: React.KeyboardEvent, project: Project) => {
    if (e.key === 'Enter') {
      handleEditSave(project);
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  const handleDescriptionKeyPress = (e: React.KeyboardEvent, project: Project) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleDescriptionSave(project);
    } else if (e.key === 'Escape') {
      handleDescriptionCancel();
    }
  };

  const handleCopyProject = async (project: Project) => {
    try {
      const { projectService } = await import("@/services/projectService");
      
      const newProject: Omit<Project, 'id' | 'phases'> = {
        name: `${project.name} (COPY)`,
        description: project.description,
        currentPhase: 1,
        startDate: new Date().toISOString().split('T')[0],
        teamMembers: [...project.teamMembers],
      };
      
      const addedProject = await projectService.addProject(newProject);
      
      toast({
        title: t('dashboard.projectCopied'),
        description: `"${addedProject.name}" ${t('dashboard.projectCopySuccess')}`,
      });
      
      window.location.reload();
    } catch (error) {
      console.error('Error copying project:', error);
      toast({
        title: t('common.error'),
        description: t('dashboard.copyError'),
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete || !onDeleteProject) return;

    try {
      await onDeleteProject(projectToDelete.id);
      toast({
        title: t('project.deleted'),
        description: `"${projectToDelete.name}" ${t('project.deleteSuccess')}`,
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: t('common.error'),
        description: t('project.deleteError'),
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  const startLongPress = (e: React.TouchEvent | React.MouseEvent, project: Project, index: number) => {
    e.preventDefault();
    
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const timer = setTimeout(() => {
      setDragState({
        isDragging: true,
        draggedIndex: index,
        draggedProject: project,
        startY: clientY,
        currentY: clientY,
        longPressTimer: null
      });
      
      toast({
        title: t('dashboard.dragStarted'),
        description: t('dashboard.dragInstruction'),
      });
    }, 500); // 500ms long press

    setDragState(prev => ({
      ...prev,
      longPressTimer: timer
    }));
  };

  const cancelLongPress = () => {
    if (dragState.longPressTimer) {
      clearTimeout(dragState.longPressTimer);
      setDragState(prev => ({
        ...prev,
        longPressTimer: null
      }));
    }
  };

  const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!dragState.isDragging) return;
    
    e.preventDefault();
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setDragState(prev => ({
      ...prev,
      currentY: clientY
    }));
  };

  const handleDragEnd = (e: React.TouchEvent | React.MouseEvent) => {
    cancelLongPress();
    
    if (!dragState.isDragging || dragState.draggedIndex === null) {
      setDragState({
        isDragging: false,
        draggedIndex: null,
        draggedProject: null,
        startY: 0,
        currentY: 0,
        longPressTimer: null
      });
      return;
    }

    const clientY = 'touches' in e ? e.changedTouches[0].clientY : e.clientY;
    const cardHeight = 120; // Approximate card height
    const deltaY = clientY - dragState.startY;
    const newIndex = Math.max(0, Math.min(projects.length - 1, dragState.draggedIndex + Math.round(deltaY / cardHeight)));

    if (newIndex !== dragState.draggedIndex && onReorderProjects) {
      const newProjects = [...projects];
      const [draggedProject] = newProjects.splice(dragState.draggedIndex, 1);
      newProjects.splice(newIndex, 0, draggedProject);
      
      onReorderProjects(newProjects);
      
      toast({
        title: t('dashboard.projectMoved'),
        description: `"${dragState.draggedProject?.name}" ${t('dashboard.projectMovedSuccess')}`,
      });
    }

    setDragState({
      isDragging: false,
      draggedIndex: null,
      draggedProject: null,
      startY: 0,
      currentY: 0,
      longPressTimer: null
    });
  };

  const handleProjectClick = (project: Project, e: React.MouseEvent) => {
    // Prevent opening project if we're currently editing or dragging
    if (editingProject === project.id || editingDescription === project.id || dragState.isDragging) {
      e.stopPropagation();
      return;
    }
    onSelectProject(project);
  };

  const getProgressPercentage = (project: Project) => {
    const completedPhases = project.phases.filter(phase => phase.completed).length;
    return (completedPhases / project.phases.length) * 100;
  };

  // Sort projects by completion percentage (highest first)
  const sortedProjects = [...projects].sort((a, b) => {
    const progressA = getProgressPercentage(a);
    const progressB = getProgressPercentage(b);
    return progressB - progressA;
  });

  const getCurrentPhaseName = (project: Project) => {
    const currentPhase = project.phases.find(phase => phase.id === project.currentPhase);
    return currentPhase ? currentPhase.name : `Fase ${project.currentPhase}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-900">{t('dashboard.title')}</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Project Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">{t('dashboard.title')}</h1>
            <p className="text-gray-600 mt-2">{t('dashboard.subtitle')}</p>
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <TrendingUp className="w-4 h-4 mr-1" />
              Sorted by completion percentage
            </div>
            {isAdmin && (
              <div className="flex items-center mt-1 text-sm text-blue-600">
                <Shield className="w-4 h-4 mr-1" />
                {t('dashboard.adminRights')}
              </div>
            )}
          </div>
          {canAddProjects && (
            <Button onClick={onAddProject} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              {t('dashboard.newProject')}
            </Button>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('dashboard.noProjects')}</h3>
            <p className="text-gray-600 mb-6">
              {canAddProjects 
                ? t('dashboard.noProjectsSubtitle')
                : t('dashboard.noProjectsUser')
              }
            </p>
            {canAddProjects && (
              <Button onClick={onAddProject} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                {t('dashboard.addFirstProject')}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4" ref={dragRef}>
            {sortedProjects.map((project, index) => (
              <Card 
                key={project.id} 
                className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${
                  dragState.isDragging && dragState.draggedIndex === index 
                    ? 'opacity-50 scale-105 shadow-2xl transform' 
                    : ''
                }`}
                style={{
                  transform: dragState.isDragging && dragState.draggedIndex === index 
                    ? `translateY(${dragState.currentY - dragState.startY}px)` 
                    : 'none'
                }}
                onClick={(e) => handleProjectClick(project, e)}
                onTouchStart={(e) => startLongPress(e, project, index)}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
                onMouseDown={(e) => startLongPress(e, project, index)}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={cancelLongPress}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        {editingProject === project.id ? (
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onBlur={() => handleEditSave(project)}
                            onKeyDown={(e) => handleKeyPress(e, project)}
                            className="text-lg font-semibold"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <div className="flex items-center justify-between group">
                            <CardTitle 
                              className="text-lg mb-1 hover:text-blue-600 transition-colors cursor-pointer"
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                canAddProjects && handleEditStart(project);
                              }}
                            >
                              {project.name}
                            </CardTitle>
                             <div className="flex items-center gap-1">
                               {canAddProjects && (
                                 <>
                                   <Button
                                     variant="ghost"
                                     size="sm"
                                     className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       setProjectForDate(project);
                                       setDateDialogOpen(true);
                                     }}
                                   >
                                     <CalendarDays className="w-3 h-3" />
                                   </Button>
                                   <Button
                                     variant="ghost"
                                     size="sm"
                                     className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       handleEditStart(project);
                                     }}
                                   >
                                     <Edit3 className="w-3 h-3" />
                                   </Button>
                                   <Button
                                     variant="ghost"
                                     size="sm"
                                     className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       handleCopyProject(project);
                                     }}
                                   >
                                     <Copy className="w-3 h-3" />
                                   </Button>
                                   <Button
                                     variant="ghost"
                                     size="sm"
                                     className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                     onClick={(e) => handleDeleteClick(project, e)}
                                   >
                                     <Trash2 className="w-3 h-3" />
                                   </Button>
                                 </>
                               )}
                             </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {editingDescription === project.id ? (
                    <Textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      onBlur={() => handleDescriptionSave(project)}
                      onKeyDown={(e) => handleDescriptionKeyPress(e, project)}
                      className="min-h-[60px] resize-none"
                      placeholder="Project beschrijving..."
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div className="flex items-start justify-between group">
                      <CardDescription 
                        className="line-clamp-2 cursor-text hover:text-gray-800 transition-colors flex-1"
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          canAddProjects && handleDescriptionEditStart(project);
                        }}
                      >
                        {project.description}
                      </CardDescription>
                      {canAddProjects && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 ml-2 mt-0 flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDescriptionEditStart(project);
                          }}
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t('dashboard.progress')}</span>
                      <span className="font-medium">{Math.round(getProgressPercentage(project))}%</span>
                    </div>
                    <Progress value={getProgressPercentage(project)} className="h-2" />
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{t('dashboard.start')}: {new Date(project.startDate).toLocaleDateString('nl-NL')}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{project.teamMembers.length} {t('dashboard.teamMembers')}</span>
                    </div>
                    
                    <div className="bg-blue-50 px-3 py-2 rounded-md">
                      <span className="text-blue-700 font-medium text-xs">
                        {t('dashboard.currentPhase')}: {getCurrentPhaseName(project)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              This action is permanent and cannot be undone. The project "{projectToDelete?.name}" and all its data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {projectForDate && (
        <ProjectDateDialog
          open={dateDialogOpen}
          onOpenChange={setDateDialogOpen}
          project={projectForDate}
          onUpdateProject={onUpdateProject}
        />
      )}
    </>
  );
}
