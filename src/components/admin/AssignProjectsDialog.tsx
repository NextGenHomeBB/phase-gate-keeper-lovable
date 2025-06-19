
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { Search, Building } from 'lucide-react';
import { workerProjectService, WorkerProject } from '@/services/workerProjectService';

interface AssignProjectsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  workerId: string;
  workerName: string;
  onAssignmentUpdated: () => void;
}

export function AssignProjectsDialog({
  isOpen,
  onClose,
  workerId,
  workerName,
  onAssignmentUpdated
}: AssignProjectsDialogProps) {
  const [projects, setProjects] = useState<WorkerProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<WorkerProject[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const loadProjects = async () => {
    if (!workerId) return;
    
    try {
      setLoading(true);
      const workerProjects = await workerProjectService.getWorkerProjects(workerId);
      setProjects(workerProjects);
      setFilteredProjects(workerProjects);
      
      // Set initially selected projects
      const assignedIds = new Set(workerProjects.filter(p => p.assigned).map(p => p.id));
      setSelectedProjectIds(assignedIds);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadProjects();
      setSearchTerm('');
    }
  }, [isOpen, workerId]);

  useEffect(() => {
    const filtered = projects.filter(project =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredProjects(filtered);
  }, [searchTerm, projects]);

  const handleProjectToggle = (projectId: string, checked: boolean) => {
    const newSelected = new Set(selectedProjectIds);
    if (checked) {
      newSelected.add(projectId);
    } else {
      newSelected.delete(projectId);
    }
    setSelectedProjectIds(newSelected);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await workerProjectService.updateWorkerProjectAssignments(
        workerId,
        Array.from(selectedProjectIds)
      );
      
      toast({
        title: "Success",
        description: `Project assignments updated for ${workerName}`,
      });
      
      onAssignmentUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating assignments:', error);
      toast({
        title: "Error",
        description: "Failed to update project assignments",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const assignedCount = selectedProjectIds.size;
  const totalCount = projects.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>Assign Projects to {workerName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="text-sm text-muted-foreground">
            {assignedCount} of {totalCount} projects assigned
          </div>

          {loading ? (
            <div className="text-center py-4">Loading projects...</div>
          ) : (
            <ScrollArea className="h-64 border rounded-md p-2">
              <div className="space-y-2">
                {filteredProjects.map((project) => (
                  <div key={project.id} className="flex items-center space-x-3 p-2 hover:bg-muted rounded-md">
                    <Checkbox
                      checked={selectedProjectIds.has(project.id)}
                      onCheckedChange={(checked) => 
                        handleProjectToggle(project.id, checked as boolean)
                      }
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{project.name}</div>
                      {project.description && (
                        <div className="text-sm text-muted-foreground truncate">
                          {project.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {filteredProjects.length === 0 && searchTerm && (
                  <div className="text-center py-4 text-muted-foreground">
                    No projects found matching "{searchTerm}"
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
