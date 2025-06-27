
import { Package } from "lucide-react";
import { Material } from "@/pages/Index";
import { MaterialCard } from "./MaterialCard";
import { Badge } from "@/components/ui/badge";

interface MaterialsContentProps {
  materials: Material[];
  onEditMaterial: (materialId: string) => void;
  onDeleteMaterial: (materialId: string) => void;
  onUpdateMaterial?: (materialId: string, updates: Partial<Material>) => void;
  readOnly?: boolean;
}

export function MaterialsContent({ 
  materials, 
  onEditMaterial, 
  onDeleteMaterial,
  onUpdateMaterial,
  readOnly = false 
}: MaterialsContentProps) {
  if (materials.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>Geen materialen toegevoegd</p>
        {!readOnly && (
          <p className="text-sm mt-1">Gebruik de AI calculator of voeg handmatig materialen toe</p>
        )}
      </div>
    );
  }

  // Separate manual and AI materials
  const manualMaterials = materials.filter(m => m.isManual);
  const aiMaterials = materials.filter(m => !m.isManual);

  return (
    <div className="space-y-4">
      {/* AI Generated Materials */}
      {aiMaterials.length > 0 && (
        <div className="space-y-2">
          {aiMaterials.length > 0 && manualMaterials.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">AI Gegenereerd</Badge>
            </div>
          )}
          {aiMaterials.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              onEdit={onEditMaterial}
              onDelete={onDeleteMaterial}
              onUpdate={onUpdateMaterial}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}

      {/* Manual Materials */}
      {manualMaterials.length > 0 && (
        <div className="space-y-2">
          {aiMaterials.length > 0 && manualMaterials.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Badge variant="outline" className="bg-green-50 text-green-700">Handmatig Toegevoegd</Badge>
            </div>
          )}
          {manualMaterials.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              onEdit={onEditMaterial}
              onDelete={onDeleteMaterial}
              onUpdate={onUpdateMaterial}
              readOnly={readOnly}
              isManual={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
