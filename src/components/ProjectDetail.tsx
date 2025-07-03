import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, Calendar as CalendarIcon, Users, CheckCircle, Clock, Lock, Camera, FileText, Package, Euro, ExternalLink, Hammer, Plus, Trash2, Palette, Wrench, PaintBucket, Zap, Building, Drill, HardHat, Activity, ChevronDown, Pencil, Grid2X2, Grid3X3, Kanban, Info } from "lucide-react";
import { Project, Phase } from "@/pages/Index";
import { CameraCapture } from "./CameraCapture";
import { PhotoGallery } from "./PhotoGallery";
import { ProjectInfoOverview } from "./ProjectInfoOverview";
import { MaterialsCalculator } from "./MaterialsCalculator";
import { ProjectFiles } from "./ProjectFiles";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { ConstructionDrawings } from "./ConstructionDrawings";
import { HomeStyleAI } from "./HomeStyleAI";
import { projectService } from "@/services/projectService";
import { ProjectMaterialsList } from "./materials/ProjectMaterialsList";
import { PhaseBadge, PhaseStatus } from "./phase/PhaseBadge";
import { PhaseLegend } from "./phase/PhaseLegend";
import { KanbanView } from "./phase/KanbanView";
import { ProjectTeamManager } from "./ProjectTeamManager";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { PhaseCalendarPlanner } from "./phase/PhaseCalendarPlanner";
import { PhaseTimeline } from "./phase/PhaseTimeline";
import { PhaseSchedulingDialog } from "./phase/PhaseSchedulingDialog";

interface ProjectDetailProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
  onBack: () => void;
}

// Helper function to determine phase status based on existing Phase properties
function getPhaseStatus(phase: Phase): PhaseStatus {
  if (phase.completed) return "done";
  if (phase.locked) return "queued";
  // Check if phase has any special indicators (you can customize this logic)
  const hasSpecialTasks = phase.checklist.some(item => item.description.toLowerCase().includes('special') || item.description.toLowerCase().includes('help'));
  if (hasSpecialTasks) return "special";
  return "active";
}

export function ProjectDetail({ project, onUpdateProject, onBack }: ProjectDetailProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("phases");
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('grid');
  const [editingPhaseId, setEditingPhaseId] = useState<number | null>(null);
  const [editingPhaseName, setEditingPhaseName] = useState("");
  const [editingPhaseDescriptionId, setEditingPhaseDescriptionId] = useState<number | null>(null);
  const [editingPhaseDescription, setEditingPhaseDescription] = useState("");
  const [colorPopoverOpen, setColorPopoverOpen] = useState<{[phaseId: number]: boolean}>({});
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [teamMembersCount, setTeamMembersCount] = useState(project.teamMembers.length);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [selectedPhaseForScheduling, setSelectedPhaseForScheduling] = useState<Phase | null>(null);
  const { toast } = useToast();

  // Load phase colors from the database when project loads
  useEffect(() => {
    const loadPhaseColors = async () => {
      try {
        const phases = await projectService.fetchProjectPhases(project.id);
        console.log('Loaded phases with colors:', phases);
      } catch (error) {
        console.error('Error loading phase colors:', error);
      }
    };

    loadPhaseColors();
  }, [project.id]);

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
    // Use the color_index from the phase if it exists, otherwise use the default index
    const colorIndex = phase.color_index !== null && phase.color_index !== undefined 
      ? phase.color_index 
      : index % pastelColors.length;
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

  const handleColorChange = async (phaseId: number, colorIndex: number) => {
    try {
      // Update the color in the database
      await projectService.updateProjectPhase(project.id, phaseId, { 
        color_index: colorIndex 
      });

      // Update the local project state
      const updatedPhases = project.phases.map(phase => 
        phase.id === phaseId 
          ? { ...phase, color_index: colorIndex }
          : phase
      );
      
      const updatedProject = { ...project, phases: updatedPhases };
      onUpdateProject(updatedProject);
      
      // Close the popover after selection
      setColorPopoverOpen(prev => ({
        ...prev,
        [phaseId]: false
      }));
      
      toast({
        title: "Kleur bijgewerkt",
        description: "De fase kleur is succesvol gewijzigd en opgeslagen.",
      });
    } catch (error) {
      console.error('Error updating phase color:', error);
      toast({
        title: "Fout",
        description: "Kon fase kleur niet bijwerken.",
        variant: "destructive",
      });
    }
  };

  const handleColorPopoverToggle = (phaseId: number, open: boolean) => {
    setColorPopoverOpen(prev => ({
      ...prev,
      [phaseId]: open
    }));
  };

  const handlePhaseClick = (phase: Phase) => {
    navigate(`/project/${project.id}/phase/${phase.id}`);
  };

  const handlePhaseScheduleClick = (phase: Phase) => {
    setSelectedPhaseForScheduling(phase);
  };

  const handlePhaseUpdate = async (phaseId: number, updates: { 
    completed?: boolean; 
    locked?: boolean; 
    color_index?: number;
    name?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    try {
      await projectService.updateProjectPhase(project.id, phaseId, updates);
      
      // Reload the project to get the updated data
      const updatedProject = await projectService.getProject(project.id);
      onUpdateProject(updatedProject);
      
      toast({
        title: "Phase updated successfully",
        description: "Phase has been updated with new information.",
      });
    } catch (error) {
      console.error("Error updating phase:", error);
      toast({
        title: "Error",
        description: "Failed to update phase.",
        variant: "destructive",
      });
    }
  };

  const getPreviousPhaseEndDate = (phaseId: number): Date | undefined => {
    const currentPhaseIndex = project.phases.findIndex(p => p.id === phaseId);
    if (currentPhaseIndex <= 0) return undefined;
    
    const previousPhase = project.phases[currentPhaseIndex - 1];
    return previousPhase.end_date ? new Date(previousPhase.end_date) : undefined;
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

  const scrollToMaterialsCalculator = () => {
    const element = document.getElementById('materials-calculator');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
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
        materials: [],
        labour: []
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

  const handleEditPhaseName = (phase: Phase) => {
    setEditingPhaseId(phase.id);
    setEditingPhaseName(phase.name);
  };

  const handleSavePhaseName = async (phaseId: number) => {
    if (!editingPhaseName.trim()) {
      toast({
        title: "Fout",
        description: "Fase naam mag niet leeg zijn.",
        variant: "destructive",
      });
      return;
    }

    try {
      await projectService.updateProjectPhase(project.id, phaseId, {
        name: editingPhaseName.trim()
      });

      const updatedPhases = project.phases.map(phase => 
        phase.id === phaseId 
          ? { ...phase, name: editingPhaseName.trim() }
          : phase
      );
      
      const updatedProject = { ...project, phases: updatedPhases };
      onUpdateProject(updatedProject);
      
      setEditingPhaseId(null);
      setEditingPhaseName("");
      
      toast({
        title: "Fase naam bijgewerkt",
        description: "De fase naam is succesvol gewijzigd.",
      });
    } catch (error) {
      console.error('Error updating phase name:', error);
      toast({
        title: "Fout",
        description: "Kon fase naam niet bijwerken.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEditPhaseName = () => {
    setEditingPhaseId(null);
    setEditingPhaseName("");
  };

  const handlePhaseNameKeyDown = (e: React.KeyboardEvent, phaseId: number) => {
    if (e.key === 'Enter') {
      handleSavePhaseName(phaseId);
    } else if (e.key === 'Escape') {
      handleCancelEditPhaseName();
    }
  };

  const handleEditPhaseDescription = (phase: Phase) => {
    setEditingPhaseDescriptionId(phase.id);
    setEditingPhaseDescription(phase.description);
  };

  const handleSavePhaseDescription = async (phaseId: number) => {
    if (editingPhaseDescription.length > 200) {
      toast({
        title: "Fout",
        description: "Beschrijving mag maximaal 200 karakters bevatten.",
        variant: "destructive",
      });
      return;
    }

    try {
      await projectService.updateProjectPhase(project.id, phaseId, {
        description: editingPhaseDescription.trim()
      });

      const updatedPhases = project.phases.map(phase => 
        phase.id === phaseId 
          ? { ...phase, description: editingPhaseDescription.trim() }
          : phase
      );
      
      const updatedProject = { ...project, phases: updatedPhases };
      onUpdateProject(updatedProject);
      
      setEditingPhaseDescriptionId(null);
      setEditingPhaseDescription("");
      
      toast({
        title: "Beschrijving bijgewerkt",
        description: "De fase beschrijving is succesvol gewijzigd.",
      });
    } catch (error) {
      console.error('Error updating phase description:', error);
      toast({
        title: "Fout",
        description: "Kon fase beschrijving niet bijwerken.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEditPhaseDescription = () => {
    setEditingPhaseDescriptionId(null);
    setEditingPhaseDescription("");
  };

  const handlePhaseDescriptionKeyDown = (e: React.KeyboardEvent, phaseId: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSavePhaseDescription(phaseId);
    } else if (e.key === 'Escape') {
      handleCancelEditPhaseDescription();
    }
  };

  const handleStartDateChange = async (date: Date | undefined) => {
    if (!date) return;

    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      // Update project in database
      const updatedProject = { ...project, startDate: formattedDate };
      await projectService.updateProject(updatedProject);
      
      // Update local state
      onUpdateProject(updatedProject);
      
      // Close the date picker
      setIsDatePickerOpen(false);
      
      toast({
        title: "Startdatum bijgewerkt",
        description: "De project startdatum is succesvol gewijzigd.",
      });
    } catch (error) {
      console.error('Error updating start date:', error);
      toast({
        title: "Fout",
        description: "Kon startdatum niet bijwerken.",
        variant: "destructive",
      });
    }
  };

  const handleTeamMembersChange = async () => {
    try {
      // Reload the project to get updated team members
      const updatedProject = await projectService.getProject(project.id);
      onUpdateProject(updatedProject);
      setTeamMembersCount(updatedProject.teamMembers.length);
    } catch (error) {
      console.error('Error reloading project team members:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Project Name Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-900 tracking-wide uppercase">
          {project.name}
        </h1>
      </div>

      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Ga terug
        </Button>
      </div>

      {/* Project Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Project planning</CardTitle>
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

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 group"
          onClick={scrollToMaterialsCalculator}
        >
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center justify-between">
              Totale Kosten
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-gray-700">
              <Euro className="w-4 h-4 mr-2 text-green-600" />
              <span className="text-xl font-bold text-green-900">€{getTotalProjectCost().toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1 group-hover:text-gray-700 transition-colors">
              Klik voor gedetailleerde kostenberekening
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{t('projectDetail.startDate')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-left font-normal p-0 h-auto text-gray-700 hover:text-gray-900 hover:bg-gray-50",
                    "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
                  )}
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {format(new Date(project.startDate), "dd/MM/yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={new Date(project.startDate)}
                  onSelect={handleStartDateChange}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-gray-700">
                <Users className="w-4 h-4 mr-2 inline-block" />
                {teamMembersCount} {t('projectDetail.members')}
              </div>
              <ProjectTeamManager 
                projectId={project.id}
                onTeamMembersChange={handleTeamMembersChange}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <FileText className="w-4 h-4 mr-2" />
            Project Overview
          </TabsTrigger>
          <TabsTrigger value="info">
            <Info className="w-4 h-4 mr-2" />
            Project Info
          </TabsTrigger>
          <TabsTrigger value="phases">
            <Clock className="w-4 h-4 mr-2" />
            {t('projectDetail.phases')}
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="timeline">
            <Activity className="w-4 h-4 mr-2" />
            Timeline
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
        
        <TabsContent value="info" className="space-y-6">
          <ProjectInfoOverview project={project} onUpdateProject={onUpdateProject} />
        </TabsContent>

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
              <CardTitle className="text-lg font-semibold">Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Startdatum</label>
                  <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1",
                          "hover:bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        )}
                      >
                        <CalendarIcon className="w-4 h-4 mr-2 text-gray-500" />
                        {format(new Date(project.startDate), "dd MMMM yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={new Date(project.startDate)}
                        onSelect={handleStartDateChange}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Huidige Fase</label>
                  <div className="mt-1 text-gray-900 font-medium">
                    Fase {project.currentPhase}
                  </div>
                </div>
              </div>
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

        <TabsContent value="calendar">
          <PhaseCalendarPlanner
            phases={project.phases}
            currentDate={currentCalendarDate}
            onDateChange={setCurrentCalendarDate}
            onPhaseClick={handlePhaseScheduleClick}
          />
        </TabsContent>

        <TabsContent value="timeline">
          <PhaseTimeline
            phases={project.phases}
            onPhaseClick={handlePhaseScheduleClick}
          />
        </TabsContent>

        <TabsContent value="phases" className="space-y-6">
          {/* Phase Legend and Header */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <PhaseLegend compact />
            </div>
            <div className="lg:col-span-3">
              {/* Enhanced Add Phase Button with View Toggle */}
              <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-100 border-2 border-indigo-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-indigo-900 mb-1">Projectfases Beheren</h3>
                    <p className="text-indigo-700 text-sm">Voeg nieuwe fasen toe of beheer bestaande fasen van uw project.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Primary View Toggle - Now uses Grid3X3 and different styling */}
                    <div className="bg-gradient-to-r from-emerald-100 to-teal-100 p-2 rounded-xl border-2 border-emerald-400 shadow-lg">
                      <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'grid' | 'kanban')}>
                        <ToggleGroupItem value="grid" aria-label="Advanced Grid weergave" className="data-[state=on]:bg-emerald-500 data-[state=on]:text-white shadow-md border-emerald-300">
                          <Grid3X3 className="w-5 h-5" />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="kanban" aria-label="Advanced Kanban weergave" className="data-[state=on]:bg-emerald-500 data-[state=on]:text-white shadow-md border-emerald-300">
                          <Kanban className="w-5 h-5" />
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                    
                    {/* Secondary View Toggle - Keeps original Grid2X2 */}
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-2 rounded-xl border-2 border-purple-400 shadow-lg">
                      <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'grid' | 'kanban')}>
                        <ToggleGroupItem value="grid" aria-label="Grid weergave" className="data-[state=on]:bg-purple-500 data-[state=on]:text-white shadow-md">
                          <Grid2X2 className="w-5 h-5" />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="kanban" aria-label="Kanban weergave" className="data-[state=on]:bg-purple-500 data-[state=on]:text-white shadow-md">
                          <Kanban className="w-5 h-5" />
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        onClick={handleAddPhase} 
                        size="lg"
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg transition-all hover:shadow-xl hover:scale-105"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Nieuwe Fase Toevoegen
                      </Button>
                      <Button 
                        onClick={() => navigate('/checklist-creator')} 
                        size="lg"
                        variant="outline"
                        className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 shadow-lg transition-all hover:shadow-xl hover:scale-105"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Checklist Toevoegen
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Conditional View Rendering */}
          {viewMode === 'kanban' ? (
            <KanbanView
              phases={project.phases}
              onPhaseClick={handlePhaseClick}
              onEditPhaseName={handleEditPhaseName}
              onDeletePhase={handleDeletePhase}
              getPhaseProgress={getPhaseProgress}
              getPhaseStatus={getPhaseStatus}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {project.phases.map((phase, index) => {
                const PhaseIcon = getPhaseIcon(index);
                const progress = getPhaseProgress(phase);
                const progressColor = getPhaseProgressColor(progress);
                const isEditingName = editingPhaseId === phase.id;
                const isEditingDescription = editingPhaseDescriptionId === phase.id;
                const phaseStatus = getPhaseStatus(phase);
                const currentColorIndex = phase.color_index !== null && phase.color_index !== undefined 
                  ? phase.color_index 
                  : index % pastelColors.length;
                
                return (
                  <Card 
                    key={phase.id} 
                    className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 transform shadow-md hover:shadow-lg ${getPhaseColor(phase, index)} backdrop-blur-sm`} 
                    onClick={() => !isEditingName && !isEditingDescription && handlePhaseClick(phase)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-bold flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-white/60 backdrop-blur-sm">
                            <PhaseIcon className="w-5 h-5 text-gray-700" />
                          </div>
                          <div className="flex flex-col">
                            {isEditingName ? (
                              <Input
                                value={editingPhaseName}
                                onChange={(e) => setEditingPhaseName(e.target.value)}
                                onKeyDown={(e) => handlePhaseNameKeyDown(e, phase.id)}
                                onBlur={() => handleSavePhaseName(phase.id)}
                                className="text-sm font-bold bg-white/80 border-blue-300 focus:border-blue-500"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <span className="text-gray-800 leading-tight">{phase.name}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-white/70 transition-all duration-200 hover:scale-110"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditPhaseName(phase);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Popover 
                            open={colorPopoverOpen[phase.id] || false}
                            onOpenChange={(open) => handleColorPopoverToggle(phase.id, open)}
                          >
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
                            <PopoverContent className="w-80 bg-white border-gray-200 shadow-lg z-50">
                              <div className="space-y-3">
                                <h4 className="font-medium">Kies een kleur</h4>
                                <div className="grid grid-cols-5 gap-2">
                                  {pastelColors.map((colorClass, colorIndex) => (
                                    <Button
                                      key={colorIndex}
                                      variant="outline"
                                      size="sm"
                                      className={`h-10 w-10 p-0 ${colorClass.split(' ').slice(0, 2).join(' ')} hover:scale-110 transition-transform border-2 ${
                                        currentColorIndex === colorIndex ? 'ring-2 ring-blue-500 border-blue-500' : ''
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleColorChange(phase.id, colorIndex);
                                      }}
                                    >
                                      {currentColorIndex === colorIndex && (
                                        <CheckCircle className="w-4 h-4 text-blue-600" />
                                      )}
                                    </Button>
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
                      {/* Editable Description */}
                      <div onClick={(e) => e.stopPropagation()}>
                        {isEditingDescription ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editingPhaseDescription}
                              onChange={(e) => setEditingPhaseDescription(e.target.value)}
                              onKeyDown={(e) => handlePhaseDescriptionKeyDown(e, phase.id)}
                              className="text-sm bg-white/80 border-blue-300 focus:border-blue-500 min-h-[60px] resize-none"
                              placeholder="Fase beschrijving..."
                              maxLength={200}
                              autoFocus
                            />
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-500">
                                {editingPhaseDescription.length}/200 karakters
                              </span>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={handleCancelEditPhaseDescription}
                                  className="h-6 px-2 text-xs"
                                >
                                  Annuleren
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleSavePhaseDescription(phase.id)}
                                  className="h-6 px-2 text-xs"
                                >
                                  Opslaan
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p 
                            className="text-gray-700 text-sm line-clamp-2 leading-relaxed cursor-text hover:bg-white/30 rounded p-1 transition-colors"
                            onClick={() => handleEditPhaseDescription(phase)}
                            title="Klik om te bewerken"
                          >
                            {phase.description || "Klik om beschrijving toe te voegen..."}
                          </p>
                        )}
                      </div>
                      
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

                      {/* Enhanced Status Badges - Updated to use new PhaseBadge */}
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <PhaseBadge status={phaseStatus} size="sm" />
                        </div>
                        {phase.locked && (
                          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-orange-50 text-orange-700 border-orange-200">
                            <Lock className="w-3 h-3 mr-1" />
                            Vergrendeld
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
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

      {/* Project Materials List - New comprehensive materials overview */}
      <ProjectMaterialsList 
        projectId={project.id.toString()} 
        phases={project.phases.map(phase => ({ id: phase.id, name: phase.name }))}
      />

      {/* Materials Calculator moved to the bottom */}
      <MaterialsCalculator project={project} />

      <PhaseSchedulingDialog
        open={!!selectedPhaseForScheduling}
        onOpenChange={(open) => !open && setSelectedPhaseForScheduling(null)}
        phase={selectedPhaseForScheduling}
        onSave={handlePhaseUpdate}
        previousPhaseEndDate={selectedPhaseForScheduling ? getPreviousPhaseEndDate(selectedPhaseForScheduling.id) : undefined}
      />
    </div>
  );
}
