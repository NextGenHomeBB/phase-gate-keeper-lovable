
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Labour } from "@/pages/Index";
import { useLabour } from "@/hooks/useLabour";
import { LabourHeader } from "./LabourHeader";
import { LabourContent } from "./LabourContent";
import { LabourForm } from "./LabourForm";
import { Skeleton } from "@/components/ui/skeleton";

interface LabourListProps {
  projectId: string;
  phaseId: number;
  readOnly?: boolean;
}

export function LabourList({ projectId, phaseId, readOnly = false }: LabourListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingLabour, setEditingLabour] = useState<string | null>(null);
  
  const {
    labour,
    loading,
    addLabour,
    updateLabour,
    deleteLabour
  } = useLabour(projectId, phaseId);

  const handleAddLabour = async (newLabour: Omit<Labour, 'id'>) => {
    try {
      await addLabour(newLabour);
      setIsAdding(false);
    } catch (error) {
      console.error('Failed to add labour:', error);
    }
  };

  const handleUpdateLabour = async (labourId: string, updates: Partial<Labour>) => {
    try {
      await updateLabour(labourId, updates);
      setEditingLabour(null);
    } catch (error) {
      console.error('Failed to update labour:', error);
    }
  };

  const handleDeleteLabour = async (labourId: string) => {
    try {
      await deleteLabour(labourId);
    } catch (error) {
      console.error('Failed to delete labour:', error);
    }
  };

  const getTotalLabourCost = () => {
    return labour.reduce((total, item) => {
      return total + (item.billPerHour ? item.hours * item.hourlyRate : item.costPerJob);
    }, 0);
  };

  if (loading) {
    return (
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
    );
  }

  return (
    <Card>
      <CardHeader>
        <LabourHeader
          labourCount={labour.length}
          totalCost={getTotalLabourCost()}
          readOnly={readOnly}
          onAddLabour={() => setIsAdding(true)}
          isAdding={isAdding}
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Add new labour form */}
          {isAdding && (
            <LabourForm
              onSave={handleAddLabour}
              onCancel={() => setIsAdding(false)}
            />
          )}

          {/* Labour list */}
          <LabourContent
            labour={labour}
            onEditLabour={setEditingLabour}
            onDeleteLabour={handleDeleteLabour}
            onUpdateLabour={handleUpdateLabour}
            editingLabour={editingLabour}
            readOnly={readOnly}
          />
        </div>
      </CardContent>
    </Card>
  );
}
