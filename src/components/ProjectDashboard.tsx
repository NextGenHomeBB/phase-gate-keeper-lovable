import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Users, Clock, TrendingUp, Plus } from "lucide-react";
import { Project } from "@/pages/Index";
import { useState } from "react";

interface ProjectDashboardProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onAddProject?: () => void;
  onUpdateProject?: (project: Project) => void;
}

export function ProjectDashboard({ projects, onSelectProject, onAddProject, onUpdateProject }: ProjectDashboardProps) {
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const getProjectProgress = (project: Project) => {
    const completedPhases = project.phases.filter(phase => phase.completed).length;
    return (completedPhases / 20) * 100;
  };

  const getTotalProgress = () => {
    const totalPhases = projects.length * 20;
    const completedPhases = projects.reduce((acc, project) => 
      acc + project.phases.filter(phase => phase.completed).length, 0
    );
    return totalPhases > 0 ? (completedPhases / totalPhases) * 100 : 0;
  };

  const handleNameDoubleClick = (project: Project) => {
    setEditingProjectId(project.id);
    setEditingName(project.name);
  };

  const handleNameSave = (project: Project) => {
    if (onUpdateProject && editingName.trim()) {
      const updatedProject = { ...project, name: editingName.trim() };
      onUpdateProject(updatedProject);
    }
    setEditingProjectId(null);
    setEditingName("");
  };

  const handleNameCancel = () => {
    setEditingProjectId(null);
    setEditingName("");
  };

  const handleKeyPress = (e: React.KeyboardEvent, project: Project) => {
    if (e.key === 'Enter') {
      handleNameSave(project);
    } else if (e.key === 'Escape') {
      handleNameCancel();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Dashboard</h1>
          <p className="text-gray-600 mt-2">Overzicht van alle lopende projecten en hun voortgang</p>
        </div>
        <Button onClick={onAddProject} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nieuw Project
        </Button>
      </div>

      {/* Statistieken Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale Projecten</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">Actieve projecten</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gemiddelde Voortgang</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(getTotalProgress())}%</div>
            <p className="text-xs text-muted-foreground">Van alle fases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Leden</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.reduce((acc, project) => acc + project.teamMembers.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Totaal betrokken</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actieve Fases</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.reduce((acc, project) => acc + 1, 0)}
            </div>
            <p className="text-xs text-muted-foreground">In uitvoering</p>
          </CardContent>
        </Card>
      </div>

      {/* Project Cards - Now in vertical layout */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Actieve Projecten</h2>
        <div className="space-y-4">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  {editingProjectId === project.id ? (
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => handleNameSave(project)}
                      onKeyDown={(e) => handleKeyPress(e, project)}
                      className="text-lg font-semibold"
                      autoFocus
                    />
                  ) : (
                    <CardTitle 
                      className="text-lg cursor-pointer hover:text-blue-600 transition-colors"
                      onDoubleClick={() => handleNameDoubleClick(project)}
                      title="Dubbelklik om te bewerken"
                    >
                      {project.name}
                    </CardTitle>
                  )}
                  <span className="text-sm text-gray-500">
                    Fase {project.currentPhase}/20
                  </span>
                </div>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Voortgang</span>
                    <span>{Math.round(getProjectProgress(project))}%</span>
                  </div>
                  <Progress value={getProjectProgress(project)} className="h-2" />
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Start: {new Date(project.startDate).toLocaleDateString('nl-NL')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{project.teamMembers.length} teamleden</span>
                  </div>
                </div>

                <Button 
                  onClick={() => onSelectProject(project)}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  Project Bekijken
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
