import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { TeamMember } from "./TeamPage";
import { teamService } from "@/services/teamService";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { PhaseTimeline } from "./phase/PhaseTimeline";
import { PhaseSchedulingDialog } from "./phase/PhaseSchedulingDialog";
import { CategoryStartDatesDialog } from "./CategoryStartDatesDialog";
import { secureProjectService } from "@/services/secureProjectService";

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
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("phases");
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('grid');
  const [editingPhaseId, setEditingPhaseId] = useState<number | null>(null);
  const [editingPhaseName, setEditingPhaseName] = useState("");
  const [editingPhaseDescriptionId, setEditingPhaseDescriptionId] = useState<number | null>(null);
  const [editingPhaseDescription, setEditingPhaseDescription] = useState("");
  const [colorPopoverOpen, setColorPopoverOpen] = useState<{[phaseId: number]: boolean}>({});
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isProjectDatePickerOpen, setIsProjectDatePickerOpen] = useState(false);
  const [teamMembersCount, setTeamMembersCount] = useState(project.teamMembers.length);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [selectedPhaseForScheduling, setSelectedPhaseForScheduling] = useState<Phase | null>(null);
  const [categoryDatesDialogOpen, setCategoryDatesDialogOpen] = useState(false);
  const [projectDates, setProjectDates] = useState<{date: Date, item: string}[]>([]);
  const [isAddingDate, setIsAddingDate] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [allTeamMembers, setAllTeamMembers] = useState<TeamMember[]>([]);
  const [phaseResponsibles, setPhaseResponsibles] = useState<{[phaseId: number]: string}>({});
  const [projectResponsible, setProjectResponsible] = useState<string>(project.project_manager || "");
  const { toast } = useToast();

  const deliveryItems = [
    "Keukenlevering",
    "Vloerenlevering", 
    "Tegellevering",
    "Overige",
    "Bouwmaterialen"
  ];

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

  // Load team members for selection
  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        const members = await teamService.fetchTeamMembers();
        setAllTeamMembers(members);
      } catch (error) {
        console.error('Error loading team members:', error);
      }
    };

    loadTeamMembers();
  }, []);

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

  const scrollToTeamMembers = () => {
    console.log('Attempting to scroll to team members section');
    const element = document.getElementById('team-members-section');
    if (element) {
      console.log('Team members section found, scrolling...');
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      console.log('Team members section not found, retrying...');
      // Retry once after a short delay
      setTimeout(() => {
        const retryElement = document.getElementById('team-members-section');
        if (retryElement) {
          console.log('Team members section found on retry, scrolling...');
          retryElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
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
    console.log('handleStartDateChange called with:', date);
    console.log('Current categoryDatesDialogOpen state:', categoryDatesDialogOpen);
    
    // Close both date pickers first
    setIsDatePickerOpen(false);
    setIsProjectDatePickerOpen(false);
    
    // Open the category dates dialog
    setCategoryDatesDialogOpen(true);
    console.log('Setting categoryDatesDialogOpen to true');
  };

  const handleCategoryStartDatesSave = async (projectStartDate: string, categoryDates: Record<string, string>) => {
    try {
      // Update project in database using the new service method
      await secureProjectService.updateProjectStartDates(project.id, projectStartDate, categoryDates);
      
      // Update local state
      const updatedProject = { 
        ...project, 
        startDate: projectStartDate,
        categoryStartDates: categoryDates 
      };
      onUpdateProject(updatedProject);
      
      toast({
        title: "Startdatums bijgewerkt",
        description: "De project startdatum en categorie startdatums zijn succesvol gewijzigd.",
      });
    } catch (error) {
      console.error('Error updating start dates:', error);
      toast({
        title: "Fout",
        description: "Kon startdatums niet bijwerken.",
        variant: "destructive",
      });
    }
  };

  const handlePhaseResponsibleChange = (phaseId: number, responsibleId: string) => {
    setPhaseResponsibles(prev => ({
      ...prev,
      [phaseId]: responsibleId
    }));
    
    // Auto-scroll to team members section when a responsible is selected
    if (responsibleId && responsibleId !== "none" && responsibleId !== "") {
      console.log('Phase responsible selected:', responsibleId, 'starting scroll timer and auto-select');
      setTimeout(() => {
        scrollToTeamMembers();
      }, 300); // Increased delay to ensure dropdown fully closes and DOM updates
    }
  };

  const handleProjectResponsibleChange = async (responsibleId: string) => {
    try {
      const actualResponsibleId = responsibleId === "none" ? "" : responsibleId;
      setProjectResponsible(responsibleId);
      // Update project in database
      const updatedProject = { ...project, project_manager: actualResponsibleId };
      await projectService.updateProject(updatedProject);
      onUpdateProject(updatedProject);
      
      toast({
        title: "Project manager bijgewerkt",
        description: "De projectverantwoordelijke is succesvol gewijzigd.",
      });
    } catch (error) {
      console.error('Error updating project responsible:', error);
      toast({
        title: "Fout",
        description: "Kon projectverantwoordelijke niet bijwerken.",
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
    <div className={cn("space-y-4", isMobile ? "px-2" : "space-y-6")}>
      {/* Project Name Header */}
      <div className={cn(isMobile ? "text-left" : "text-center")}>
        <h1 className={cn(
          "font-bold text-blue-900 tracking-wide uppercase",
          isMobile ? "text-xl" : "text-4xl"
        )}>
          {project.name}
        </h1>
      </div>

      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className={cn(isMobile ? "h-10 px-3" : "")}
        >
          <ArrowLeft className={cn("mr-2", isMobile ? "w-4 h-4" : "w-5 h-5")} />
          Ga terug
        </Button>
      </div>

      {/* Project Overview Cards */}
      <div className={cn(
        "grid gap-4",
        isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
      )}>
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
            <CardTitle className="text-lg font-semibold">Project Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => setCategoryDatesDialogOpen(true)}
              className={cn(
                "w-full justify-start text-left font-normal p-3",
                "hover:bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                "cursor-pointer transition-colors duration-200"
              )}
            >
              <CalendarIcon className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="flex-1">
                {project.startDate ? (
                  <div className="flex flex-col">
                    <span>{format(new Date(project.startDate), "dd/MM/yyyy")}</span>
                    {project.categoryStartDates && Object.keys(project.categoryStartDates).length > 0 && (
                      <span className="text-xs text-gray-500">
                        + {Object.keys(project.categoryStartDates).length} categories
                      </span>
                    )}
                  </div>
                ) : (
                  "Selecteer project startdatum"
                )}
              </span>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Leveringen
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingDate(true)}
                className="h-8 px-3 hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Toevoegen
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
               {projectDates.length > 0 ? (
                 <>
                   <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin">
                     {projectDates.map((entry, index) => (
                       <div key={index} className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border border-border/50 hover:bg-muted/70 transition-colors">
                         <div className="flex-1 min-w-0">
                           <div className="font-medium text-sm text-foreground truncate">{entry.item}</div>
                           <div className="text-xs text-muted-foreground">{format(entry.date, "dd MMM yyyy")}</div>
                         </div>
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => {
                             const newDates = projectDates.filter((_, i) => i !== index);
                             setProjectDates(newDates);
                           }}
                           className="h-7 w-7 p-0 text-destructive hover:text-destructive/80 hover:bg-destructive/10 flex-shrink-0 rounded-md"
                         >
                           <Trash2 className="h-3 w-3" />
                         </Button>
                       </div>
                     ))}
                   </div>
                   <div className="border-t border-border/50 pt-3 mt-3">
                     <div className="flex items-center text-sm font-medium text-muted-foreground">
                       <Package className="w-4 h-4 mr-2 text-primary" />
                       Totaal: {projectDates.length} levering{projectDates.length !== 1 ? 'en' : ''}
                     </div>
                   </div>
                 </>
               ) : (
                 <div className="text-center py-6 text-muted-foreground">
                   <Package className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                   <p className="text-sm">Geen leveringen toegevoegd</p>
                   <p className="text-xs mt-1">Klik op 'Toevoegen' om een levering toe te voegen</p>
                 </div>
               )}
            </div>
          </CardContent>
        </Card>

        {isAddingDate && (
          <Dialog open={isAddingDate} onOpenChange={setIsAddingDate}>
            <DialogContent className="sm:max-w-[450px] bg-background">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Levering Toevoegen
                </DialogTitle>
                <DialogDescription>
                  Selecteer een leveringstype en datum om toe te voegen aan de project leveringen lijst.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Leveringstype
                  </label>
                  <Select value={selectedItem} onValueChange={setSelectedItem}>
                    <SelectTrigger className="w-full focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder="Selecteer leveringstype" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg z-[100]">
                      {deliveryItems.map((item) => (
                        <SelectItem 
                          key={item} 
                          value={item} 
                          className="hover:bg-muted focus:bg-muted cursor-pointer"
                        >
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Leveringsdatum
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal focus:ring-2 focus:ring-primary/20",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "dd MMM yyyy") : "Selecteer een datum"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-background border shadow-lg z-[100]" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto bg-background")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <DialogFooter className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAddingDate(false);
                    setSelectedDate(undefined);
                    setSelectedItem("");
                  }}
                  className="flex-1"
                >
                  Annuleren
                </Button>
                <Button 
                  onClick={() => {
                    if (selectedDate && selectedItem) {
                      setProjectDates([...projectDates, { date: selectedDate, item: selectedItem }]);
                      setIsAddingDate(false);
                      setSelectedDate(undefined);
                      setSelectedItem("");
                      toast({
                        title: "Levering toegevoegd",
                        description: `${selectedItem} op ${format(selectedDate, "dd MMM yyyy")} is toegevoegd.`,
                      });
                    }
                  }} 
                  disabled={!selectedDate || !selectedItem}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Toevoegen
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <Card id="team-members-section">
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
                autoSelectMemberId={Object.values(phaseResponsibles).find(id => id && id !== "none") || undefined}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={cn(
          isMobile ? "grid grid-cols-2 gap-1 h-auto p-1" : "flex flex-wrap"
        )}>
          <TabsTrigger value="overview" className={cn(isMobile ? "text-xs px-2 py-1" : "")}>
            <FileText className={cn(isMobile ? "w-3 h-3 mr-1" : "w-4 h-4 mr-2")} />
            {isMobile ? "Overview" : "Project Overview"}
          </TabsTrigger>
          <TabsTrigger value="info" className={cn(isMobile ? "text-xs px-2 py-1" : "")}>
            <Info className={cn(isMobile ? "w-3 h-3 mr-1" : "w-4 h-4 mr-2")} />
            {isMobile ? "Info" : "Project Info"}
          </TabsTrigger>
          <TabsTrigger value="phases" className={cn(isMobile ? "text-xs px-2 py-1" : "")}>
            <Clock className={cn(isMobile ? "w-3 h-3 mr-1" : "w-4 h-4 mr-2")} />
            {isMobile ? "Phases" : t('projectDetail.phases')}
          </TabsTrigger>
          <TabsTrigger value="calendar" className={cn(isMobile ? "text-xs px-2 py-1" : "")}>
            <CalendarIcon className={cn(isMobile ? "w-3 h-3 mr-1" : "w-4 h-4 mr-2")} />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="timeline" className={cn(isMobile ? "text-xs px-2 py-1" : "")}>
            <Activity className={cn(isMobile ? "w-3 h-3 mr-1" : "w-4 h-4 mr-2")} />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="photos" className={cn(isMobile ? "text-xs px-2 py-1" : "")}>
            <Camera className={cn(isMobile ? "w-3 h-3 mr-1" : "w-4 h-4 mr-2")} />
            {isMobile ? "Photos" : "Project Photos"}
          </TabsTrigger>
          <TabsTrigger value="drawings" className={cn(isMobile ? "text-xs px-2 py-1" : "")}>
            <FileText className={cn(isMobile ? "w-3 h-3 mr-1" : "w-4 h-4 mr-2")} />
            {isMobile ? "Drawings" : "Bouwtekeningen"}
          </TabsTrigger>
          <TabsTrigger value="styling" className={cn(isMobile ? "text-xs px-2 py-1" : "")}>
            <Hammer className={cn(isMobile ? "w-3 h-3 mr-1" : "w-4 h-4 mr-2")} />
            {isMobile ? "Styling" : "Home Styling AI"}
          </TabsTrigger>
          <TabsTrigger value="documents" className={cn(isMobile ? "text-xs px-2 py-1" : "")}>
            <FileText className={cn(isMobile ? "w-3 h-3 mr-1" : "w-4 h-4 mr-2")} />
            {isMobile ? "Docs" : "Documentatie"}
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
              {/* Project Responsible Selection */}
              <div>
                <label className="text-sm font-medium text-gray-600">Project Verantwoordelijke</label>
                <Select 
                  value={projectResponsible || "none"} 
                  onValueChange={handleProjectResponsibleChange}
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Selecteer project verantwoordelijke" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Geen verantwoordelijke</SelectItem>
                    {allTeamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{member.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {member.roles ? member.roles.join(", ") : member.role}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className={cn(
                "gap-4",
                isMobile ? "grid grid-cols-1" : "grid grid-cols-1 md:grid-cols-2"
              )}>
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
          <div className="space-y-4">
            <div className="text-center py-8 bg-muted/20 rounded-lg border-dashed border-2">
              <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">Calendar View</h3>
              <p className="text-sm text-muted-foreground">
                Project calendar functionality will be available soon.
              </p>
            </div>
          </div>
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
              <div className={cn(
                "bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-100 border-2 border-indigo-200 rounded-xl shadow-sm",
                isMobile ? "p-4" : "p-6"
              )}>
                <div className={cn(
                  "flex items-center",
                  isMobile ? "flex-col space-y-3" : "justify-between"
                )}>
                  <div className="space-y-1">
                    <h3 className={cn(
                      "font-bold text-indigo-900 mb-1",
                      isMobile ? "text-lg" : "text-xl"
                    )}>Projectfases Beheren</h3>
                    <p className={cn(
                      "text-indigo-700",
                      isMobile ? "text-xs" : "text-sm"
                    )}>Voeg nieuwe fasen toe of beheer bestaande fasen van uw project.</p>
                  </div>
                  <div className={cn(
                    "flex items-center",
                    isMobile ? "flex-col space-y-2 w-full" : "gap-4"
                  )}>
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
                    
                    <div className={cn(
                      "flex gap-2",
                      isMobile ? "flex-col w-full" : "gap-3"
                    )}>
                      <Button 
                        onClick={handleAddPhase} 
                        size={isMobile ? "sm" : "lg"}
                        className={cn(
                          "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg transition-all hover:shadow-xl hover:scale-105",
                          isMobile ? "w-full h-10" : ""
                        )}
                      >
                        <Plus className={cn("mr-2", isMobile ? "w-4 h-4" : "w-5 h-5")} />
                        {isMobile ? "Nieuwe Fase" : "Nieuwe Fase Toevoegen"}
                      </Button>
                      <Button 
                        onClick={() => navigate('/checklist-creator')} 
                        size={isMobile ? "sm" : "lg"}
                        variant="outline"
                        className={cn(
                          "border-indigo-300 text-indigo-700 hover:bg-indigo-50 shadow-lg transition-all hover:shadow-xl hover:scale-105",
                          isMobile ? "w-full h-10" : ""
                        )}
                      >
                        <Plus className={cn("mr-2", isMobile ? "w-4 h-4" : "w-5 h-5")} />
                        {isMobile ? "Checklist" : "Checklist Toevoegen"}
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
            <div className={cn(
              "gap-4",
              isMobile ? "grid grid-cols-1" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            )}>
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
                    <CardHeader className={cn(isMobile ? "pb-2 p-3" : "pb-3")}>
                      <CardTitle className={cn(
                        "font-bold flex items-center justify-between",
                        isMobile ? "text-sm" : "text-base"
                      )}>
                        <div className={cn(
                          "flex items-center",
                          isMobile ? "gap-2" : "gap-3"
                        )}>
                          <div className={cn(
                            "rounded-lg bg-white/60 backdrop-blur-sm",
                            isMobile ? "p-1" : "p-2"
                          )}>
                            <PhaseIcon className={cn(
                              "text-gray-700",
                              isMobile ? "w-4 h-4" : "w-5 h-5"
                            )} />
                          </div>
                          <div className="flex flex-col flex-1 min-w-0">
                            {isEditingName ? (
                              <Input
                                value={editingPhaseName}
                                onChange={(e) => setEditingPhaseName(e.target.value)}
                                onKeyDown={(e) => handlePhaseNameKeyDown(e, phase.id)}
                                onBlur={() => handleSavePhaseName(phase.id)}
                                className={cn(
                                  "font-bold bg-white/80 border-blue-300 focus:border-blue-500",
                                  isMobile ? "text-xs h-8" : "text-sm"
                                )}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <span className={cn(
                                "text-gray-800 leading-tight truncate",
                                isMobile ? "text-xs" : ""
                              )}>{phase.name}</span>
                            )}
                          </div>
                        </div>
                        <div className={cn(
                          "flex items-center",
                          isMobile ? "gap-0.5 flex-shrink-0" : "gap-1"
                        )}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "p-0 hover:bg-white/70 transition-all duration-200 hover:scale-110",
                              isMobile ? "h-6 w-6" : "h-8 w-8"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditPhaseName(phase);
                            }}
                          >
                            <Pencil className={cn(isMobile ? "w-3 h-3" : "w-4 h-4")} />
                          </Button>
                          <Popover 
                            open={colorPopoverOpen[phase.id] || false}
                            onOpenChange={(open) => handleColorPopoverToggle(phase.id, open)}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                  "p-0 hover:bg-white/70 transition-all duration-200 hover:scale-110",
                                  isMobile ? "h-6 w-6" : "h-8 w-8"
                                )}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Palette className={cn(isMobile ? "w-3 h-3" : "w-4 h-4")} />
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
                            className={cn(
                              "p-0 hover:bg-red-100 text-red-600 hover:text-red-700 transition-all duration-200 hover:scale-110",
                              isMobile ? "h-6 w-6" : "h-8 w-8"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePhase(phase.id);
                            }}
                          >
                            <Trash2 className={cn(isMobile ? "w-3 h-3" : "w-4 h-4")} />
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

                        {/* Phase Responsible Selection */}
                        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                          <div className="text-xs font-medium text-muted-foreground">Fase Verantwoordelijke</div>
                          {!phaseResponsibles[phase.id] || phaseResponsibles[phase.id] === "none" ? (
                            <Select 
                              value={phaseResponsibles[phase.id] || "none"} 
                              onValueChange={(value) => handlePhaseResponsibleChange(phase.id, value)}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Selecteer verantwoordelijke" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Geen verantwoordelijke</SelectItem>
                                {allTeamMembers.map((member) => (
                                  <SelectItem key={member.id} value={member.id}>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{member.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {member.roles ? member.roles.join(", ") : member.role}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                              <div className="text-xs">
                                <span className="font-medium">
                                  {allTeamMembers.find(m => m.id === phaseResponsibles[phase.id])?.name}
                                </span>
                              </div>
                              <button
                                onClick={() => handlePhaseResponsibleChange(phase.id, "none")}
                                className="text-xs text-muted-foreground hover:text-foreground"
                              >
                                Wijzigen
                              </button>
                            </div>
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

      <CategoryStartDatesDialog
        open={categoryDatesDialogOpen}
        onOpenChange={setCategoryDatesDialogOpen}
        projectStartDate={project.startDate}
        categoryStartDates={(project as any).categoryStartDates || null}
        onSave={handleCategoryStartDatesSave}
      />
    </div>
  );
}
