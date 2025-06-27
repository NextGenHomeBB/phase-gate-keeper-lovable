
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Check, X, Euro, User } from "lucide-react";
import { Material } from "@/pages/Index";

interface MaterialCardProps {
  material: Material;
  onEdit: (materialId: string) => void;
  onDelete: (materialId: string) => void;
  onUpdate?: (materialId: string, updates: Partial<Material>) => void;
  readOnly?: boolean;
  isManual?: boolean;
}

export function MaterialCard({ 
  material, 
  onEdit, 
  onDelete, 
  onUpdate, 
  readOnly = false,
  isManual = false
}: MaterialCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMaterial, setEditedMaterial] = useState(material);

  const categories = [
    'Beton', 'Staal', 'Hout', 'Metselwerk', 'Mortel', 'Dakbedekking', 
    'Zinwerk', 'Afvoer', 'Isolatie', 'Folie', 'Afdichting', 'Bevestiging',
    'Elektra', 'Sanitair', 'Verlichting', 'Afwerking', 'Diversen'
  ];

  const units = ['stuks', 'm', 'm²', 'm³', 'kg', 'ton', 'liter', 'zakken', 'rollen', 'meter'];

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

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(material.id, editedMaterial);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedMaterial(material);
    setIsEditing(false);
  };

  const getTotalCost = (mat: Material) => {
    const baseCost = mat.quantity * (mat.estimatedCost || 0);
    const vatAmount = baseCost * ((mat.vatPercentage || 0) / 100);
    return baseCost + vatAmount;
  };

  if (isEditing) {
    return (
      <Card className="p-4 border-2 border-blue-200 bg-blue-50">
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              value={editedMaterial.name}
              onChange={(e) => setEditedMaterial({ ...editedMaterial, name: e.target.value })}
              placeholder="Naam"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                value={editedMaterial.quantity}
                onChange={(e) => setEditedMaterial({ ...editedMaterial, quantity: parseInt(e.target.value) || 0 })}
                placeholder="Aantal"
                min="1"
              />
              <Select value={editedMaterial.unit} onValueChange={(value) => setEditedMaterial({ ...editedMaterial, unit: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map(unit => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Select value={editedMaterial.category} onValueChange={(value) => setEditedMaterial({ ...editedMaterial, category: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {isManual && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                type="number"
                value={editedMaterial.estimatedCost || 0}
                onChange={(e) => setEditedMaterial({ ...editedMaterial, estimatedCost: parseFloat(e.target.value) || 0 })}
                placeholder="€ per eenheid"
                min="0"
                step="0.01"
              />
              <Input
                type="number"
                value={editedMaterial.vatPercentage || 0}
                onChange={(e) => setEditedMaterial({ ...editedMaterial, vatPercentage: parseFloat(e.target.value) || 0 })}
                placeholder="BTW %"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Totaal: <span className="font-semibold text-green-600">€{getTotalCost(editedMaterial).toFixed(2)}</span>
              {(editedMaterial.vatPercentage || 0) > 0 && (
                <span className="text-xs ml-1">(incl. {editedMaterial.vatPercentage}% BTW)</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                <Check className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 hover:shadow-sm transition-shadow ${isManual ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-blue-500'}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-medium">{material.name}</h4>
            <Badge variant="outline" className={getCategoryColor(material.category)}>
              {material.category}
            </Badge>
            {isManual && (
              <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                <User className="w-3 h-3 mr-1" />
                Handmatig
              </Badge>
            )}
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <div>
              {material.quantity} {material.unit}
              {material.estimatedCost && (
                <span className="ml-3">
                  €{material.estimatedCost.toFixed(2)} per {material.unit}
                </span>
              )}
            </div>
            {material.estimatedCost && (
              <div className="flex items-center gap-1">
                <Euro className="w-3 h-3 text-green-600" />
                <span className="font-medium text-green-600">
                  €{getTotalCost(material).toFixed(2)}
                </span>
                {(material.vatPercentage || 0) > 0 && (
                  <span className="text-xs text-gray-500">
                    (incl. {material.vatPercentage}% BTW)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        {!readOnly && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(material.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
