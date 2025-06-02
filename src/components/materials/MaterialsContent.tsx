
import { Package } from "lucide-react";
import { Material } from "@/pages/Index";
import { MaterialCard } from "./MaterialCard";

interface MaterialsContentProps {
  materials: Material[];
  onEditMaterial: (materialId: string) => void;
  onDeleteMaterial: (materialId: string) => void;
  readOnly?: boolean;
}

export function MaterialsContent({ 
  materials, 
  onEditMaterial, 
  onDeleteMaterial, 
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

  return (
    <div className="space-y-2">
      {materials.map((material) => (
        <MaterialCard
          key={material.id}
          material={material}
          onEdit={onEditMaterial}
          onDelete={onDeleteMaterial}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}
