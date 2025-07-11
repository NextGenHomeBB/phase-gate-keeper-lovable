
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Material } from "@/pages/Index";
import { useLanguage } from "@/contexts/LanguageContext";
import { MaterialsHeader } from "./materials/MaterialsHeader";
import { MaterialsContent } from "./materials/MaterialsContent";
import { MaterialForm } from "./materials/MaterialForm";
import { ManualMaterialForm } from "./materials/ManualMaterialForm";
import { LabourList } from "./labour/LabourList";
import { useMaterials } from "@/hooks/useMaterials";
import { Skeleton } from "@/components/ui/skeleton";

interface MaterialsListProps {
  projectId: string;
  phaseId: number;
  readOnly?: boolean;
}

export function MaterialsList({ projectId, phaseId, readOnly = false }: MaterialsListProps) {
  const { t } = useLanguage();
  const [editingMaterial, setEditingMaterial] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingManual, setIsAddingManual] = useState(false);
  const [newMaterial, setNewMaterial] = useState<Omit<Material, 'id'>>({
    name: '',
    quantity: 1,
    unit: 'stuks',
    category: 'Diversen',
    estimatedCost: 0
  });

  const {
    materials,
    loading,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    addBulkMaterials
  } = useMaterials(projectId, phaseId);

  const handleAddMaterial = async () => {
    if (newMaterial.name.trim()) {
      try {
        await addMaterial({
          ...newMaterial,
          name: newMaterial.name.trim()
        });
        
        setNewMaterial({
          name: '',
          quantity: 1,
          unit: 'stuks',
          category: 'Diversen',
          estimatedCost: 0
        });
        setIsAdding(false);
      } catch (error) {
        console.error('Failed to add material:', error);
      }
    }
  };

  const handleAddManualMaterial = async (material: Omit<Material, 'id'>) => {
    try {
      await addMaterial(material);
      setIsAddingManual(false);
    } catch (error) {
      console.error('Failed to add manual material:', error);
    }
  };

  const handleUpdateMaterial = async (materialId: string, updatedMaterial: Partial<Material>) => {
    try {
      await updateMaterial(materialId, updatedMaterial);
      setEditingMaterial(null);
    } catch (error) {
      console.error('Failed to update material:', error);
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    try {
      await deleteMaterial(materialId);
    } catch (error) {
      console.error('Failed to delete material:', error);
    }
  };

  const getTotalEstimatedCost = () => {
    return materials.reduce((total, material) => {
      const baseCost = (material.estimatedCost || 0) * material.quantity;
      const vatAmount = baseCost * ((material.vatPercentage || 0) / 100);
      return total + baseCost + vatAmount;
    }, 0);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Materials Section */}
      <Card>
        <CardHeader>
          <MaterialsHeader
            materialsCount={materials.length}
            totalCost={getTotalEstimatedCost()}
            readOnly={readOnly}
            onAddMaterial={() => setIsAdding(true)}
            onAddManualMaterial={() => setIsAddingManual(true)}
            isAdding={isAdding}
            isAddingManual={isAddingManual}
          />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Add new AI material form */}
            {isAdding && (
              <MaterialForm
                material={newMaterial}
                onMaterialChange={setNewMaterial}
                onSave={handleAddMaterial}
                onCancel={() => setIsAdding(false)}
              />
            )}

            {/* Add new manual material form */}
            {isAddingManual && (
              <ManualMaterialForm
                onSave={handleAddManualMaterial}
                onCancel={() => setIsAddingManual(false)}
              />
            )}

            {/* Materials list */}
            <MaterialsContent
              materials={materials}
              onEditMaterial={setEditingMaterial}
              onDeleteMaterial={handleDeleteMaterial}
              onUpdateMaterial={handleUpdateMaterial}
              readOnly={readOnly}
            />
          </div>
        </CardContent>
      </Card>

      {/* Labour Section */}
      <LabourList
        projectId={projectId}
        phaseId={phaseId}
        readOnly={readOnly}
      />
    </div>
  );
}
