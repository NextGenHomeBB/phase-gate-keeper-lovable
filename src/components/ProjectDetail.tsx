<think>

</think>

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Calendar, Users, CheckCircle, Clock, Lock, Camera, FileText, Package, Euro, ExternalLink, Hammer, Edit, MessageSquare, Plus, Trash2, Palette, Wrench, PaintBucket, Zap, Building, Drill, HardHat, CircularProgressBar } from "lucide-react";
import { Project, Phase, ChecklistItem } from "@/pages/Index";
import { CameraCapture } from "./CameraCapture";
import { PhotoGallery } from "./PhotoGallery";
import { ProjectDetailMaterials } from "./ProjectDetailMaterials";
import { MaterialsCalculator } from "./MaterialsCalculator";
import { ProjectFiles } from "./ProjectFiles";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { ConstructionDrawings } from "./ConstructionDrawings";
import { HomeStyleAI } from "./HomeStyleAI";
import { projectService } from "@/services/projectService";

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
  const [editingPhaseName, setEditingPhaseName] = useState<string>("");
  const [isEditingPhaseName, setIsEditingPhaseName] = useState(false);
  const [editingChecklistItem, setEditingChecklistItem] = useState<{phaseId: number, itemId: string} | null>(null);
  const [editingItemText, setEditingItemText] = useState("");
  const [editingItemNotes, setEditingItemNotes] = useState("");
  const [customColors, setCustomColors] = useState<{[phaseId: number]: number}>({});
  const { toast } = useToast();

  // Pastel color classes for phase cards
  const pastelColors = [
    "bg-gradient-to-br from-pink-100 via-pink-50 to-pink-200 border-pink-300 hover:border-pink-400",
    "bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 border-blue-300 hover:border-blue-400", 
    "bg-gradient-to-br from-green-100 via-green-50 to-green-200 border-green-300 hover:border-green-400",
    "bg-gradient-to-br from-yellow-100 via-yellow-50 to-yellow-200 border-yellow-300 hover:border-yellow-400",
    "bg-gradient-to-br from-purple-100 via-purple-50 to-purple-200 border-purple-300 hover:border-purple-400",
    "bg-gradient-to-br from-indigo-100 via-indigo-50 to-indigo-200 border-indigo-300 hover:border-indigo-400",
    "bg-gradient-to-br from-teal-100 via-teal-50 to-teal-200 border-teal-300 hover:border-teal-400",
    "bg-gradient-to-br from-orange-100 via-orange-50 to-orange-200 border-orange-300 hover:border-orange-400",
    "bg-gradient-to-br from-rose-100 via-rose-50 to-rose-200 border-rose-300 hover:border-rose-400",
    "bg-gradient-to-br from-cyan-100 via-cyan-50 to-cyan-200 border-cyan-300 hover:border-cyan-400",
    "bg-gradient-to-br from-lime-100 via-lime-50 to-lime-200 border-lime-300 hover:border-lime-400",
    "bg-gradient-to-br from-amber-100 via-amber-50 to-amber-200 border-amber-300 hover:border-amber-400",
    "bg-gradient-to-br from-emerald-100 via-emerald-50 to-emerald-200 border-emerald-300 hover:border-emerald-400",
    "bg-gradient-to-br from-sky-100 via-sky-50 to-sky-200 border-sky-300 hover:border-sky-400",
    "bg-gradient-to-br from-violet-100 via-violet-50 to-violet-200 border-violet-300 hover:border-violet-400",
  ];

  // Phase icons mapping
  const phaseIcons = [
    Building,    // Planning/Foundation
    Hammer,      // Construction
    PaintBucket, // Interior work
    Wrench,      // Finishing
    Zap,         // Electrical/Utilities
    Drill,       // Installation
    HardHat,     // Safety/Inspection
    Calendar,    // Scheduling
  ];

  const getPhaseIcon = (index: number) => {
    return phaseIcons[index % phaseIcons.length];
  };

  const getPhaseColor = (phase: Phase, index: number) => {
    const colorIndex = customColors[phase.id] !== undefined ? customColors[phase.id] : index % pastelColors.length;
    return pastelColors[colorIndex];
  };

  const getPhaseProgress = (phase: Phase) => {
    const completedItems = phase.checklist.filter(item => item.completed).length;
    const totalItems = phase.checklist.length;
    return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  };

  const getPhaseProgressColor = (progress: number) => {
    if (progress === 100) return "text-green-600";
    if (progress >= 75) return "text-blue-600";
    if (progress >= 50) return "text-yellow-600";
    if (progress >= 25) return "text-orange-600";
    return "text-red-500";
  };

  const handleColorChange = (phaseId: number, colorIndex: number) => {
    setCustomColors(prev => ({
      ...prev,
      [phaseId]: colorIndex
    }));
    toast({
      title: "Kleur bijgewerkt",
      description: "De fase kleur is succesvol gewijzigd.",
    });
  };

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

  const handleEditChecklistItem = (phaseId: number, itemId: string) => {
    const phase = project.phases.find(p => p.id === phaseId);
    const item = phase?.checklist.find(i => i.id === itemId);
    if (item) {
      setEditingChecklistItem({ phaseId, itemId });
      setEditingItemText(item.description);
      setEditingItemNotes(item.notes || "");
    }
  };

  const handleSaveChecklistItem = () => {
    if (!editingChecklistItem) return;

    const updatedPhases = project.phases.map(phase => {
      if (phase.id === editingChecklistItem.phaseId) {
        const updatedChecklist = phase.checklist.map(item => {
          if (item.id === editingChecklistItem.itemId) {
            return { 
              ...item, 
              description: editingItemText.trim(),
              notes: editingItemNotes.trim() || undefined
            };
          }
          return item;
        });
        return { ...phase, checklist: updatedChecklist };
      }
      return phase;
    });

    const updatedProject = { ...project, phases: updatedPhases };
    onUpdateProject(updatedProject);
    setEditingChecklistItem(null);
    setEditingItemText("");
    setEditingItemNotes("");

    toast({
      title: "Checklist item updated",
      description: "The checklist item has been successfully updated.",
    });
  };

  const handleCancelEditChecklistItem = () => {
    setEditingChecklistItem(null);
    setEditingItemText("");
    setEditingItemNotes("");
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

  const handlePhaseCompletionToggle = async (phaseId: number, completed: boolean) => {
    try {
      await projectService.updateProjectPhase(project.id, phaseId, { completed });
      
      const updatedPhases = project.phases.map(phase => {
        if (phase.id === phaseId) {
          return { ...phase, completed: completed };
        }
        return phase;
      });

      const updatedProject = { ...project, phases: updatedPhases };
      onUpdateProject(updatedProject);
      
      toast({
        title: "Fase status bijgewerkt",
        description: `Fase is ${completed ? 'voltooid' : 'niet voltooid'} gemarkeerd.`,
      });
    } catch (error) {
      console.error('Error updating phase completion:', error);
      toast({
        title: "Fout",
        description: "Kon fase status niet bijwerken.",
        variant: "destructive",
      });
    }
  };

  const handlePhaseLockToggle = async (phaseId: number, locked: boolean) => {
    try {
      await projectService.updateProjectPhase(project.id, phaseId, { locked });
      
      const updatedPhases = project.phases.map(phase => {
        if (phase.id === phaseId) {
          return { ...phase, locked: locked };
        }
        return phase;
      });

      const updatedProject = { ...project, phases: updatedPhases };
      onUpdateProject(updatedProject);
      
      toast({
        title: "Fase vergrendeling bijgewerkt",
        description: `Fase is ${locked ? 'vergrendeld' : 'ontgrendeld'}.`,
      });
    } catch (error) {
      console.error('Error updating phase lock status:', error);
      toast({
        title: "Fout",
        description: "Kon fase vergrendeling niet bijwerken.",
        variant: "destructive",
      });
    }
  };

  const handlePhaseNameEdit = () => {
    if (selectedPhase) {
      setEditingPhaseName(selectedPhase.name);
      setIsEditingPhaseName(true);
    }
  };

  const handlePhaseNameSave = async () => {
    if (selectedPhase && editingPhaseName.trim()) {
      try {
        await projectService.updateProjectPhase(project.id, selectedPhase.id, { 
          name: editingPhaseName.trim() 
        });
        
        const updatedPhases = project.phases.map(phase => {
          if (phase.id === selectedPhase.id) {
            return { ...phase, name: editingPhaseName.trim() };
          }
          return phase;
        });

        const updatedProject = { ...project, phases: updatedPhases };
        onUpdateProject(updatedProject);
        
        // Update selected phase to reflect the change
        setSelectedPhase({ ...selectedPhase, name: editingPhaseName.trim() });
        setIsEditingPhaseName(false);
        setEditingPhaseName("");
        
        toast({
          title: "Fase naam bijgewerkt",
          description: "De fase naam is succesvol bijgewerkt.",
        });
      } catch (error) {
        console.error('Error updating phase name:', error);
        toast({
          title: "Fout",
          description: "Kon fase naam niet bijwerken.",
          variant: "destructive",
        });
      }
    }
  };

  const handlePhaseNameCancel = () => {
    setIsEditingPhaseName(false);
    setEditingPhaseName("");
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

  const handleAddPhase = async () => {
    try {
      const newPhaseName = `Nieuwe Fase ${project.phases.length + 1}`;
      const newPhaseDescription = "Beschrijving van de nieuwe fase";
      
      const newPhase = await projectService.addProjectPhase(
        project.id, 
        newPhaseName, 
        newPhaseDescription
      );

      const newPhaseForProject: Phase = {
        id: newPhase.phase_number,
        name: newPhase.name,
        description: newPhase.description || '',
        completed: newPhase.completed,
        locked: newPhase.locked,
        checklist: [
          {
            id: `${newPhase.phase_number}-1`,
            description: "Alle stakeholders geïnformeerd",
            completed: false,
            required: true
          },
          {
            id: `${newPhase.phase_number}-2`, 
            description: "Documentatie bijgewerkt",
            completed: false,
            required: true
          }
        ],
        materials: []
      };

      const updatedProject = {
        ...project,
        phases: [...project.phases, newPhaseForProject]
      };
      
      onUpdateProject(updatedProject);
      setSelectedPhase(newPhaseForProject);
      
      toast({
        title: "Fase toegevoegd",
        description: "Nieuwe fase is succesvol toegevoegd aan het project.",
      });
    } catch (error) {
      console.error('Error adding phase:', error);
      toast({
        title: "Fout",
        description: "Kon nieuwe fase niet toevoegen.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePhase = async (phaseId: number) => {
    if (project.phases.length <= 1) {
      toast({
        title: "Kan fase niet verwijderen",
        description: "Een project moet minimaal één fase hebben.",
        variant: "destructive"
      });
      return;
    }

    try {
      await projectService.deleteProjectPhase(project.id, phaseId);
      
      const updatedPhases = project.phases.filter(phase => phase.id !== phaseId);
      const updatedProject = { ...project, phases: updatedPhases };
      
      onUpdateProject(updatedProject);
      
      // If the deleted phase was selected, select the first remaining phase
      if (selectedPhase?.id === phaseId) {
        setSelectedPhase(updatedPhases.length > 0 ? updatedPhases[0] : null);
      }
      
      toast({
        title: "Fase verwijderd",
        description: "De fase is succesvol verwijderd uit het project.",
      });
    } catch (error) {
      console.error('Error deleting phase:', error);
      toast({
        title: "Fout",
        description: "Kon fase niet verwijderen.",
        variant: "destructive",
      });
    }
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
          <TabsTrigger value="drawings">
            <FileText className="w-4 h-4 mr-2" />
            Bouwtekeningen
          </TabsTrigger>
          <TabsTrigger value="styling">
            <Hammer className="w-4 h-4 mr-2" />
            Home Styling AI
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

        <TabsContent value="phases" className="space-y-6">
          {/* Enhanced Add Phase Button */}
          <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-100 border-2 border-indigo-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-indigo-900 mb-1">Projectfases Beheren</h3>
                <p className="text-indigo-700 text-sm">Voeg nieuwe fasen toe of beheer bestaande fasen van uw project.</p>
              </div>
              <Button 
                onClick={handleAddPhase} 
                size="lg"
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg transition-all hover:shadow-xl hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nieuwe Fase Toevoegen
              </Button>
            </div>
          </div>
          
          {/* Enhanced Phase Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {project.phases.map((phase, index) => {
              const PhaseIcon = getPhaseIcon(index);
              const progress = getPhaseProgress(phase);
              const progressColor = getPhaseProgressColor(progress);
              
              return (
                <Card 
                  key={phase.id} 
                  className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 transform ${
                    selectedPhase?.id === phase.id 
                      ? 'ring-2 ring-blue-500 shadow-xl scale-105' 
                      : 'shadow-md hover:shadow-lg'
                  } ${getPhaseColor(phase, index)} backdrop-blur-sm`} 
                  onClick={() => handlePhaseClick(phase)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/60 backdrop-blur-sm">
                          <PhaseIcon className="w-5 h-5 text-gray-700" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-800 leading-tight">{phase.name}</span>
                          {phase.completed && (
                            <div className="flex items-center gap-1 mt-1">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              <span className="text-xs text-green-700 font-medium">Voltooid</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-white/70 transition-all duration-200 hover:scale-110"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Palette className="w-4 h-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-3">
                              <h4 className="font-medium">Kies een kleur</h4>
                              <div className="grid grid-cols-5 gap-2">
                                {pastelColors.map((colorClass, colorIndex) => (
                                  <Button
                                    key={colorIndex}
                                    variant="outline"
                                    size="sm"
                                    className={`h-8 w-8 p-0 ${colorClass.split(' ').slice(0, 2).join(' ')} hover:scale-110 transition-transform border-2`}
                                    onClick={() => handleColorChange(phase.id, colorIndex)}
                                  />
                                ))}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-100 text-red-600 hover:text-red-700 transition-all duration-200 hover:scale-110"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePhase(phase.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0">
                    <p className="text-gray-700 text-sm line-clamp-2 leading-relaxed">{phase.description}</p>
                    
                    {/* Enhanced Progress Section */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 font-medium">Voortgang</span>
                        <span className={`font-bold ${progressColor}`}>{progress.toFixed(0)}%</span>
                      </div>
                      <div className="relative">
                        <Progress value={progress} className="h-2.5" />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>{phase.checklist.filter(item => item.completed).length} voltooid</span>
                          <span>{phase.checklist.length} totaal</span>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Status Badges */}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {phase.completed ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Voltooid
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                            <Clock className="w-3 h-3 mr-1" />
                            Actief
                          </Badge>
                        )}
                      </div>
                      {phase.locked && (
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          <Lock className="w-3 h-3 mr-1" />
                          Vergrendeld
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Enhanced Selected Phase Detail */}
          {selectedPhase && (
            <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-b">
                <CardTitle className="text-xl font-bold flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      {React.createElement(getPhaseIcon(project.phases.findIndex(p => p.id === selectedPhase.id)), { 
                        className: "w-6 h-6 text-blue-700" 
                      })}
                    </div>
                    <span className="text-gray-800">{selectedPhase.name}</span>
                    <Popover open={isEditingPhaseName} onOpenChange={setIsEditingPhaseName}>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={handlePhaseNameEdit} className="hover:bg-blue-100">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-2">
                          <h4 className="font-medium">Edit Phase Name</h4>
                          <Input
                            value={editingPhaseName}
                            onChange={(e) => setEditingPhaseName(e.target.value)}
                            placeholder="Enter new phase name"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handlePhaseNameSave();
                              } else if (e.key === 'Escape') {
                                handlePhaseNameCancel();
                              }
                            }}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handlePhaseNameSave}>
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={handlePhaseNameCancel}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handlePhaseCompletionToggle(selectedPhase.id, !selectedPhase.completed)}
                      className="hover:scale-105 transition-transform"
                    >
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handlePhaseLockToggle(selectedPhase.id, !selectedPhase.locked)}
                      className="hover:scale-105 transition-transform"
                    >
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
              <CardContent className="space-y-6 p-6">
                <p className="text-gray-700 text-base leading-relaxed">{selectedPhase.description}</p>
                
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    {t('projectDetail.checklist')}
                  </h4>
                  <ul className="list-none pl-0 space-y-3">
                    {selectedPhase.checklist.map(item => (
                      <li key={item.id} className="flex items-center justify-between p-4 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center flex-1">
                          <input
                            type="checkbox"
                            id={item.id}
                            className="mr-4 h-5 w-5 rounded text-blue-600 focus:ring-blue-500 focus:ring-2"
                            checked={item.completed}
                            onChange={(e) => handleChecklistItemToggle(selectedPhase.id, item.id, e.target.checked)}
                          />
                          <div className="flex-1">
                            <label htmlFor={item.id} className={`text-gray-700 ${item.required ? 'font-medium' : ''} block text-sm leading-relaxed`}>
                              {item.description}
                            </label>
                            {item.notes && (
                              <p className="text-sm text-gray-500 mt-1 pl-0">{item.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {item.photos && item.photos.length > 0 && (
                            <Badge variant="secondary" className="mr-2 bg-blue-50 text-blue-700">
                              <Camera className="w-3 h-3 mr-1" />
                              {item.photos.length} {t('projectDetail.photos')}
                            </Badge>
                          )}
                          <Dialog open={editingChecklistItem?.phaseId === selectedPhase.id && editingChecklistItem?.itemId === item.id} onOpenChange={(open) => !open && handleCancelEditChecklistItem()}>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditChecklistItem(selectedPhase.id, item.id)}
                                className="hover:bg-blue-50 hover:scale-105 transition-all"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Checklist Item</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium mb-2">Description</label>
                                  <Input
                                    value={editingItemText}
                                    onChange={(e) => setEditingItemText(e.target.value)}
                                    placeholder="Enter description"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2">
                                    <MessageSquare className="w-4 h-4 inline mr-1" />
                                    Notes
                                  </label>
                                  <Textarea
                                    value={editingItemNotes}
                                    onChange={(e) => setEditingItemNotes(e.target.value)}
                                    placeholder="Add notes or additional information"
                                    rows={3}
                                  />
                                </div>
                                <div className="flex gap-2 justify-end">
                                  <Button variant="outline" onClick={handleCancelEditChecklistItem}>
                                    Cancel
                                  </Button>
                                  <Button onClick={handleSaveChecklistItem}>
                                    Save
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <CameraCapture
                            onCapture={(photoBlob) => handleAddPhotoToChecklist(selectedPhase.id, item.id, photoBlob)}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <ProjectDetailMaterials 
                  projectId={project.id.toString()}
                  phaseId={selectedPhase.id}
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

        <TabsContent value="drawings" className="space-y-4">
          <ConstructionDrawings 
            projectId={project.id.toString()}
            title="Bouwtekeningen & Plattegronden"
          />
        </TabsContent>

        <TabsContent value="styling" className="space-y-4">
          <HomeStyleAI 
            projectId={project.id.toString()}
            title="AI Interior Styling"
          />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <ProjectFiles 
            projectId={project.id.toString()}
            title="Project Documentatie"
          />
        </TabsContent>
      </Tabs>

      {/* Onderaannemers Section moved above MaterialsCalculator */}
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

      {/* Materials Calculator moved to the bottom */}
      <MaterialsCalculator project={project} />
    </div>
  );
}
