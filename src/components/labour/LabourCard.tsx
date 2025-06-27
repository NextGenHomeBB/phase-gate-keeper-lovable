
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Check, X, Euro, Clock, Briefcase } from "lucide-react";
import { Labour } from "@/pages/Index";

interface LabourCardProps {
  labour: Labour;
  onEdit: (labourId: string) => void;
  onDelete: (labourId: string) => void;
  onUpdate?: (labourId: string, updates: Partial<Labour>) => void;
  isEditing: boolean;
  readOnly?: boolean;
}

export function LabourCard({
  labour,
  onEdit,
  onDelete,
  onUpdate,
  isEditing,
  readOnly = false
}: LabourCardProps) {
  const [editedLabour, setEditedLabour] = useState(labour);

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(labour.id, editedLabour);
    }
  };

  const handleCancel = () => {
    setEditedLabour(labour);
    onEdit('');
  };

  const getTotalCost = () => {
    return labour.billPerHour ? labour.hours * labour.hourlyRate : labour.costPerJob;
  };

  const getEditedTotalCost = () => {
    return editedLabour.billPerHour ? editedLabour.hours * editedLabour.hourlyRate : editedLabour.costPerJob;
  };

  if (isEditing) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Task input */}
            <div>
              <Label htmlFor="task">Taak</Label>
              <Input
                id="task"
                value={editedLabour.task}
                onChange={(e) => setEditedLabour({ ...editedLabour, task: e.target.value })}
                placeholder="Beschrijf de taak..."
              />
            </div>

            {/* Billing mode switch */}
            <div className="flex items-center space-x-2">
              <Switch
                id="billing-mode"
                checked={editedLabour.billPerHour}
                onCheckedChange={(checked) => setEditedLabour({ ...editedLabour, billPerHour: checked })}
              />
              <Label htmlFor="billing-mode">
                {editedLabour.billPerHour ? 'Factureer per uur' : 'Factureer per klus'}
              </Label>
            </div>

            {/* Conditional inputs based on billing mode */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {editedLabour.billPerHour ? (
                <>
                  <div>
                    <Label htmlFor="hours">Uren</Label>
                    <Input
                      id="hours"
                      type="number"
                      min="0"
                      step="0.5"
                      value={editedLabour.hours}
                      onChange={(e) => setEditedLabour({ ...editedLabour, hours: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hourlyRate">Uurtarief (€)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={editedLabour.hourlyRate}
                      onChange={(e) => setEditedLabour({ ...editedLabour, hourlyRate: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>Totaal</Label>
                    <div className="flex items-center h-10 px-3 bg-gray-100 rounded-md">
                      <Euro className="w-4 h-4 mr-1" />
                      <span className="font-medium">€{getEditedTotalCost().toFixed(2)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="costPerJob">Kosten per klus (€)</Label>
                    <Input
                      id="costPerJob"
                      type="number"
                      min="0"
                      step="0.01"
                      value={editedLabour.costPerJob}
                      onChange={(e) => setEditedLabour({ ...editedLabour, costPerJob: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div></div>
                  <div>
                    <Label>Totaal</Label>
                    <div className="flex items-center h-10 px-3 bg-gray-100 rounded-md">
                      <Euro className="w-4 h-4 mr-1" />
                      <span className="font-medium">€{getEditedTotalCost().toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={handleSave}>
                <Check className="w-4 h-4 mr-1" />
                Opslaan
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-1" />
                Annuleren
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="font-medium">{labour.task}</h4>
              <Badge variant="outline" className={labour.billPerHour ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}>
                {labour.billPerHour ? (
                  <>
                    <Clock className="w-3 h-3 mr-1" />
                    Per uur
                  </>
                ) : (
                  <>
                    <Briefcase className="w-3 h-3 mr-1" />
                    Per klus
                  </>
                )}
              </Badge>
            </div>
            <div className="text-sm text-gray-600">
              {labour.billPerHour ? (
                <span>
                  {labour.hours} uur × €{labour.hourlyRate.toFixed(2)} = 
                  <span className="font-medium ml-1 text-blue-600">€{getTotalCost().toFixed(2)}</span>
                </span>
              ) : (
                <span className="font-medium text-green-600">€{getTotalCost().toFixed(2)}</span>
              )}
            </div>
          </div>
          
          {!readOnly && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(labour.id)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(labour.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
