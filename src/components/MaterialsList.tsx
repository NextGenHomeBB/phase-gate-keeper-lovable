
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Material } from "@/pages/Index";
import { useLanguage } from "@/contexts/LanguageContext";
import { AIMaterialsCalculator } from "./AIMaterialsCalculator";
import { MaterialsHeader } from "./materials/MaterialsHeader";
import { MaterialsContent } from "./materials/MaterialsContent";
import { MaterialForm } from "./materials/MaterialForm";

interface MaterialsListProps {
  materials: Material[];
  onUpdateMaterials: (materials: Material[]) => void;
  readOnly?: boolean;
}

export function MaterialsList({ materials, onUpdateMaterials, readOnly = false }: MaterialsListProps) {
  const { t } = useLanguage();
  const [editingMaterial, setEditingMaterial] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newMaterial, setNewMaterial] = useState<Omit<Material, 'id'>>({
    name: '',
    quantity: 1,
    unit: 'stuks',
    category: 'Diversen',
    estimatedCost: 0
  });

  const handleAddMaterial = () => {
    if (newMaterial.name.trim()) {
      const material: Material = {
        ...newMaterial,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: newMaterial.name.trim()
      };
      onUpdateMaterials([...materials, material]);
      setNewMaterial({
        name: '',
        quantity: 1,
        unit: 'stuks',
        category: 'Diversen',
        estimatedCost: 0
      });
      setIsAdding(false);
    }
  };

  const handleAddAIMaterials = (aiMaterials: Material[]) => {
    onUpdateMaterials([...materials, ...aiMaterials]);
  };

  const handleUpdateMaterial = (materialId: string, updatedMaterial: Partial<Material>) => {
    const updatedMaterials = materials.map(material =>
      material.id === materialId ? { ...material, ...updatedMaterial } : material
    );
    onUpdateMaterials(updatedMaterials);
    setEditingMaterial(null);
  };

  const handleDeleteMaterial = (materialId: string) => {
    const updatedMaterials = materials.filter(material => material.id !== materialId);
    onUpdateMaterials(updatedMaterials);
  };

  const getTotalEstimatedCost = () => {
    return materials.reduce((total, material) => {
      return total + (material.estimatedCost || 0) * material.quantity;
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* AI Calculator - only show when not readonly */}
      {!readOnly && (
        <AIMaterialsCalculator onAddMaterials={handleAddAIMaterials} />
      )}

      <Card>
        <CardHeader>
          <MaterialsHeader
            materialsCount={materials.length}
            totalCost={getTotalEstimatedCost()}
            readOnly={readOnly}
            onAddMaterial={() => setIsAdding(true)}
            isAdding={isAdding}
          />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Add new material form */}
            {isAdding && (
              <MaterialForm
                material={newMaterial}
                onMaterialChange={setNewMaterial}
                onSave={handleAddMaterial}
                onCancel={() => setIsAdding(false)}
              />
            )}

            {/* Materials list */}
            <MaterialsContent
              materials={materials}
              onEditMaterial={setEditingMaterial}
              onDeleteMaterial={handleDeleteMaterial}
              readOnly={readOnly}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
