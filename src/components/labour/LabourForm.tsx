
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Labour } from "@/pages/Index";
import { subcontractorService, Subcontractor } from "@/services/subcontractorService";
import { useToast } from "@/hooks/use-toast";

interface LabourFormProps {
  onSave: (labour: Omit<Labour, 'id'>) => void;
  onCancel: () => void;
}

export function LabourForm({ onSave, onCancel }: LabourFormProps) {
  const [labour, setLabour] = useState<Omit<Labour, 'id'>>({
    task: '',
    hours: 0,
    hourlyRate: 0,
    costPerJob: 0,
    billPerHour: true,
    subcontractor: undefined
  });
  
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadSubcontractors();
  }, []);

  const loadSubcontractors = async () => {
    try {
      const data = await subcontractorService.fetchSubcontractors();
      setSubcontractors(data);
    } catch (error) {
      console.error('Error loading subcontractors:', error);
      toast({
        title: "Warning",
        description: "Could not load sub-contractors for selection",
        variant: "destructive",
      });
    }
  };

  const handleSubcontractorChange = (subcontractorId: string) => {
    if (subcontractorId === "none") {
      setLabour({
        ...labour,
        subcontractor: undefined
      });
    } else {
      const selectedSubcontractor = subcontractors.find(s => s.id === subcontractorId);
      setLabour({
        ...labour,
        subcontractor: selectedSubcontractor ? {
          id: selectedSubcontractor.id,
          name: selectedSubcontractor.name,
          trade_specialty: selectedSubcontractor.trade_specialty
        } : undefined
      });
    }
  };

  const handleSave = () => {
    if (labour.task.trim()) {
      onSave(labour);
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="task">Task Description</Label>
          <Input
            id="task"
            placeholder="Enter task description"
            value={labour.task}
            onChange={(e) => setLabour({ ...labour, task: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subcontractor">Sub-contractor (Optional)</Label>
          <Select
            value={labour.subcontractor?.id || "none"}
            onValueChange={handleSubcontractorChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select sub-contractor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {subcontractors.map((sub) => (
                <SelectItem key={sub.id} value={sub.id}>
                  {sub.name} - {sub.trade_specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="billPerHour"
              checked={labour.billPerHour}
              onCheckedChange={(checked) => 
                setLabour({ ...labour, billPerHour: checked })
              }
            />
            <Label htmlFor="billPerHour">Bill per hour</Label>
          </div>
        </div>

        {labour.billPerHour ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="hours">Hours</Label>
              <Input
                id="hours"
                type="number"
                step="0.5"
                min="0"
                placeholder="0"
                value={labour.hours || ''}
                onChange={(e) => setLabour({ 
                  ...labour, 
                  hours: parseFloat(e.target.value) || 0 
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate (€)</Label>
              <Input
                id="hourlyRate"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={labour.hourlyRate || ''}
                onChange={(e) => setLabour({ 
                  ...labour, 
                  hourlyRate: parseFloat(e.target.value) || 0 
                })}
              />
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="costPerJob">Cost per Job (€)</Label>
            <Input
              id="costPerJob"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={labour.costPerJob || ''}
              onChange={(e) => setLabour({ 
                ...labour, 
                costPerJob: parseFloat(e.target.value) || 0 
              })}
            />
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!labour.task.trim()}>
          Save Labour
        </Button>
      </div>
    </div>
  );
}
