
import { CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus, Euro } from "lucide-react";

interface MaterialsHeaderProps {
  materialsCount: number;
  totalCost: number;
  readOnly?: boolean;
  onAddMaterial: () => void;
  onAddManualMaterial: () => void;
  isAdding: boolean;
  isAddingManual: boolean;
}

export function MaterialsHeader({ 
  materialsCount, 
  totalCost, 
  readOnly = false, 
  onAddMaterial,
  onAddManualMaterial,
  isAdding,
  isAddingManual
}: MaterialsHeaderProps) {
  return (
    <div>
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Materialen ({materialsCount})
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-green-600">
            <Euro className="w-4 h-4" />
            <span className="font-bold">€{totalCost.toFixed(2)}</span>
          </div>
          {!readOnly && (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={onAddMaterial}
                disabled={isAdding || isAddingManual}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                AI Calculator
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onAddManualMaterial}
                disabled={isAdding || isAddingManual}
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                <Plus className="w-4 h-4 mr-1" />
                Handmatig Item
              </Button>
            </div>
          )}
        </div>
      </CardTitle>
    </div>
  );
}
