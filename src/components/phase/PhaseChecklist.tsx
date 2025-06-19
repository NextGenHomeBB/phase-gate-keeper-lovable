
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Camera, Edit, X } from "lucide-react";
import { Phase, ChecklistItem } from "@/pages/Index";
import { CameraCapture } from "@/components/CameraCapture";
import { ChecklistItemEditor } from "./ChecklistItemEditor";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

interface PhaseChecklistProps {
  phase: Phase;
  onChecklistItemToggle: (phaseId: number, itemId: string, completed: boolean) => void;
  onEditChecklistItem: (phaseId: number, itemId: string, description: string, notes?: string) => void;
  onAddPhotoToChecklist: (phaseId: number, itemId: string, photoBlob: Blob) => void;
  onRemoveChecklistItem?: (phaseId: number, itemId: string) => void;
}

export function PhaseChecklist({ 
  phase, 
  onChecklistItemToggle, 
  onEditChecklistItem,
  onAddPhotoToChecklist,
  onRemoveChecklistItem
}: PhaseChecklistProps) {
  const { t } = useLanguage(); 
  const { toast } = useToast();
  const [editingChecklistItem, setEditingChecklistItem] = useState<{phaseId: number, itemId: string} | null>(null);
  const [editingItemText, setEditingItemText] = useState("");
  const [editingItemNotes, setEditingItemNotes] = useState("");

  const handleEditChecklistItem = (phaseId: number, itemId: string) => {
    const item = phase.checklist.find(i => i.id === itemId);
    if (item) {
      setEditingChecklistItem({ phaseId, itemId });
      setEditingItemText(item.description);
      setEditingItemNotes(item.notes || "");
    }
  };

  const handleSaveChecklistItem = async () => {
    if (!editingChecklistItem) return;

    try {
      await onEditChecklistItem(
        editingChecklistItem.phaseId,
        editingChecklistItem.itemId,
        editingItemText.trim(),
        editingItemNotes.trim() || undefined
      );
      
      setEditingChecklistItem(null);
      setEditingItemText("");
      setEditingItemNotes("");

      toast({
        title: "Checklist item updated",
        description: "The checklist item has been successfully updated.",
      });
    } catch (error) {
      console.error('Error saving checklist item:', error);
      toast({
        title: "Fout",
        description: "Kon checklist item niet opslaan.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEditChecklistItem = () => {
    setEditingChecklistItem(null);
    setEditingItemText("");
    setEditingItemNotes("");
  };

  const handleRemoveChecklistItem = async (itemId: string) => {
    if (!onRemoveChecklistItem) return;

    try {
      await onRemoveChecklistItem(phase.id, itemId);
      toast({
        title: "Checklist item removed",
        description: "The checklist item has been successfully removed.",
      });
    } catch (error) {
      console.error('Error removing checklist item:', error);
      toast({
        title: "Error",
        description: "Failed to remove checklist item.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-blue-600" />
        {t('projectDetail.checklist')}
      </h4>
      <ul className="list-none pl-0 space-y-3">
        {phase.checklist.map(item => (
          <li key={item.id} className="flex items-center justify-between p-4 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center flex-1">
              <input
                type="checkbox"
                id={item.id}
                className="mr-4 h-5 w-5 rounded text-blue-600 focus:ring-blue-500 focus:ring-2"
                checked={item.completed}
                onChange={(e) => onChecklistItemToggle(phase.id, item.id, e.target.checked)}
              />
              <div className="flex-1">
                <label htmlFor={item.id} className={`text-gray-700 ${item.required ? 'font-medium' : ''} block text-sm leading-relaxed`}>
                  {item.description}
                </label>
                {item.notes && (
                  <p className="text-sm text-gray-500 mt-1 pl-0">{item.notes}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {item.photos && item.photos.length > 0 && (
                <Badge variant="secondary" className="mr-2 bg-blue-50 text-blue-700">
                  <Camera className="w-3 h-3 mr-1" />
                  {item.photos.length} {t('projectDetail.photos')}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditChecklistItem(phase.id, item.id)}
                className="hover:bg-blue-50 hover:scale-105 transition-all"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <CameraCapture
                onCapture={(photoBlob) => onAddPhotoToChecklist(phase.id, item.id, photoBlob)}
              />
              {onRemoveChecklistItem && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveChecklistItem(item.id)}
                  className="hover:bg-red-50 hover:scale-105 transition-all text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <ChecklistItemEditor
        isOpen={editingChecklistItem !== null}
        editingItemText={editingItemText}
        editingItemNotes={editingItemNotes}
        onTextChange={setEditingItemText}
        onNotesChange={setEditingItemNotes}
        onSave={handleSaveChecklistItem}
        onCancel={handleCancelEditChecklistItem}
      />
    </div>
  );
}
