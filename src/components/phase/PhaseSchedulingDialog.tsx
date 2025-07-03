import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhaseDatePicker } from "./PhaseDatePicker";
import { Phase } from "@/pages/Index";
import { toast } from "sonner";

interface PhaseSchedulingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phase: Phase | null;
  onSave: (phaseId: number, updates: {
    name?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
  }) => Promise<void>;
  previousPhaseEndDate?: Date;
}

export function PhaseSchedulingDialog({
  open,
  onOpenChange,
  phase,
  onSave,
  previousPhaseEndDate
}: PhaseSchedulingDialogProps) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [startDate, setStartDate] = React.useState<Date | undefined>();
  const [endDate, setEndDate] = React.useState<Date | undefined>();
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (phase) {
      setName(phase.name);
      setDescription(phase.description || "");
      setStartDate(phase.start_date ? new Date(phase.start_date) : undefined);
      setEndDate(phase.end_date ? new Date(phase.end_date) : undefined);
    }
  }, [phase]);

  const handleSave = async () => {
    if (!phase) return;

    try {
      setIsLoading(true);
      
      const updates: any = {
        name: name.trim(),
        description: description.trim()
      };

      if (startDate) {
        updates.start_date = startDate.toISOString().split('T')[0];
      }
      
      if (endDate) {
        updates.end_date = endDate.toISOString().split('T')[0];
      }

      await onSave(phase.id, updates);
      
      toast.success("Phase updated successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating phase:", error);
      toast.error("Failed to update phase");
    } finally {
      setIsLoading(false);
    }
  };

  const minStartDate = React.useMemo(() => {
    if (previousPhaseEndDate) {
      const nextDay = new Date(previousPhaseEndDate);
      nextDay.setDate(nextDay.getDate() + 1);
      return nextDay;
    }
    return new Date();
  }, [previousPhaseEndDate]);

  if (!phase) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Phase: {phase.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Phase Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter phase name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter phase description"
              rows={3}
            />
          </div>

          <PhaseDatePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            minStartDate={minStartDate}
          />

          {previousPhaseEndDate && (
            <div className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
              <strong>Note:</strong> Previous phase ends on {previousPhaseEndDate.toLocaleDateString()}. 
              This phase should start on or after {minStartDate.toLocaleDateString()}.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading || !name.trim()}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}