
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, CheckCircle, Clock, Lock, Camera, Edit, MessageSquare } from "lucide-react";
import { Project, Phase } from "@/pages/Index";
import { CameraCapture } from "@/components/CameraCapture";
import { ProjectDetailMaterials } from "@/components/ProjectDetailMaterials";
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
  const [editingChecklistItem, setEditingChecklistItem] = useState<{phaseId: number, itemId: string} | null>(null);
  const [editingItemText, setEditingItemText] = useState("");
  const [editingItemNotes, setEditingItemNotes] = useState("");

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
  };

  const handleEditChecklistItem = (phaseId: number, itemId: string) => {
    const item = phase?.checklist.find(i => i.id === itemId);
    if (item) {
      setEditingChecklistItem({ phaseId, itemId });
      setEditingItemText(item.description);
      setEditingItemNotes(item.notes || "");
    }
  };

  const handleSaveChecklistItem = async () => {
    if (!editingChecklistItem || !project) return;

    const updatedPhases = project.phases.map(p => {
      if (p.id === editingChecklistItem.phaseId) {
        const updatedChecklist = p.checklist.map(item => {
          if (item.id === editingChecklistItem.itemId) {
            return { 
              ...item, 
              description: editingItemText.trim(),
              notes: editingItemNotes.trim() || undefined
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
    const updatedPhase = updatedPhases.find(p => p.id === editingChecklistItem.phaseId);
    setPhase(updatedPhase || null);
    
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
        <Button variant="ghost" onClick={handleBack}>
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
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to {project.name}
        </Button>
      </div>

      {/* Phase Header */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-b">
          <CardTitle className="text-2xl font-bold flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-gray-800">{phase.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handlePhaseCompletionToggle(phase.id, !phase.completed)}
                className="hover:scale-105 transition-transform"
              >
                {phase.completed ? (
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
                onClick={() => handlePhaseLockToggle(phase.id, !phase.locked)}
                className="hover:scale-105 transition-transform"
              >
                {phase.locked ? (
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
          <p className="text-gray-700 text-base leading-relaxed">{phase.description}</p>
          
          {/* Progress Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 font-medium">Progress</span>
              <span className="font-bold text-blue-600">{progress.toFixed(0)}%</span>
            </div>
            <div className="relative">
              <Progress value={progress} className="h-2.5" />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{phase.checklist.filter(item => item.completed).length} completed</span>
                <span>{phase.checklist.length} total</span>
              </div>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex items-center gap-2">
            {phase.completed ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                <Clock className="w-3 h-3 mr-1" />
                Active
              </Badge>
            )}
            {phase.locked && (
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                <Lock className="w-3 h-3 mr-1" />
                Locked
              </Badge>
            )}
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              {t('projectDetail.checklist')}
            </h4>
            <ul className="list-none pl-0 space-y-3">
              {phase.checklist.map(item => (
                <li key={item.id} className="flex items-center justify-between p-4 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center flex-1">
                    <input
                      type="checkbox"
                      id={item.id}
                      className="mr-4 h-5 w-5 rounded text-blue-600 focus:ring-blue-500 focus:ring-2"
                      checked={item.completed}
                      onChange={(e) => handleChecklistItemToggle(phase.id, item.id, e.target.checked)}
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
                    <Dialog open={editingChecklistItem?.phaseId === phase.id && editingChecklistItem?.itemId === item.id} onOpenChange={(open) => !open && handleCancelEditChecklistItem()}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditChecklistItem(phase.id, item.id)}
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
                      onCapture={(photoBlob) => handleAddPhotoToChecklist(phase.id, item.id, photoBlob)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <ProjectDetailMaterials 
            projectId={project.id.toString()}
            phaseId={phase.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
