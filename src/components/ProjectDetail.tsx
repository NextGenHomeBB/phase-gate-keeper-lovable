import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CheckCircle, Lock, Users, Calendar, Image as ImageIcon, X, FileText } from "lucide-react";
import { Project, Phase, ChecklistItem } from "@/pages/Index";
import { toast } from "@/hooks/use-toast";
import { CameraCapture } from "@/components/CameraCapture";
import { FileUpload } from "@/components/FileUpload";
import { ProjectTeamManager } from "@/components/ProjectTeamManager";
import { PhotoGallery } from "@/components/PhotoGallery";

interface ProjectDetailProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
  onBack?: () => void;
}

export function ProjectDetail({ project, onUpdateProject, onBack }: ProjectDetailProps) {
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [editingPhaseName, setEditingPhaseName] = useState<number | null>(null);
  const [editPhaseName, setEditPhaseName] = useState("");

  const handlePhaseNameEditStart = (phase: Phase) => {
    setEditingPhaseName(phase.id);
    setEditPhaseName(phase.name);
  };

  const handlePhaseNameSave = (phase: Phase) => {
    if (editPhaseName.trim() && editPhaseName !== phase.name) {
      const updatedProject = { ...project };
      const phaseToUpdate = updatedProject.phases.find(p => p.id === phase.id);
      
      if (phaseToUpdate) {
        phaseToUpdate.name = editPhaseName.trim();
        onUpdateProject(updatedProject);
        
        toast({
          title: "Fase naam bijgewerkt",
          description: `Fase hernoemd naar "${editPhaseName.trim()}"`,
        });
      }
    }
    setEditingPhaseName(null);
    setEditPhaseName("");
  };

  const handlePhaseNameCancel = () => {
    setEditingPhaseName(null);
    setEditPhaseName("");
  };

  const handlePhaseNameKeyPress = (e: React.KeyboardEvent, phase: Phase) => {
    if (e.key === 'Enter') {
      handlePhaseNameSave(phase);
    } else if (e.key === 'Escape') {
      handlePhaseNameCancel();
    }
  };

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

  const addPhotoToChecklistItem = (phaseId: number, itemId: string, photoBlob: Blob) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      
      const updatedProject = { ...project };
      const phase = updatedProject.phases.find(p => p.id === phaseId);
      
      if (phase) {
        const item = phase.checklist.find(item => item.id === itemId);
        if (item) {
          if (!item.photos) {
            item.photos = [];
          }
          item.photos.push(base64String);
          onUpdateProject(updatedProject);
          
          toast({
            title: "Foto toegevoegd",
            description: "De foto is succesvol toegevoegd aan het checklist item.",
          });
        }
      }
    };
    reader.readAsDataURL(photoBlob);
  };

  const addProjectInfoFile = (fileBlob: Blob) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      
      const updatedProject = { ...project };
      
      // Add projectFiles array if it doesn't exist
      if (!updatedProject.projectFiles) {
        updatedProject.projectFiles = [];
      }
      
      const fileName = fileBlob instanceof File ? fileBlob.name : `Project File ${updatedProject.projectFiles.length + 1}`;
      
      updatedProject.projectFiles.push({
        id: Date.now().toString(),
        name: fileName,
        data: base64String,
        uploadedAt: new Date().toISOString()
      });
      
      onUpdateProject(updatedProject);
      
      toast({
        title: "Bestand toegevoegd",
        description: "Het bestand is succesvol toegevoegd aan het project.",
      });
    };
    reader.readAsDataURL(fileBlob);
  };

  const removeProjectInfoFile = (fileId: string) => {
    const updatedProject = { ...project };
    
    if (updatedProject.projectFiles) {
      updatedProject.projectFiles = updatedProject.projectFiles.filter(file => file.id !== fileId);
      onUpdateProject(updatedProject);
      
      toast({
        title: "Bestand verwijderd",
        description: "Het bestand is succesvol verwijderd.",
      });
    }
  };

  const removePhotoFromChecklistItem = (phaseId: number, itemId: string, photoIndex: number) => {
    const updatedProject = { ...project };
    const phase = updatedProject.phases.find(p => p.id === phaseId);
    
    if (phase) {
      const item = phase.checklist.find(item => item.id === itemId);
      if (item && item.photos) {
        item.photos.splice(photoIndex, 1);
        onUpdateProject(updatedProject);
        
        toast({
          title: "Foto verwijderd",
          description: "De foto is succesvol verwijderd.",
        });
      }
    }
  };

  const canAccessPhase = (phase: Phase) => {
    return !phase.locked || phase.completed;
  };

  const handleBackClick = () => {
    if (selectedPhase) {
      setSelectedPhase(null);
    } else if (onBack) {
      onBack();
    }
  };

  const handleTeamMembersChange = () => {
    // Trigger a reload of project data if needed
    // This would typically involve calling the parent component to refresh data
    console.log('Team members changed for project:', project.id);
  };

  const getFileIcon = (fileName: string, data: string) => {
    if (fileName.toLowerCase().endsWith('.pdf') || data.startsWith('data:application/pdf')) {
      return <FileText className="w-4 h-4" />;
    }
    return <ImageIcon className="w-4 h-4" />;
  };

  const handleFileClick = (file: any) => {
    if (file.name.toLowerCase().endsWith('.pdf') || file.data.startsWith('data:application/pdf')) {
      // For PDFs, open in new tab
      window.open(file.data, '_blank');
    } else {
      // For images, open in new tab
      window.open(file.data, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={handleBackClick}>
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
                <CardContent className="space-y-4">
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
                  
                  {/* Project Files Section */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Bestanden:</span>
                      <div className="flex items-center space-x-1">
                        <CameraCapture
                          onCapture={(blob) => addProjectInfoFile(blob)}
                        />
                        <FileUpload
                          onFileUpload={(blob) => addProjectInfoFile(blob)}
                        />
                      </div>
                    </div>
                    
                    {project.projectFiles && project.projectFiles.length > 0 ? (
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {project.projectFiles.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                            <span className="truncate">{file.name}</span>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 flex items-center justify-center"
                                onClick={() => handleFileClick(file)}
                              >
                                {getFileIcon(file.name, file.data)}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700 flex items-center justify-center"
                                onClick={() => removeProjectInfoFile(file.id)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">Nog geen bestanden toegevoegd</p>
                    )}
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
                    <ProjectTeamManager 
                      projectId={project.id} 
                      onTeamMembersChange={handleTeamMembersChange}
                    />
                    {project.teamMembers.map((member, index) => (
                      <div key={index} className="text-sm">
                        {member}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Project Photo Gallery */}
            <PhotoGallery 
              projectId={project.id}
              title="Project Foto Galerij"
              className="mt-6"
            />
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
                    {editingPhaseName === phase.id ? (
                      <Input
                        value={editPhaseName}
                        onChange={(e) => setEditPhaseName(e.target.value)}
                        onBlur={() => handlePhaseNameSave(phase)}
                        onKeyDown={(e) => handlePhaseNameKeyPress(e, phase)}
                        className="text-xs"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <CardDescription 
                        className="text-xs cursor-text hover:text-gray-800 transition-colors"
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          handlePhaseNameEditStart(phase);
                        }}
                      >
                        {phase.name.replace(`Fase ${phase.id}: `, '')}
                      </CardDescription>
                    )}
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
            {editingPhaseName === selectedPhase.id ? (
              <Input
                value={editPhaseName}
                onChange={(e) => setEditPhaseName(e.target.value)}
                onBlur={() => handlePhaseNameSave(selectedPhase)}
                onKeyDown={(e) => handlePhaseNameKeyPress(e, selectedPhase)}
                className="text-3xl font-bold text-gray-900 border-0 p-0 shadow-none focus-visible:ring-0"
                autoFocus
              />
            ) : (
              <h1 
                className="text-3xl font-bold text-gray-900 cursor-text hover:text-gray-700 transition-colors"
                onDoubleClick={() => handlePhaseNameEditStart(selectedPhase)}
              >
                {selectedPhase.name}
              </h1>
            )}
            <p className="text-gray-600 mt-2">{selectedPhase.description}</p>
          </div>

          {/* Phase Photo Gallery */}
          <PhotoGallery 
            projectId={project.id}
            phaseId={selectedPhase.id}
            title={`Foto's voor ${selectedPhase.name}`}
          />

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
                  <div key={item.id} className="p-3 rounded-lg border">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={(checked) => 
                          updateChecklistItem(selectedPhase.id, item.id, checked as boolean)
                        }
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm ${item.completed ? 'line-through text-gray-500' : ''}`}>
                            {item.description}
                          </p>
                          <div className="flex items-center space-x-2">
                            <CameraCapture
                              onCapture={(blob) => addPhotoToChecklistItem(selectedPhase.id, item.id, blob)}
                            />
                            <FileUpload
                              onFileUpload={(blob) => addPhotoToChecklistItem(selectedPhase.id, item.id, blob)}
                              acceptedTypes="image/*"
                            />
                            {item.photos && item.photos.length > 0 && (
                              <div className="flex items-center text-sm text-gray-600">
                                <ImageIcon className="w-4 h-4 mr-1" />
                                {item.photos.length}
                              </div>
                            )}
                          </div>
                        </div>
                        {item.required && (
                          <Badge variant="outline" className="text-xs mt-1">
                            Verplicht
                          </Badge>
                        )}
                        
                        {/* Photo Gallery */}
                        {item.photos && item.photos.length > 0 && (
                          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                            {item.photos.map((photo, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={photo}
                                  alt={`Foto ${index + 1}`}
                                  className="w-full h-24 object-cover rounded border cursor-pointer hover:opacity-75 transition-opacity"
                                  onClick={() => window.open(photo, '_blank')}
                                />
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                                  onClick={() => removePhotoFromChecklistItem(selectedPhase.id, item.id, index)}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Alle verplichte items moeten worden voltooid voordat je naar de volgende fase kunt gaan. Je kunt foto's maken, afbeeldingen uploaden of PDF-bestanden toevoegen om je voortgang te documenteren.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
