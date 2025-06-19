
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Package, Plus, Trash2, Euro } from "lucide-react";
import { Material } from "@/pages/Index";

interface ChecklistItemEditorProps {
  isOpen: boolean;
  editingItemText: string;
  editingItemNotes: string;
  onTextChange: (text: string) => void;
  onNotesChange: (notes: string) => void;
  onSave: (materials?: Omit<Material, 'id'>[]) => void;
  onCancel: () => void;
}

interface MaterialInput extends Omit<Material, 'id'> {}

export function ChecklistItemEditor({
  isOpen,
  editingItemText,
  editingItemNotes,
  onTextChange,
  onNotesChange,
  onSave,
  onCancel
}: ChecklistItemEditorProps) {
  const [materials, setMaterials] = useState<MaterialInput[]>([]);

  const categories = [
    'Beton', 'Staal', 'Hout', 'Metselwerk', 'Mortel', 'Dakbedekking', 
    'Zinwerk', 'Afvoer', 'Isolatie', 'Folie', 'Afdichting', 'Bevestiging',
    'Elektra', 'Sanitair', 'Verlichting', 'Afwerking', 'Diversen'
  ];

  const units = ['stuks', 'm²', 'm³', 'meter', 'kg', 'ton', 'zakken', 'rollen', 'liter'];

  const handleAddMaterial = () => {
    setMaterials([...materials, {
      name: '',
      quantity: 1,
      unit: 'stuks',
      category: 'Diversen',
      estimatedCost: 0
    }]);
  };

  const handleUpdateMaterial = (index: number, updates: Partial<MaterialInput>) => {
    const updatedMaterials = materials.map((material, i) => 
      i === index ? { ...material, ...updates } : material
    );
    setMaterials(updatedMaterials);
  };

  const handleRemoveMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const validMaterials = materials.filter(material => material.name.trim() !== '');
    onSave(validMaterials);
    setMaterials([]);
  };

  const handleCancel = () => {
    setMaterials([]);
    onCancel();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Checklist Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Input
              value={editingItemText}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder="Enter description"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              <MessageSquare className="w-4 h-4 inline mr-1" />
              Notes
            </label>
            <Textarea
              value={editingItemNotes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Add notes or additional information"
              rows={3}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium">
                <Package className="w-4 h-4 inline mr-1" />
                Materials
              </label>
              <Button 
                type="button" 
                size="sm" 
                onClick={handleAddMaterial}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Material
              </Button>
            </div>
            
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {materials.map((material, index) => (
                <div key={index} className="p-3 border rounded-lg bg-gray-50 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Material name"
                      value={material.name}
                      onChange={(e) => handleUpdateMaterial(index, { name: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Quantity"
                        value={material.quantity}
                        onChange={(e) => handleUpdateMaterial(index, { quantity: parseInt(e.target.value) || 1 })}
                        className="w-20"
                      />
                      <Select 
                        value={material.unit} 
                        onValueChange={(value) => handleUpdateMaterial(index, { unit: value })}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Select 
                      value={material.category} 
                      onValueChange={(value) => handleUpdateMaterial(index, { category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="flex items-center gap-2">
                      <Euro className="w-4 h-4 text-gray-500" />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Cost per unit"
                        value={material.estimatedCost || ''}
                        onChange={(e) => handleUpdateMaterial(index, { estimatedCost: parseFloat(e.target.value) || 0 })}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveMaterial(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {materials.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No materials added yet. Click "Add Material" to get started.
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
