
import { CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Hammer, Plus, Euro } from "lucide-react";

interface LabourHeaderProps {
  labourCount: number;
  totalCost: number;
  readOnly?: boolean;
  onAddLabour: () => void;
  isAdding: boolean;
}

export function LabourHeader({ 
  labourCount, 
  totalCost, 
  readOnly = false, 
  onAddLabour,
  isAdding
}: LabourHeaderProps) {
  return (
    <CardTitle className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Hammer className="w-5 h-5" />
        Arbeidskosten ({labourCount})
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-blue-600">
          <Euro className="w-4 h-4" />
          <span className="font-bold">€{totalCost.toFixed(2)}</span>
        </div>
        {!readOnly && (
          <Button
            size="sm"
            onClick={onAddLabour}
            disabled={isAdding}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Arbeidskosten Toevoegen
          </Button>
        )}
      </div>
    </CardTitle>
  );
}
