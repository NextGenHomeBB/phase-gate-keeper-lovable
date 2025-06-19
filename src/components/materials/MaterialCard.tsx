
import { Edit3, Trash2, Euro, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Material } from "@/pages/Index";
import { useState } from "react";

interface MaterialCardProps {
  material: Material;
  onEdit: (materialId: string) => void;
  onDelete: (materialId: string) => void;
  onUpdate?: (materialId: string, updates: Partial<Material>) => void;
  readOnly?: boolean;
}

export function MaterialCard({ material, onEdit, onDelete, onUpdate, readOnly = false }: MaterialCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMaterial, setEditedMaterial] = useState<Material>(material);

  const categories = [
    'Beton', 'Staal', 'Hout', 'Metselwerk', 'Mortel', 'Dakbedekking', 
    'Zinwerk', 'Afvoer', 'Isolatie', 'Folie', 'Afdichting', 'Bevestiging',
    'Elektra', 'Sanitair', 'Verlichting', 'Afwerking', 'Diversen'
  ];

  const units = ['stuks', 'm²', 'm³', 'meter', 'kg', 'ton', 'zakken', 'rollen', 'liter'];

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Beton': 'bg-gray-100 text-gray-800',
      'Staal': 'bg-blue-100 text-blue-800',
      'Hout': 'bg-orange-100 text-orange-800',
      'Metselwerk': 'bg-red-100 text-red-800',
      'Elektra': 'bg-yellow-100 text-yellow-800',
      'Isolatie': 'bg-green-100 text-green-800',
      'Sanitair': 'bg-cyan-100 text-cyan-800',
      'Afwerking': 'bg-purple-100 text-purple-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedMaterial(material);
  };

  const handleSave = () => {
    if (onUpdate) {
      // Ensure quantity is at least 1 when saving
      const validatedMaterial = {
        ...editedMaterial,
        quantity: editedMaterial.quantity < 1 ? 1 : editedMaterial.quantity
      };
      onUpdate(material.id, validatedMaterial);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedMaterial(material);
  };

  if (isEditing) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Materiaal naam"
              value={editedMaterial.name}
              onChange={(e) => setEditedMaterial({ ...editedMaterial, name: e.target.value })}
            />
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Aantal"
                value={editedMaterial.quantity}
                onChange={(e) => setEditedMaterial({ ...editedMaterial, quantity: parseInt(e.target.value) || 0 })}
                className="w-20"
                min="0"
              />
              <Select value={editedMaterial.unit} onValueChange={(value) => setEditedMaterial({ ...editedMaterial, unit: value })}>
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
            <Select value={editedMaterial.category} onValueChange={(value) => setEditedMaterial({ ...editedMaterial, category: value })}>
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
                placeholder="Kosten per eenheid"
                value={editedMaterial.estimatedCost || ''}
                onChange={(e) => setEditedMaterial({ ...editedMaterial, estimatedCost: parseFloat(e.target.value) || 0 })}
                min="0"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>
              <Check className="w-4 h-4 mr-1" />
              Opslaan
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-1" />
              Annuleren
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{material.name}</h4>
              <Badge variant="outline" className={getCategoryColor(material.category)}>
                {material.category}
              </Badge>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {material.quantity} {material.unit}
              {material.estimatedCost && (
                <span className="ml-3">
                  €{material.estimatedCost.toFixed(2)} per {material.unit} 
                  <span className="font-medium ml-1">
                    (Totaal: €{(material.estimatedCost * material.quantity).toFixed(2)})
                  </span>
                </span>
              )}
            </div>
          </div>
          {!readOnly && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleEdit}
              >
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                onClick={() => onDelete(material.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
