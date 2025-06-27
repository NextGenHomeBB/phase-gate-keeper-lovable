
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Material } from "@/pages/Index";
import { Check, X } from "lucide-react";

interface ManualMaterialFormProps {
  onSave: (material: Omit<Material, 'id'>) => void;
  onCancel: () => void;
}

export function ManualMaterialForm({ onSave, onCancel }: ManualMaterialFormProps) {
  const [material, setMaterial] = useState<Omit<Material, 'id'>>({
    name: '',
    quantity: 1,
    unit: 'stuks',
    category: 'Diversen',
    estimatedCost: 0,
    isManual: true,
    vatPercentage: 0
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const units = ['stuks', 'm', 'm²', 'm³', 'kg', 'ton', 'liter', 'zakken', 'rollen', 'meter'];
  const categories = [
    'Beton', 'Staal', 'Hout', 'Metselwerk', 'Mortel', 'Dakbedekking', 
    'Zinwerk', 'Afvoer', 'Isolatie', 'Folie', 'Afdichting', 'Bevestiging',
    'Elektra', 'Sanitair', 'Verlichting', 'Afwerking', 'Diversen'
  ];

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!material.name.trim()) {
      newErrors.name = 'Beschrijving is verplicht';
    }
    
    if (material.quantity <= 0) {
      newErrors.quantity = 'Aantal moet groter zijn dan 0';
    }
    
    if (material.estimatedCost < 0) {
      newErrors.estimatedCost = 'Kosten kunnen niet negatief zijn';
    }
    
    if (material.vatPercentage < 0 || material.vatPercentage > 100) {
      newErrors.vatPercentage = 'BTW % moet tussen 0 en 100 zijn';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(material);
    }
  };

  const handleFieldChange = (field: keyof typeof material, value: any) => {
    setMaterial(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getTotalCost = () => {
    const baseCost = material.quantity * material.estimatedCost;
    const vatAmount = baseCost * (material.vatPercentage / 100);
    return baseCost + vatAmount;
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Nieuw handmatig materiaal</h4>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!material.name.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            <Check className="w-4 h-4 mr-1" />
            Opslaan
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onCancel}
          >
            <X className="w-4 h-4 mr-1" />
            Annuleren
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {/* Description */}
        <div className="md:col-span-2">
          <Input
            placeholder="Beschrijving..."
            value={material.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>
        
        {/* Quantity */}
        <div>
          <Input
            type="number"
            placeholder="Aantal"
            value={material.quantity}
            onChange={(e) => handleFieldChange('quantity', parseInt(e.target.value) || 0)}
            min="1"
            className={errors.quantity ? 'border-red-500' : ''}
          />
          {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
        </div>
        
        {/* Unit */}
        <div>
          <Select value={material.unit} onValueChange={(value) => handleFieldChange('unit', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Eenheid" />
            </SelectTrigger>
            <SelectContent>
              {units.map(unit => (
                <SelectItem key={unit} value={unit}>{unit}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Unit Cost */}
        <div>
          <Input
            type="number"
            placeholder="€ per eenheid"
            value={material.estimatedCost}
            onChange={(e) => handleFieldChange('estimatedCost', parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
            className={errors.estimatedCost ? 'border-red-500' : ''}
          />
          {errors.estimatedCost && <p className="text-red-500 text-xs mt-1">{errors.estimatedCost}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Category */}
        <div>
          <Select value={material.category} onValueChange={(value) => handleFieldChange('category', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Categorie" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* VAT Percentage */}
        <div>
          <Input
            type="number"
            placeholder="BTW % (optioneel)"
            value={material.vatPercentage}
            onChange={(e) => handleFieldChange('vatPercentage', parseFloat(e.target.value) || 0)}
            min="0"
            max="100"
            step="0.1"
            className={errors.vatPercentage ? 'border-red-500' : ''}
          />
          {errors.vatPercentage && <p className="text-red-500 text-xs mt-1">{errors.vatPercentage}</p>}
        </div>
        
        {/* Total Cost Display */}
        <div className="flex items-center">
          <div className="text-sm">
            <span className="text-gray-600">Totaal: </span>
            <span className="font-semibold text-green-600">€{getTotalCost().toFixed(2)}</span>
            {material.vatPercentage > 0 && (
              <span className="text-xs text-gray-500 ml-1">(incl. {material.vatPercentage}% BTW)</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
