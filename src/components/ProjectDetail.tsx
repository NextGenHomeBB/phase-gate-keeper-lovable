import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, Calendar, Users, CheckCircle, Clock, Lock, Camera, FileText, Package, Euro, ExternalLink, Hammer, Plus, Trash2, Palette, Wrench, PaintBucket, Zap, Building, Drill, HardHat, Activity } from "lucide-react";
import { Project, Phase } from "@/pages/Index";
import { CameraCapture } from "./CameraCapture";
import { PhotoGallery } from "./PhotoGallery";
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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("phases");
  const [customColors, setCustomColors] = useState<{[phaseId: number]: number}>({});
  const { toast } = useToast();

  // Lighter pastel color classes for phase cards
  const pastelColors = [
    "bg-gradient-to-br from-pink-50 via-pink-25 to-pink-100 border-pink-200 hover:border-pink-300",
    "bg-gradient-to-br from-blue-50 via-blue-25 to-blue-100 border-blue-200 hover:border-blue-300", 
    "bg-gradient-to-br from-green-50 via-green-25 to-green-100 border-green-200 hover:border-green-300",
    "bg-gradient-to-br from-yellow-50 via-yellow-25 to-yellow-100 border-yellow-200 hover:border-yellow-300",
    "bg-gradient-to-br from-purple-50 via-purple-25 to-purple-100 border-purple-200 hover:border-purple-300",
    "bg-gradient-to-br from-indigo-50 via-indigo-25 to-indigo-100 border-indigo-200 hover:border-indigo-300",
    "bg-gradient-to-br from-teal-50 via-teal-25 to-teal-100 border-teal-200 hover:border-teal-300",
    "bg-gradient-to-br from-orange-50 via-orange-25 to-orange-100 border-orange-200 hover:border-orange-300",
    "bg-gradient-to-br from-rose-50 via-rose-25 to-rose-100 border-rose-200 hover:border-rose-300",
    "bg-gradient-to-br from-cyan-50 via-cyan-25 to-cyan-100 border-cyan-200 hover:border-cyan-300",
    "bg-gradient-to-br from-lime-50 via-lime-25 to-lime-100 border-lime-200 hover:border-lime-300",
    "bg-gradient-to-br from-amber-50 via-amber-25 to-amber-100 border-amber-200 hover:border-amber-300",
    "bg-gradient-to-br from-emerald-50 via-emerald-25 to-emerald-100 border-emerald-200 hover:border-emerald-300",
    "bg-gradient-to-br from-sky-50 via-sky-25 to-sky-100 border-sky-200 hover:border-sky-300",
    "bg-gradient-to-br from-violet-50 via-violet-25 to-violet-100 border-violet-200 hover:border-violet-300",
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

  const handlePhaseClick = (phase: Phase) => {
    navigate(`/project/${project.id}/phase/${phase.id}`);
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
            <CardTitle className="text-lg font-semibold">Project Voortgang</CardTitle>
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
            <CardTitle className="text-lg font-semibold">Team Members</CardTitle>
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
                  className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 transform shadow-md hover:shadow-lg ${getPhaseColor(phase, index)} backdrop-blur-sm`} 
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
