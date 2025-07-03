import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Project, Phase } from "@/pages/Index";
import { SectionedChecklist } from "@/data/constructionChecklists";
import { projectService } from "@/services/projectService";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface AddToProjectDialogProps {
  checklist: SectionedChecklist;
  isOpen: boolean;
  onClose: () => void;
}

export function AddToProjectDialog({ checklist, isOpen, onClose }: AddToProjectDialogProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const projectsData = await projectService.fetchProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const availablePhases = selectedProject?.phases || [];

  const handleAddToProject = async () => {
    if (!selectedProjectId || !selectedPhaseId) {
      toast({
        title: "Selection Required",
        description: "Please select both a project and a phase",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      
      // Convert sectioned checklist to individual items and add them to the phase
      for (const section of checklist.sections) {
        for (let i = 0; i < section.items.length; i++) {
          const item = section.items[i];
          const itemText = typeof item === 'string' ? item : (item as any)?.description || item;
          
          const checklistItem = {
            id: `${checklist.id}-${section.title}-${i}-${Date.now()}`,
            description: `[${section.title}] ${itemText}`,
            completed: false,
            required: true,
            notes: `Added from construction template: ${checklist.title}`
          };

          await projectService.addChecklistItem(
            selectedProjectId,
            parseInt(selectedPhaseId),
            checklistItem
          );
        }
      }

      toast({
        title: "Success",
        description: `Added ${checklist.sections.reduce((total, section) => total + section.items.length, 0)} items to project phase`,
      });

      onClose();
      
    } catch (error) {
      console.error('Error adding checklist to project:', error);
      toast({
        title: "Error",
        description: "Failed to add checklist to project",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Checklist to Project</DialogTitle>
          <DialogDescription>
            Select a project and phase to add "{checklist.title}" checklist items.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Checklist Summary */}
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="font-medium text-sm">{checklist.title}</h4>
            <div className="flex flex-wrap gap-1 mt-2">
              {checklist.sections.map((section, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {section.title} ({section.items.length})
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total: {checklist.sections.reduce((total, section) => total + section.items.length, 0)} items
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2 text-sm">Loading projects...</span>
            </div>
          ) : (
            <>
              {/* Project Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Project</label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Phase Selection */}
              {selectedProject && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Phase</label>
                  <Select value={selectedPhaseId} onValueChange={setSelectedPhaseId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a phase" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePhases.map((phase) => (
                        <SelectItem key={phase.id} value={phase.id.toString()}>
                          <div className="flex items-center justify-between w-full">
                            <span>{phase.name}</span>
                            <div className="flex items-center space-x-1 ml-2">
                              {phase.completed && (
                                <Badge variant="default" className="text-xs">Completed</Badge>
                              )}
                              {phase.locked && (
                                <Badge variant="secondary" className="text-xs">Locked</Badge>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddToProject} 
            disabled={!selectedProjectId || !selectedPhaseId || submitting}
          >
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Add to Phase
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}