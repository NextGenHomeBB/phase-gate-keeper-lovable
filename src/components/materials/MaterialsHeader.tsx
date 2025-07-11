
import { CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus, Euro } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  return (
    <div>
      <CardTitle className={`flex items-center ${isMobile ? 'flex-col gap-3' : 'justify-between'}`}>
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Materialen ({materialsCount})
        </div>
        <div className={`flex items-center ${isMobile ? 'flex-col w-full' : 'gap-3'}`}>
          <div className="flex items-center gap-1 text-green-600">
            <Euro className="w-4 h-4" />
            <span className="font-bold">€{totalCost.toFixed(2)}</span>
          </div>
          {!readOnly && (
            <div className={`flex ${isMobile ? 'flex-col w-full gap-2' : 'gap-2'}`}>
              <Button
                size={isMobile ? "default" : "sm"}
                onClick={onAddMaterial}
                disabled={isAdding || isAddingManual}
                className={`bg-blue-600 hover:bg-blue-700 ${isMobile ? 'w-full min-h-[44px]' : ''}`}
              >
                <Plus className="w-4 h-4 mr-1" />
                {isMobile ? "AI Calc" : "AI Calculator"}
              </Button>
              <Button
                size={isMobile ? "default" : "sm"}
                variant="outline"
                onClick={onAddManualMaterial}
                disabled={isAdding || isAddingManual}
                className={`border-green-600 text-green-600 hover:bg-green-50 ${isMobile ? 'w-full min-h-[44px]' : ''}`}
              >
                <Plus className="w-4 h-4 mr-1" />
                {isMobile ? "Handmatig" : "Handmatig Item"}
              </Button>
            </div>
          )}
        </div>
      </CardTitle>
    </div>
  );
}
