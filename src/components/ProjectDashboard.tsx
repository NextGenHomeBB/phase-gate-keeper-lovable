import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, Plus, Edit3, Shield, Copy } from "lucide-react";
import { Project } from "@/pages/Index";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";

interface ProjectDashboardProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onAddProject: () => void;
  onUpdateProject: (project: Project) => void;
  loading?: boolean;
  canAddProjects?: boolean;
}

export function ProjectDashboard({ 
  projects, 
  onSelectProject, 
  onAddProject, 
  onUpdateProject,
  loading = false,
  canAddProjects = false
}: ProjectDashboardProps) {
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const { toast } = useToast();
  const { isAdmin } = useUserRole();

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
        title: "Project naam bijgewerkt",
        description: `Project hernoemd naar "${uppercaseName}"`,
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
        title: "Project beschrijving bijgewerkt",
        description: "De beschrijving is succesvol bijgewerkt",
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
        title: "Project gekopieerd",
        description: `"${addedProject.name}" is succesvol aangemaakt`,
      });
      
      window.location.reload();
    } catch (error) {
      console.error('Error copying project:', error);
      toast({
        title: "Fout",
        description: "Kon project niet kopiëren",
        variant: "destructive",
      });
    }
  };

  const handleProjectClick = (project: Project, e: React.MouseEvent) => {
    if (editingProject === project.id || editingDescription === project.id) {
      e.stopPropagation();
      return;
    }
    onSelectProject(project);
  };

  const getProgressPercentage = (project: Project) => {
    const completedPhases = project.phases.filter(phase => phase.completed).length;
    return (completedPhases / project.phases.length) * 100;
  };

  const getCurrentPhaseName = (project: Project) => {
    const currentPhase = project.phases.find(phase => phase.id === project.currentPhase);
    return currentPhase ? currentPhase.name : `Fase ${project.currentPhase}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-900">Project Dashboard</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Projecten laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Project Dashboard</h1>
          <p className="text-gray-600 mt-2">Overzicht van al je actieve projecten</p>
          {isAdmin && (
            <div className="flex items-center mt-2 text-sm text-blue-600">
              <Shield className="w-4 h-4 mr-1" />
              Administrator rechten actief
            </div>
          )}
        </div>
        {canAddProjects && (
          <Button onClick={onAddProject} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nieuw Project
          </Button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Geen projecten gevonden</h3>
          <p className="text-gray-600 mb-6">
            {canAddProjects 
              ? "Begin met het toevoegen van je eerste project om te starten."
              : "Er zijn nog geen projecten beschikbaar."
            }
          </p>
          {canAddProjects && (
            <Button onClick={onAddProject} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Eerste Project Toevoegen
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card 
              key={project.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={(e) => handleProjectClick(project, e)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
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
                            </>
                          )}
                        </div>
                      </div>
                    )}
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
                  <CardDescription 
                    className="line-clamp-2 cursor-text hover:text-gray-800 transition-colors"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      canAddProjects && handleDescriptionEditStart(project);
                    }}
                  >
                    {project.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Voortgang</span>
                    <span className="font-medium">{Math.round(getProgressPercentage(project))}%</span>
                  </div>
                  <Progress value={getProgressPercentage(project)} className="h-2" />
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Start: {new Date(project.startDate).toLocaleDateString('nl-NL')}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{project.teamMembers.length} teamleden</span>
                  </div>
                  
                  <div className="bg-blue-50 px-3 py-2 rounded-md">
                    <span className="text-blue-700 font-medium text-xs">
                      HUIDIGE FASE: {getCurrentPhaseName(project)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
