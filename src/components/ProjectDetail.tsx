import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, Users, CheckCircle, Clock, Lock, Camera, FileText, Package, Euro, ExternalLink, Hammer } from "lucide-react";
import { Project, Phase, ChecklistItem } from "@/pages/Index";
import { CameraCapture } from "./CameraCapture";
import { PhotoGallery } from "./PhotoGallery";
import { MaterialsList } from "./MaterialsList";
import { MaterialsCalculator } from "./MaterialsCalculator";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProjectDetailProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
  onBack: () => void;
}

export function ProjectDetail({ project, onUpdateProject, onBack }: ProjectDetailProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (project.phases.length > 0) {
      setSelectedPhase(project.phases[0]);
    }
  }, [project]);

  const handlePhaseClick = (phase: Phase) => {
    setSelectedPhase(phase);
  };

  const handleChecklistItemToggle = (phaseId: number, itemId: string, completed: boolean) => {
    const updatedPhases = project.phases.map(phase => {
      if (phase.id === phaseId) {
        const updatedChecklist = phase.checklist.map(item => {
          if (item.id === itemId) {
            return { ...item, completed: completed };
          }
          return item;
        });
        return { ...phase, checklist: updatedChecklist };
      }
      return phase;
    });

    const updatedProject = { ...project, phases: updatedPhases };
    onUpdateProject(updatedProject);
  };

  const handleAddPhotoToChecklist = (phaseId: number, itemId: string, photoBlob: Blob) => {
    const reader = new FileReader();
    reader.onload = () => {
      const photoDataUrl = reader.result as string;
      
      const updatedPhases = project.phases.map(phase => {
        if (phase.id === phaseId) {
          const updatedChecklist = phase.checklist.map(item => {
            if (item.id === itemId) {
              const updatedPhotos = item.photos ? [...item.photos, photoDataUrl] : [photoDataUrl];
              return { ...item, photos: updatedPhotos };
            }
            return item;
          });
          return { ...phase, checklist: updatedChecklist };
        }
        return phase;
      });

      const updatedProject = { ...project, phases: updatedPhases };
      onUpdateProject(updatedProject);
      toast({
        title: t('projectDetail.photoAdded'),
        description: t('projectDetail.photoAddedSuccess'),
      });
    };
    reader.readAsDataURL(photoBlob);
  };

  const handleMaterialUpdate = (phaseId: number, updatedMaterials: any) => {
    const updatedPhases = project.phases.map(phase => {
      if (phase.id === phaseId) {
        return { ...phase, materials: updatedMaterials };
      }
      return phase;
    });
  
    const updatedProject = { ...project, phases: updatedPhases };
    onUpdateProject(updatedProject);
  };

  const handlePhaseCompletionToggle = (phaseId: number, completed: boolean) => {
    const updatedPhases = project.phases.map(phase => {
      if (phase.id === phaseId) {
        return { ...phase, completed: completed };
      }
      return phase;
    });

    const updatedProject = { ...project, phases: updatedPhases };
    onUpdateProject(updatedProject);
  };

  const handlePhaseLockToggle = (phaseId: number, locked: boolean) => {
    const updatedPhases = project.phases.map(phase => {
      if (phase.id === phaseId) {
        return { ...phase, locked: locked };
      }
      return phase;
    });

    const updatedProject = { ...project, phases: updatedPhases };
    onUpdateProject(updatedProject);
  };

  const getProgressPercentage = () => {
    const completedPhases = project.phases.filter(phase => phase.completed).length;
    return (completedPhases / project.phases.length) * 100;
  };

  const getTotalProjectCost = () => {
    let totalCost = 0;
    project.phases.forEach(phase => {
      phase.materials?.forEach(material => {
        totalCost += (material.estimatedCost || 0) * material.quantity;
      });
    });
    return totalCost;
  };

  const handleFindSubcontractors = () => {
    window.open('https://www.werkspot.nl', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          {t('common.back')}
        </Button>
      </div>

      {/* Materials Calculator */}
      <MaterialsCalculator project={project} />

      {/* Project Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{t('projectDetail.progress')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={getProgressPercentage()} className="h-2" />
              <div className="flex justify-between text-sm text-gray-500">
                <span>{t('projectDetail.completed')}: {project.phases.filter(phase => phase.completed).length} / {project.phases.length}</span>
                <span>{getProgressPercentage().toFixed(0)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Totale Kosten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-gray-700">
              <Euro className="w-4 h-4 mr-2 text-green-600" />
              <span className="text-xl font-bold text-green-900">€{getTotalProjectCost().toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{t('projectDetail.startDate')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-700">
              <Calendar className="w-4 h-4 mr-2 inline-block" />
              {new Date(project.startDate).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{t('projectDetail.teamMembers')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-700">
              <Users className="w-4 h-4 mr-2 inline-block" />
              {project.teamMembers.length} {t('projectDetail.members')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onderaannemers Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Hammer className="w-5 h-5 mr-2" />
            Onderaannemers vinden
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <h4 className="font-medium text-blue-900">Werkspot.nl</h4>
              <p className="text-sm text-blue-700">Vind betrouwbare onderaannemers voor uw project</p>
            </div>
            <Button onClick={handleFindSubcontractors} className="bg-blue-600 hover:bg-blue-700">
              <ExternalLink className="w-4 h-4 mr-2" />
              Zoek onderaannemers
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <FileText className="w-4 h-4 mr-2" />
            {t('projectDetail.overview')}
          </TabsTrigger>
          <TabsTrigger value="phases">
            <Clock className="w-4 h-4 mr-2" />
            {t('projectDetail.phases')}
          </TabsTrigger>
          <TabsTrigger value="photos">
            <Camera className="w-4 h-4 mr-2" />
            {t('projectDetail.photos')}
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="w-4 h-4 mr-2" />
            Documentatie
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{t('projectDetail.projectDescription')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{project.description}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{t('projectDetail.teamComposition')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 text-gray-700">
                {project.teamMembers.map((member, index) => (
                  <li key={index}>{member}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="phases" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.phases.map(phase => (
              <Card key={phase.id} className={`cursor-pointer ${selectedPhase?.id === phase.id ? 'border-2 border-blue-500' : ''}`} onClick={() => handlePhaseClick(phase)}>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    {phase.name}
                    {phase.completed && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-gray-700 line-clamp-3">{phase.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="secondary">
                      {phase.checklist.filter(item => item.completed).length} / {phase.checklist.length} {t('projectDetail.checklistItems')}
                    </Badge>
                    {phase.locked ? (
                      <Badge variant="outline">
                        <Lock className="w-3 h-3 mr-1" />
                        {t('projectDetail.locked')}
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        {t('projectDetail.open')}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedPhase && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center justify-between">
                  {selectedPhase.name}
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handlePhaseCompletionToggle(selectedPhase.id, !selectedPhase.completed)}>
                      {selectedPhase.completed ? (
                        <>
                          <Clock className="w-4 h-4 mr-2" />
                          {t('projectDetail.markIncomplete')}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {t('projectDetail.markComplete')}
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handlePhaseLockToggle(selectedPhase.id, !selectedPhase.locked)}>
                      {selectedPhase.locked ? (
                        <>
                          <Clock className="w-4 h-4 mr-2" />
                          {t('projectDetail.unlockPhase')}
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          {t('projectDetail.lockPhase')}
                        </>
                      )}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">{selectedPhase.description}</p>
                
                <div>
                  <h4 className="text-md font-semibold">{t('projectDetail.checklist')}</h4>
                  <ul className="list-none pl-0 mt-2">
                    {selectedPhase.checklist.map(item => (
                      <li key={item.id} className="flex items-center justify-between py-2 border-b border-gray-200">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={item.id}
                            className="mr-2 h-5 w-5 rounded text-blue-600 focus:ring-blue-500"
                            checked={item.completed}
                            onChange={(e) => handleChecklistItemToggle(selectedPhase.id, item.id, e.target.checked)}
                          />
                          <label htmlFor={item.id} className={`text-gray-700 ${item.required ? 'font-medium' : ''}`}>
                            {item.description}
                          </label>
                        </div>
                        <div className="flex items-center">
                          {item.photos && item.photos.length > 0 && (
                            <Badge variant="secondary" className="mr-2">
                              <Camera className="w-3 h-3 mr-1" />
                              {item.photos.length} {t('projectDetail.photos')}
                            </Badge>
                          )}
                          <CameraCapture
                            onCapture={(photoBlob) => handleAddPhotoToChecklist(selectedPhase.id, item.id, photoBlob)}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <MaterialsList 
                  materials={selectedPhase.materials}
                  onUpdateMaterials={(updatedMaterials) => handleMaterialUpdate(selectedPhase.id, updatedMaterials)}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="photos" className="space-y-4">
          <PhotoGallery 
            projectId={project.id.toString()}
            title="Project Foto's"
          />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <ProjectFiles 
            projectId={project.id.toString()}
            title="Project Documentatie & Bouwtekeningen"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
