
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Camera, Edit, X, Plus, Package } from "lucide-react";
import { Phase, ChecklistItem, Material } from "@/pages/Index";
import { CameraCapture } from "@/components/CameraCapture";
import { ChecklistItemEditor } from "./ChecklistItemEditor";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { materialService } from "@/services/materialService";

interface PhaseChecklistProps {
  phase: Phase;
  onChecklistItemToggle: (phaseId: number, itemId: string, completed: boolean) => void;
  onEditChecklistItem: (phaseId: number, itemId: string, description: string, notes?: string) => void;
  onAddPhotoToChecklist: (phaseId: number, itemId: string, photoBlob: Blob) => void;
  onRemoveChecklistItem?: (phaseId: number, itemId: string) => void;
  onAddChecklistItem?: (phaseId: number, description: string, notes?: string) => void;
  projectId: string;
}

export function PhaseChecklist({ 
  phase, 
  onChecklistItemToggle, 
  onEditChecklistItem,
  onAddPhotoToChecklist,
  onRemoveChecklistItem,
  onAddChecklistItem,
  projectId
}: PhaseChecklistProps) {
  const { t } = useLanguage(); 
  const { toast } = useToast();
  const [editingChecklistItem, setEditingChecklistItem] = useState<{phaseId: number, itemId: string} | null>(null);
  const [editingItemText, setEditingItemText] = useState("");
  const [editingItemNotes, setEditingItemNotes] = useState("");
  const [isAddingNewItem, setIsAddingNewItem] = useState(false);
  const [newItemText, setNewItemText] = useState("");
  const [newItemNotes, setNewItemNotes] = useState("");
  const [checklistItemMaterials, setChecklistItemMaterials] = useState<{[itemId: string]: Material[]}>({});

  React.useEffect(() => {
    // Load materials for each checklist item
    const loadMaterialsForChecklistItems = async () => {
      const materialsPromises = phase.checklist.map(async (item) => {
        try {
          const materials = await materialService.fetchMaterialsForChecklistItem(projectId, phase.id, item.id);
          return { itemId: item.id, materials };
        } catch (error) {
          console.error(`Error loading materials for checklist item ${item.id}:`, error);
          return { itemId: item.id, materials: [] };
        }
      });

      const results = await Promise.all(materialsPromises);
      const materialsMap: {[itemId: string]: Material[]} = {};
      results.forEach(({ itemId, materials }) => {
        materialsMap[itemId] = materials;
      });
      setChecklistItemMaterials(materialsMap);
    };

    if (phase.checklist.length > 0) {
      loadMaterialsForChecklistItems();
    }
  }, [projectId, phase.id, phase.checklist]);

  const handleEditChecklistItem = (phaseId: number, itemId: string) => {
    const item = phase.checklist.find(i => i.id === itemId);
    if (item) {
      setEditingChecklistItem({ phaseId, itemId });
      setEditingItemText(item.description);
      setEditingItemNotes(item.notes || "");
    }
  };

  const handleSaveChecklistItem = async (materials?: Omit<Material, 'id'>[]) => {
    if (!editingChecklistItem) return;

    try {
      await onEditChecklistItem(
        editingChecklistItem.phaseId,
        editingChecklistItem.itemId,
        editingItemText.trim(),
        editingItemNotes.trim() || undefined
      );

      // Save materials if provided
      if (materials && materials.length > 0) {
        const savedMaterials = await materialService.addMaterialsForChecklistItem(
          projectId,
          phase.id,
          editingChecklistItem.itemId,
          materials
        );

        // Update local state
        setChecklistItemMaterials(prev => ({
          ...prev,
          [editingChecklistItem.itemId]: [
            ...(prev[editingChecklistItem.itemId] || []),
            ...savedMaterials
          ]
        }));

        toast({
          title: "Materials added",
          description: `${savedMaterials.length} materials have been added to this checklist item.`,
        });
      }
      
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
      
      // Clean up materials state
      setChecklistItemMaterials(prev => {
        const newState = { ...prev };
        delete newState[itemId];
        return newState;
      });

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

  const handleAddNewItem = () => {
    setIsAddingNewItem(true);
    setNewItemText("");
    setNewItemNotes("");
  };

  const handleSaveNewItem = async (materials?: Omit<Material, 'id'>[]) => {
    if (!newItemText.trim() || !onAddChecklistItem) return;

    try {
      await onAddChecklistItem(phase.id, newItemText.trim(), newItemNotes.trim() || undefined);

      // For new items, we would need the item ID to save materials
      // This would require updating the onAddChecklistItem callback to return the new item
      // For now, we'll handle this in a future iteration
      
      setIsAddingNewItem(false);
      setNewItemText("");
      setNewItemNotes("");

      toast({
        title: "Checklist item added",
        description: "The new checklist item has been successfully added.",
      });
    } catch (error) {
      console.error('Error adding checklist item:', error);
      toast({
        title: "Error",
        description: "Failed to add checklist item.",
        variant: "destructive",
      });
    }
  };

  const handleCancelNewItem = () => {
    setIsAddingNewItem(false);
    setNewItemText("");
    setNewItemNotes("");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-blue-600" />
          {t('projectDetail.checklist')}
        </h4>
        {onAddChecklistItem && (
          <Button
            onClick={handleAddNewItem}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Item
          </Button>
        )}
      </div>
      
      <ul className="list-none pl-0 space-y-3">
        {phase.checklist.map(item => {
          const itemMaterials = checklistItemMaterials[item.id] || [];
          
          return (
            <li key={item.id} className="flex flex-col p-4 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
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
              </div>

              {/* Display materials for this checklist item */}
              {itemMaterials.length > 0 && (
                <div className="mt-3 pl-9">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">Materials ({itemMaterials.length})</span>
                  </div>
                  <div className="space-y-1">
                    {itemMaterials.map((material) => (
                      <div key={material.id} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                        {material.quantity} {material.unit} {material.name} - {material.category}
                        {material.estimatedCost > 0 && (
                          <span className="ml-2 text-green-600">€{(material.estimatedCost * material.quantity).toFixed(2)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </li>
          );
        })}
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

      <ChecklistItemEditor
        isOpen={isAddingNewItem}
        editingItemText={newItemText}
        editingItemNotes={newItemNotes}
        onTextChange={setNewItemText}
        onNotesChange={setNewItemNotes}
        onSave={handleSaveNewItem}
        onCancel={handleCancelNewItem}
      />
    </div>
  );
}
