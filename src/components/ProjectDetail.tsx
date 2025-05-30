import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CheckCircle, Lock, Users, Calendar, Image as ImageIcon, X, FileText, Eye } from "lucide-react";
import { Project, Phase, ChecklistItem } from "@/pages/Index";
import { toast } from "@/hooks/use-toast";
import { CameraCapture } from "@/components/CameraCapture";
import { FileUpload } from "@/components/FileUpload";
import { ProjectTeamManager } from "@/components/ProjectTeamManager";
import { PhotoGallery } from "@/components/PhotoGallery";
import { projectFileService, ProjectFile } from "@/services/projectFileService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TeamMember } from "@/components/TeamPage";
import { projectService } from "@/services/projectService";

interface ProjectDetailProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
  onBack?: () => void;
}

export function ProjectDetail({ project, onUpdateProject, onBack }: ProjectDetailProps) {
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [editingPhaseName, setEditingPhaseName] = useState<number | null>(null);
  const [editPhaseName, setEditPhaseName] = useState("");
  const [editingChecklistItem, setEditingChecklistItem] = useState<string | null>(null);
  const [editChecklistDescription, setEditChecklistDescription] = useState("");
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState<ProjectFile | null>(null);
  const [projectTeamMembers, setProjectTeamMembers] = useState<TeamMember[]>([]);
  const [teamMembersLoading, setTeamMembersLoading] = useState(false);

  // Load project files when component mounts or project changes
  useEffect(() => {
    const loadProjectFiles = async () => {
      try {
        setFilesLoading(true);
        const files = await projectFileService.getProjectFiles(project.id);
        setProjectFiles(files);
      } catch (error) {
        console.error('Error loading project files:', error);
        toast({
          title: "Fout",
          description: "Kon projectbestanden niet laden",
          variant: "destructive",
        });
      } finally {
        setFilesLoading(false);
      }
    };

    loadProjectFiles();
  }, [project.id]);

  // Load project team members when component mounts or project changes
  useEffect(() => {
    const loadProjectTeamMembers = async () => {
      try {
        setTeamMembersLoading(true);
        const teamMembers = await projectService.fetchProjectTeamMembers(project.id);
        setProjectTeamMembers(teamMembers);
      } catch (error) {
        console.error('Error loading project team members:', error);
        toast({
          title: "Fout",
          description: "Kon teamleden niet laden",
          variant: "destructive",
        });
      } finally {
        setTeamMembersLoading(false);
      }
    };

    loadProjectTeamMembers();
  }, [project.id]);

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

  const handleChecklistItemEditStart = (item: ChecklistItem) => {
    setEditingChecklistItem(item.id);
    setEditChecklistDescription(item.description);
  };

  const handleChecklistItemSave = (phaseId: number, item: ChecklistItem) => {
    if (editChecklistDescription.trim() && editChecklistDescription !== item.description) {
      const updatedProject = { ...project };
      const phase = updatedProject.phases.find(p => p.id === phaseId);
      
      if (phase) {
        const checklistItem = phase.checklist.find(ci => ci.id === item.id);
        if (checklistItem) {
          checklistItem.description = editChecklistDescription.trim();
          onUpdateProject(updatedProject);
          
          toast({
            title: "Checklist item bijgewerkt",
            description: "De beschrijving is succesvol bijgewerkt",
          });
        }
      }
    }
    setEditingChecklistItem(null);
    setEditChecklistDescription("");
  };

  const handleChecklistItemCancel = () => {
    setEditingChecklistItem(null);
    setEditChecklistDescription("");
  };

  const handleChecklistItemKeyPress = (e: React.KeyboardEvent, phaseId: number, item: ChecklistItem) => {
    if (e.key === 'Enter') {
      handleChecklistItemSave(phaseId, item);
    } else if (e.key === 'Escape') {
      handleChecklistItemCancel();
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
          
          // Update current phase if this is the current phase
          if (phaseId === updatedProject.currentPhase) {
            updatedProject.currentPhase = Math.min(phaseId + 1, 20);
          }
          
          toast({
            title: "Fase Voltooid!",
            description: `${phase.name} is succesvol afgerond.`,
          });
        } else if (!allRequiredCompleted && phase.completed) {
          phase.completed = false;
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

  const addProjectInfoFile = async (fileBlob: Blob) => {
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = reader.result as string;
        const fileName = fileBlob instanceof File ? fileBlob.name : `Project File ${projectFiles.length + 1}`;
        const fileType = fileBlob.type;
        const fileSize = fileBlob.size;

        try {
          const uploadedFile = await projectFileService.uploadProjectFile(
            project.id,
            fileName,
            base64String,
            fileType,
            fileSize
          );

          setProjectFiles(prev => [uploadedFile, ...prev]);
          
          toast({
            title: "Bestand toegevoegd",
            description: "Het bestand is succesvol toegevoegd aan het project.",
          });
        } catch (error) {
          console.error('Error uploading file:', error);
          toast({
            title: "Fout",
            description: "Kon bestand niet uploaden",
            variant: "destructive",
          });
        }
      };
      reader.readAsDataURL(fileBlob);
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Fout",
        description: "Kon bestand niet verwerken",
        variant: "destructive",
      });
    }
  };

  const removeProjectInfoFile = async (fileId: string) => {
    try {
      await projectFileService.deleteProjectFile(fileId);
      setProjectFiles(prev => prev.filter(file => file.id !== fileId));
      
      toast({
        title: "Bestand verwijderd",
        description: "Het bestand is succesvol verwijderd.",
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Fout",
        description: "Kon bestand niet verwijderen",
        variant: "destructive",
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
    return true; // All phases are now accessible
  };

  const handleBackClick = () => {
    if (selectedPhase) {
      setSelectedPhase(null);
    } else if (onBack) {
      onBack();
    }
  };

  const handleTeamMembersChange = async () => {
    // Reload team members when changes are made
    try {
      setTeamMembersLoading(true);
      const teamMembers = await projectService.fetchProjectTeamMembers(project.id);
      setProjectTeamMembers(teamMembers);
    } catch (error) {
      console.error('Error reloading team members:', error);
    } finally {
      setTeamMembersLoading(false);
    }
  };

  const getFileIcon = (fileName: string, fileType: string) => {
    if (fileName.toLowerCase().endsWith('.pdf') || fileType === 'application/pdf') {
      return <FileText className="w-4 h-4" />;
    }
    return <ImageIcon className="w-4 h-4" />;
  };

  const handleFileClick = (file: ProjectFile) => {
    if (file.file_name.toLowerCase().endsWith('.pdf') || file.file_type === 'application/pdf') {
      // For PDFs, open preview dialog
      setPreviewFile(file);
    } else {
      // For images, open in new tab
      window.open(file.file_data, '_blank');
    }
  };

  return (
    <>
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
                      
                      {filesLoading ? (
                        <p className="text-xs text-gray-500">Bestanden laden...</p>
                      ) : projectFiles.length > 0 ? (
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {projectFiles.map((file) => (
                            <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                              <span className="truncate">{file.file_name}</span>
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleFileClick(file)}
                                  title={file.file_type === 'application/pdf' ? "PDF voorvertoning" : "Bestand openen"}
                                >
                                  {file.file_type === 'application/pdf' ? <Eye className="w-4 h-4" /> : getFileIcon(file.file_name, file.file_type)}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                  onClick={() => removeProjectInfoFile(file.id)}
                                  title="Bestand verwijderen"
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
                    <div className="space-y-4">
                      <ProjectTeamManager 
                        projectId={project.id} 
                        onTeamMembersChange={handleTeamMembersChange}
                      />
                      
                      {/* Current Team Members Display */}
                      <div className="border-t pt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Teamleden</h4>
                        {teamMembersLoading ? (
                          <p className="text-xs text-gray-500">Teamleden laden...</p>
                        ) : projectTeamMembers.length > 0 ? (
                          <div className="space-y-2">
                            {projectTeamMembers.map((member) => (
                              <div key={member.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium text-blue-600">
                                    {member.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                                  <p className="text-xs text-gray-500">{member.role}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500">Geen teamleden toegewezen</p>
                        )}
                      </div>
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
                      phase.completed ? 'border-green-500 bg-green-50' : ''
                    } ${phase.id === project.currentPhase ? 'border-blue-500 bg-blue-50' : ''}`}
                    onClick={() => setSelectedPhase(phase)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                          Fase {phase.id}
                        </CardTitle>
                        {phase.completed && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
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
                          {phase.completed ? "Voltooid" : phase.id === project.currentPhase ? "Actief" : "Beschikbaar"}
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
                  Vul alle verplichte items in om naar de volgende fase te gaan. Dubbelklik op een item om de beschrijving te bewerken.
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
                            {editingChecklistItem === item.id ? (
                              <Input
                                value={editChecklistDescription}
                                onChange={(e) => setEditChecklistDescription(e.target.value)}
                                onBlur={() => handleChecklistItemSave(selectedPhase.id, item)}
                                onKeyDown={(e) => handleChecklistItemKeyPress(e, selectedPhase.id, item)}
                                className="text-sm flex-1 mr-2"
                                autoFocus
                              />
                            ) : (
                              <p 
                                className={`text-sm cursor-text hover:text-gray-700 transition-colors ${item.completed ? 'line-through text-gray-500' : ''}`}
                                onDoubleClick={() => handleChecklistItemEditStart(item)}
                              >
                                {item.description}
                              </p>
                            )}
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
                    💡 <strong>Tip:</strong> Alle verplichte items moeten worden voltooid voordat je naar de volgende fase kunt gaan. Je kunt foto's maken, afbeeldingen uploaden of PDF-bestanden toevoegen om je voortgang te documenteren. Dubbelklik op een checklist item om de beschrijving te bewerken.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* PDF Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                {previewFile?.file_name}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => previewFile && window.open(previewFile.file_data, '_blank')}
              >
                Openen in nieuw tabblad
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 p-6 pt-2">
            {previewFile && (
              <iframe
                src={previewFile.file_data}
                className="w-full h-[70vh] border rounded"
                title={previewFile.file_name}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
