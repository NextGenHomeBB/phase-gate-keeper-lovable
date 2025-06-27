
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check, X, Euro } from "lucide-react";
import { Labour } from "@/pages/Index";

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
    billPerHour: true
  });

  const handleSave = () => {
    if (labour.task.trim()) {
      onSave(labour);
    }
  };

  const getTotalCost = () => {
    return labour.billPerHour ? labour.hours * labour.hourlyRate : labour.costPerJob;
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="space-y-4">
          <h3 className="font-medium text-blue-900">Nieuwe Arbeidskosten Toevoegen</h3>
          
          {/* Task input */}
          <div>
            <Label htmlFor="new-task">Taak</Label>
            <Input
              id="new-task"
              value={labour.task}
              onChange={(e) => setLabour({ ...labour, task: e.target.value })}
              placeholder="Beschrijf de taak..."
            />
          </div>

          {/* Billing mode switch */}
          <div className="flex items-center space-x-2">
            <Switch
              id="new-billing-mode"
              checked={labour.billPerHour}
              onCheckedChange={(checked) => setLabour({ ...labour, billPerHour: checked })}
            />
            <Label htmlFor="new-billing-mode">
              {labour.billPerHour ? 'Factureer per uur' : 'Factureer per klus'}
            </Label>
          </div>

          {/* Conditional inputs based on billing mode */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {labour.billPerHour ? (
              <>
                <div>
                  <Label htmlFor="new-hours">Uren</Label>
                  <Input
                    id="new-hours"
                    type="number"
                    min="0"
                    step="0.5"
                    value={labour.hours}
                    onChange={(e) => setLabour({ ...labour, hours: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="new-hourlyRate">Uurtarief (€)</Label>
                  <Input
                    id="new-hourlyRate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={labour.hourlyRate}
                    onChange={(e) => setLabour({ ...labour, hourlyRate: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Totaal</Label>
                  <div className="flex items-center h-10 px-3 bg-gray-100 rounded-md">
                    <Euro className="w-4 h-4 mr-1" />
                    <span className="font-medium">€{getTotalCost().toFixed(2)}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="new-costPerJob">Kosten per klus (€)</Label>
                  <Input
                    id="new-costPerJob"
                    type="number"
                    min="0"
                    step="0.01"
                    value={labour.costPerJob}
                    onChange={(e) => setLabour({ ...labour, costPerJob: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div></div>
                <div>
                  <Label>Totaal</Label>
                  <div className="flex items-center h-10 px-3 bg-gray-100 rounded-md">
                    <Euro className="w-4 h-4 mr-1" />
                    <span className="font-medium">€{getTotalCost().toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={handleSave} disabled={!labour.task.trim()}>
              <Check className="w-4 h-4 mr-1" />
              Toevoegen
            </Button>
            <Button size="sm" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-1" />
              Annuleren
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
