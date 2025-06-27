
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Clock, Euro, HardHat } from "lucide-react";
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
  const getTotalCost = () => {
    if (labour.billPerHour) {
      return labour.hours * labour.hourlyRate;
    }
    return labour.costPerJob;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-1">{labour.task}</h4>
            {labour.subcontractor && (
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <HardHat className="w-4 h-4 mr-1" />
                <span>{labour.subcontractor.name}</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  {labour.subcontractor.trade_specialty}
                </Badge>
              </div>
            )}
          </div>
          {!readOnly && (
            <div className="flex space-x-1">
              <Button variant="ghost" size="sm" onClick={() => onEdit(labour.id)}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(labour.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {labour.billPerHour ? (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                <span>{labour.hours}h × €{labour.hourlyRate}/h</span>
              </div>
              <div className="flex items-center font-medium">
                <Euro className="w-4 h-4 mr-1" />
                <span>€{getTotalCost().toFixed(2)}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Fixed cost per job</span>
              <div className="flex items-center font-medium">
                <Euro className="w-4 h-4 mr-1" />
                <span>€{getTotalCost().toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
