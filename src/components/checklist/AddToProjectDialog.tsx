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
        description: "Please select both a project and insertion point",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const insertAfterPhase = parseInt(selectedPhaseId);
      const newPhaseNumber = insertAfterPhase + 1;
      
      // First, shift all existing phases that come after the insertion point
      await projectService.shiftPhasesAfter(selectedProjectId, insertAfterPhase);
      
      // Create the new control phase
      const newPhase = await projectService.addProjectPhase(
        selectedProjectId,
        `Control Phase: ${checklist.title}`,
        `Quality control and inspection phase based on ${checklist.title}`,
        newPhaseNumber
      );

      // Add all checklist items to the new phase
      for (const section of checklist.sections) {
        for (let i = 0; i < section.items.length; i++) {
          const item = section.items[i];
          const itemText = typeof item === 'string' ? item : (item as any)?.description || item;
          
          const checklistItem = {
            id: `${checklist.id}-${section.title}-${i}-${Date.now()}`,
            description: `[${section.title}] ${itemText}`,
            completed: false,
            required: true,
            notes: `Control item from: ${checklist.title}`
          };

          await projectService.addChecklistItem(
            selectedProjectId,
            newPhaseNumber,
            checklistItem
          );
        }
      }

      toast({
        title: "Success",
        description: `Created new control phase ${newPhaseNumber} with ${checklist.sections.reduce((total, section) => total + section.items.length, 0)} control items`,
      });

      onClose();
      
    } catch (error) {
      console.error('Error creating control phase:', error);
      toast({
        title: "Error",
        description: "Failed to create control phase",
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
          <DialogTitle>Create Control Phase</DialogTitle>
          <DialogDescription>
            Select a project and choose where to insert the new control phase: "{checklist.title}".
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

               {/* Phase Insertion Point Selection */}
               {selectedProject && (
                 <div className="space-y-2">
                   <label className="text-sm font-medium">Insert Control Phase After</label>
                   <Select value={selectedPhaseId} onValueChange={setSelectedPhaseId}>
                     <SelectTrigger>
                       <SelectValue placeholder="Choose insertion point" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="0">
                         <div className="flex items-center justify-between w-full">
                           <span>At the beginning (Phase 1)</span>
                           <Badge variant="outline" className="text-xs ml-2">New: Phase 1</Badge>
                         </div>
                       </SelectItem>
                       {availablePhases.map((phase) => (
                         <SelectItem key={phase.id} value={phase.id.toString()}>
                           <div className="flex items-center justify-between w-full">
                             <span>After: {phase.name}</span>
                             <Badge variant="outline" className="text-xs ml-2">
                               New: Phase {phase.id + 1}
                             </Badge>
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
            Create Control Phase
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}