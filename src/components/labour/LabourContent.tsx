
import { Hammer } from "lucide-react";
import { Labour } from "@/pages/Index";
import { LabourCard } from "./LabourCard";

interface LabourContentProps {
  labour: Labour[];
  onEditLabour: (labourId: string) => void;
  onDeleteLabour: (labourId: string) => void;
  onUpdateLabour?: (labourId: string, updates: Partial<Labour>) => void;
  editingLabour: string | null;
  readOnly?: boolean;
}

export function LabourContent({ 
  labour, 
  onEditLabour, 
  onDeleteLabour,
  onUpdateLabour,
  editingLabour,
  readOnly = false 
}: LabourContentProps) {
  if (labour.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <Hammer className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>Geen arbeidskosten toegevoegd</p>
        {!readOnly && (
          <p className="text-sm mt-1">Voeg arbeidskosten toe om de totale projectkosten te berekenen</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {labour.map((labourItem) => (
        <LabourCard
          key={labourItem.id}
          labour={labourItem}
          onEdit={onEditLabour}
          onDelete={onDeleteLabour}
          onUpdate={onUpdateLabour}
          isEditing={editingLabour === labourItem.id}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}
