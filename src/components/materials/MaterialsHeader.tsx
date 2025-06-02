
import { CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Plus, Sparkles, Euro } from "lucide-react";

interface MaterialsHeaderProps {
  materialsCount: number;
  totalCost: number;
  readOnly?: boolean;
  onAddMaterial: () => void;
  isAdding: boolean;
}

export function MaterialsHeader({ 
  materialsCount, 
  totalCost, 
  readOnly = false, 
  onAddMaterial, 
  isAdding 
}: MaterialsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <CardTitle className="flex items-center">
          <Package className="w-5 h-5 mr-2" />
          Materialen ({materialsCount})
        </CardTitle>
        {materialsCount > 0 && (
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <Euro className="w-4 h-4 mr-1" />
            Geschatte totale kosten: €{totalCost.toFixed(2)}
          </div>
        )}
      </div>
      {!readOnly && (
        <Tabs defaultValue="manual" className="w-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual" className="flex items-center">
              <Plus className="w-4 h-4 mr-1" />
              Handmatig
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center">
              <Sparkles className="w-4 h-4 mr-1" />
              AI Bereken
            </TabsTrigger>
          </TabsList>
          <TabsContent value="manual">
            <Button
              variant="outline"
              size="sm"
              onClick={onAddMaterial}
              disabled={isAdding}
            >
              <Plus className="w-4 h-4 mr-2" />
              Materiaal toevoegen
            </Button>
          </TabsContent>
          <TabsContent value="ai">
            <div className="text-center text-sm text-gray-600">
              Gebruik de AI calculator hierboven
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
