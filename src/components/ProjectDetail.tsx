
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, CheckCircle, Lock, Users, Calendar } from "lucide-react";
import { Project, Phase, ChecklistItem } from "@/pages/Index";
import { toast } from "@/hooks/use-toast";

interface ProjectDetailProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
}

export function ProjectDetail({ project, onUpdateProject }: ProjectDetailProps) {
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);

  const getProjectProgress = () => {
    const completedPhases = project.phases.filter(phase => phase.completed).length;
    return (completedPhases / 20) * 100;
  };

  const updateChecklistItem = (phaseId: number, itemId: string, completed: boolean) => {
    const updatedProject = { ...project };
    const phase = updatedProject.phases.find(p => p.id === phaseId);
    
    if (phase) {
      const item = phase.checklist.find(item => item.id === itemId);
      if (item) {
        item.completed = completed;
        
        // Check if all required items are completed
        const allRequiredCompleted = phase.checklist
          .filter(item => item.required)
          .every(item => item.completed);
        
        if (allRequiredCompleted && !phase.completed) {
          phase.completed = true;
          
          // Unlock next phase
          const nextPhase = updatedProject.phases.find(p => p.id === phaseId + 1);
          if (nextPhase) {
            nextPhase.locked = false;
          }
          
          // Update current phase
          if (phaseId === updatedProject.currentPhase) {
            updatedProject.currentPhase = Math.min(phaseId + 1, 20);
          }
          
          toast({
            title: "Fase Voltooid!",
            description: `${phase.name} is succesvol afgerond. De volgende fase is nu beschikbaar.`,
          });
        } else if (!allRequiredCompleted && phase.completed) {
          phase.completed = false;
          
          // Lock subsequent phases
          updatedProject.phases.forEach(p => {
            if (p.id > phaseId) {
              p.locked = true;
              p.completed = false;
            }
          });
        }
        
        onUpdateProject(updatedProject);
      }
    }
  };

  const canAccessPhase = (phase: Phase) => {
    return !phase.locked || phase.completed;
  };

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => setSelectedPhase(null)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {selectedPhase ? "Terug naar Fases" : "Terug naar Dashboard"}
        </Button>
      </div>

      {!selectedPhase ? (
        <>
          {/* Project Overview */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-gray-600 mt-2">{project.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Voortgang</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Voltooide fases</span>
                      <span className="font-semibold">
                        {project.phases.filter(p => p.completed).length}/20
                      </span>
                    </div>
                    <Progress value={getProjectProgress()} className="h-3" />
                    <p className="text-sm text-gray-600">
                      {Math.round(getProjectProgress())}% voltooid
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Project Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600">Startdatum:</span>
                    <p className="font-medium">
                      {new Date(project.startDate).toLocaleDateString('nl-NL')}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Huidige fase:</span>
                    <p className="font-medium">Fase {project.currentPhase}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Team
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {project.teamMembers.map((member, index) => (
                      <div key={index} className="text-sm">
                        {member}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Phases Grid */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Project Fases</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {project.phases.map((phase) => (
                <Card 
                  key={phase.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    !canAccessPhase(phase) ? 'opacity-50 cursor-not-allowed' : ''
                  } ${phase.completed ? 'border-green-500 bg-green-50' : ''}
                  ${phase.id === project.currentPhase ? 'border-blue-500 bg-blue-50' : ''}`}
                  onClick={() => canAccessPhase(phase) && setSelectedPhase(phase)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        Fase {phase.id}
                      </CardTitle>
                      {phase.completed && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                      {!canAccessPhase(phase) && (
                        <Lock className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <CardDescription className="text-xs">
                      {phase.name.replace(`Fase ${phase.id}: `, '')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Badge 
                        variant={phase.completed ? "default" : phase.id === project.currentPhase ? "secondary" : "outline"}
                        className={phase.completed ? "bg-green-600" : phase.id === project.currentPhase ? "bg-blue-600" : ""}
                      >
                        {phase.completed ? "Voltooid" : phase.id === project.currentPhase ? "Actief" : phase.locked ? "Vergrendeld" : "Beschikbaar"}
                      </Badge>
                      <p className="text-xs text-gray-600">
                        {phase.checklist.filter(item => item.completed).length}/{phase.checklist.length} taken voltooid
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Phase Detail View */
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{selectedPhase.name}</h1>
            <p className="text-gray-600 mt-2">{selectedPhase.description}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Checklist
                <Badge 
                  variant={selectedPhase.completed ? "default" : "outline"}
                  className={selectedPhase.completed ? "bg-green-600" : ""}
                >
                  {selectedPhase.completed ? "Voltooid" : "In Uitvoering"}
                </Badge>
              </CardTitle>
              <CardDescription>
                Vul alle verplichte items in om naar de volgende fase te gaan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedPhase.checklist.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={(checked) => 
                        updateChecklistItem(selectedPhase.id, item.id, checked as boolean)
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className={`text-sm ${item.completed ? 'line-through text-gray-500' : ''}`}>
                        {item.description}
                      </p>
                      {item.required && (
                        <Badge variant="outline" className="text-xs mt-1">
                          Verplicht
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Alle verplichte items moeten worden voltooid voordat je naar de volgende fase kunt gaan.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
