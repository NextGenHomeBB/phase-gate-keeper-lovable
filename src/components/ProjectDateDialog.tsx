import { useState } from "react";
import { format } from "date-fns";
import { Calendar, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Project } from "@/pages/Index";

interface ProjectDateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  onUpdateProject: (project: Project) => void;
}

export function ProjectDateDialog({
  open,
  onOpenChange,
  project,
  onUpdateProject,
}: ProjectDateDialogProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(
    project.startDate ? new Date(project.startDate) : undefined
  );
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(
    project.planned_delivery_date ? new Date(project.planned_delivery_date) : undefined
  );

  const handleSave = () => {
    const updatedProject = {
      ...project,
      startDate: startDate ? startDate.toISOString().split('T')[0] : project.startDate,
      planned_delivery_date: deliveryDate ? deliveryDate.toISOString().split('T')[0] : project.planned_delivery_date,
    };
    
    onUpdateProject(updatedProject);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Project Dates</DialogTitle>
          <DialogDescription>
            Manage the important dates for "{project.name}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="start-date"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Pick a start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="delivery-date">Planned Delivery Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="delivery-date"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !deliveryDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deliveryDate ? format(deliveryDate, "PPP") : "Pick a delivery date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={deliveryDate}
                  onSelect={setDeliveryDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Dates
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}