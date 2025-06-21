
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Project, Phase } from "@/pages/Index";
import { ProjectDetailMaterials } from "@/components/ProjectDetailMaterials";
import { PhaseHeader } from "@/components/phase/PhaseHeader";
import { PhaseChecklist } from "@/components/phase/PhaseChecklist";
import { PhaseStatus } from "@/components/phase/PhaseBadge";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { projectService } from "@/services/projectService";

export default function PhaseDetail() {
  const { projectId, phaseId } = useParams<{ projectId: string; phaseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [project, setProject] = useState<Project | null>(null);
  const [phase, setPhase] = useState<Phase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProject = async () => {
      try {
        if (!projectId) return;
        
        const projectData = await projectService.getProject(projectId);
        setProject(projectData);
        
        const selectedPhase = projectData.phases.find(p => p.id === parseInt(phaseId || '0'));
        setPhase(selectedPhase || null);
      } catch (error) {
        console.error('Error loading project:', error);
        toast({
          title: "Error",
          description: "Failed to load project data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId, phaseId, toast]);

  const handleBack = () => {
    navigate(`/project/${projectId}`);
  };

  const handleChecklistItemToggle = async (phaseId: number, itemId: string, completed: boolean) => {
    if (!project) return;

    try {
      await projectService.updateChecklistItem(project.id, phaseId, itemId, { completed });

      const updatedPhases = project.phases.map(p => {
        if (p.id === phaseId) {
          const updatedChecklist = p.checklist.map(item => {
            if (item.id === itemId) {
              return { ...item, completed: completed };
            }
            return item;
          });
          return { ...p, checklist: updatedChecklist };
        }
        return p;
      });

      const updatedProject = { ...project, phases: updatedPhases };
      setProject(updatedProject);
      
      // Update the current phase state
      const updatedPhase = updatedPhases.find(p => p.id === phaseId);
      setPhase(updatedPhase || null);
    } catch (error) {
      console.error('Error updating checklist item:', error);
      toast({
        title: "Fout",
        description: "Kon checklist item niet bijwerken.",
        variant: "destructive",
      });
    }
  };

  const handleEditChecklistItem = async (phaseId: number, itemId: string, description: string, notes?: string) => {
    if (!project) return;

    try {
      await projectService.updateChecklistItem(
        project.id, 
        phaseId, 
        itemId, 
        { 
          description: description,
          notes: notes
        }
      );

      const updatedPhases = project.phases.map(p => {
        if (p.id === phaseId) {
          const updatedChecklist = p.checklist.map(item => {
            if (item.id === itemId) {
              return { 
                ...item, 
                description: description,
                notes: notes
              };
            }
            return item;
          });
          return { ...p, checklist: updatedChecklist };
        }
        return p;
      });

      const updatedProject = { ...project, phases: updatedPhases };
      setProject(updatedProject);
      
      // Update the current phase state
      const updatedPhase = updatedPhases.find(p => p.id === phaseId);
      setPhase(updatedPhase || null);
    } catch (error) {
      console.error('Error updating checklist item:', error);
      throw error;
    }
  };

  const handleAddPhotoToChecklist = (phaseId: number, itemId: string, photoBlob: Blob) => {
    if (!project) return;

    const reader = new FileReader();
    reader.onload = () => {
      const photoDataUrl = reader.result as string;
      
      const updatedPhases = project.phases.map(p => {
        if (p.id === phaseId) {
          const updatedChecklist = p.checklist.map(item => {
            if (item.id === itemId) {
              const updatedPhotos = item.photos ? [...item.photos, photoDataUrl] : [photoDataUrl];
              return { ...item, photos: updatedPhotos };
            }
            return item;
          });
          return { ...p, checklist: updatedChecklist };
        }
        return p;
      });

      const updatedProject = { ...project, phases: updatedPhases };
      setProject(updatedProject);
      
      // Update the current phase state
      const updatedPhase = updatedPhases.find(p => p.id === phaseId);
      setPhase(updatedPhase || null);
      
      toast({
        title: t('projectDetail.photoAdded'),
        description: t('projectDetail.photoAddedSuccess'),
      });
    };
    reader.readAsDataURL(photoBlob);
  };

  const handleRemoveChecklistItem = async (phaseId: number, itemId: string) => {
    if (!project) return;

    try {
      await projectService.deleteChecklistItem(project.id, phaseId, itemId);

      const updatedPhases = project.phases.map(p => {
        if (p.id === phaseId) {
          const updatedChecklist = p.checklist.filter(item => item.id !== itemId);
          return { ...p, checklist: updatedChecklist };
        }
        return p;
      });

      const updatedProject = { ...project, phases: updatedPhases };
      setProject(updatedProject);
      
      // Update the current phase state
      const updatedPhase = updatedPhases.find(p => p.id === phaseId);
      setPhase(updatedPhase || null);
    } catch (error) {
      console.error('Error removing checklist item:', error);
      toast({
        title: "Fout",
        description: "Kon checklist item niet verwijderen.",
        variant: "destructive",
      });
    }
  };

  const handleAddChecklistItem = async (phaseId: number, description: string, notes?: string) => {
    if (!project) return;

    try {
      // Generate a unique ID for the new checklist item
      const newItemId = `${phaseId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const newItem = {
        id: newItemId,
        description: description,
        completed: false,
        required: false,
        notes: notes
      };

      await projectService.addChecklistItem(project.id, phaseId, newItem);

      const updatedPhases = project.phases.map(p => {
        if (p.id === phaseId) {
          const updatedChecklist = [...p.checklist, newItem];
          return { ...p, checklist: updatedChecklist };
        }
        return p;
      });

      const updatedProject = { ...project, phases: updatedPhases };
      setProject(updatedProject);
      
      // Update the current phase state
      const updatedPhase = updatedPhases.find(p => p.id === phaseId);
      setPhase(updatedPhase || null);
    } catch (error) {
      console.error('Error adding checklist item:', error);
      toast({
        title: "Fout",
        description: "Kon checklist item niet toevoegen.",
        variant: "destructive",
      });
    }
  };

  const handlePhaseCompletionToggle = async (phaseId: number, completed: boolean) => {
    if (!project) return;

    try {
      await projectService.updateProjectPhase(project.id, phaseId, { completed });
      
      const updatedPhases = project.phases.map(p => {
        if (p.id === phaseId) {
          return { ...p, completed: completed };
        }
        return p;
      });

      const updatedProject = { ...project, phases: updatedPhases };
      setProject(updatedProject);
      
      // Update the current phase state
      const updatedPhase = updatedPhases.find(p => p.id === phaseId);
      setPhase(updatedPhase || null);
      
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
    if (!project) return;

    try {
      await projectService.updateProjectPhase(project.id, phaseId, { locked });
      
      const updatedPhases = project.phases.map(p => {
        if (p.id === phaseId) {
          return { ...p, locked: locked };
        }
        return p;
      });

      const updatedProject = { ...project, phases: updatedPhases };
      setProject(updatedProject);
      
      // Update the current phase state
      const updatedPhase = updatedPhases.find(p => p.id === phaseId);
      setPhase(updatedPhase || null);
      
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

  const handlePhaseStatusChange = async (phaseId: number, status: PhaseStatus) => {
    if (!project) return;

    try {
      // Map status to existing phase properties for backward compatibility
      const updates: any = {};
      
      if (status === "done") {
        updates.completed = true;
        updates.locked = false;
      } else if (status === "queued") {
        updates.completed = false;
        updates.locked = true;
      } else {
        updates.completed = false;
        updates.locked = false;
      }

      await projectService.updateProjectPhase(project.id, phaseId, updates);
      
      const updatedPhases = project.phases.map(p => {
        if (p.id === phaseId) {
          return { ...p, ...updates };
        }
        return p;
      });

      const updatedProject = { ...project, phases: updatedPhases };
      setProject(updatedProject);
      
      // Update the current phase state
      const updatedPhase = updatedPhases.find(p => p.id === phaseId);
      setPhase(updatedPhase || null);
      
      toast({
        title: "Phase status updated",
        description: `Phase status has been changed.`,
      });
    } catch (error) {
      console.error('Error updating phase status:', error);
      toast({
        title: "Error",
        description: "Could not update phase status.",
        variant: "destructive",
      });
    }
  };

  const getPhaseProgress = (phase: Phase) => {
    const completedItems = phase.checklist.filter(item => item.completed).length;
    const totalItems = phase.checklist.length;
    return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading phase details...</p>
        </div>
      </div>
    );
  }

  if (!project || !phase) {
    return (
      <div className="space-y-6 p-6">
        <Button variant="ghost" onClick={() => navigate(`/project/${projectId}`)}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          {t('common.back')}
        </Button>
        <div className="text-center py-8">
          <p className="text-gray-600">Phase not found</p>
        </div>
      </div>
    );
  }

  const progress = getPhaseProgress(phase);

  return (
    <div className="space-y-6 p-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(`/project/${projectId}`)}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to {project.name}
        </Button>
      </div>

      {/* Phase Header */}
      <PhaseHeader
        phase={phase}
        progress={progress}
        onPhaseCompletionToggle={handlePhaseCompletionToggle}
        onPhaseLockToggle={handlePhaseLockToggle}
        onPhaseStatusChange={handlePhaseStatusChange}
      />

      {/* Phase Content */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardContent className="space-y-6 p-6">
          <PhaseChecklist
            phase={phase}
            projectId={projectId!}
            onChecklistItemToggle={handleChecklistItemToggle}
            onEditChecklistItem={handleEditChecklistItem}
            onAddPhotoToChecklist={handleAddPhotoToChecklist}
            onRemoveChecklistItem={handleRemoveChecklistItem}
            onAddChecklistItem={handleAddChecklistItem}
          />

          <ProjectDetailMaterials 
            projectId={project.id.toString()}
            phaseId={phase.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
