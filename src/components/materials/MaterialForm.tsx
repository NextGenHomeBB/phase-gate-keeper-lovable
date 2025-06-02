
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Euro } from "lucide-react";
import { Material } from "@/pages/Index";

interface MaterialFormProps {
  material: Omit<Material, 'id'>;
  onMaterialChange: (material: Omit<Material, 'id'>) => void;
  onSave: () => void;
  onCancel: () => void;
  saveLabel?: string;
}

export function MaterialForm({ 
  material, 
  onMaterialChange, 
  onSave, 
  onCancel,
  saveLabel = "Toevoegen"
}: MaterialFormProps) {
  const categories = [
    'Beton', 'Staal', 'Hout', 'Metselwerk', 'Mortel', 'Dakbedekking', 
    'Zinwerk', 'Afvoer', 'Isolatie', 'Folie', 'Afdichting', 'Bevestiging',
    'Elektra', 'Sanitair', 'Verlichting', 'Afwerking', 'Diversen'
  ];

  const units = ['stuks', 'm²', 'm³', 'meter', 'kg', 'ton', 'zakken', 'rollen', 'liter'];

  return (
    <div className="p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Input
          placeholder="Materiaal naam"
          value={material.name}
          onChange={(e) => onMaterialChange({ ...material, name: e.target.value })}
        />
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Aantal"
            value={material.quantity}
            onChange={(e) => onMaterialChange({ ...material, quantity: parseInt(e.target.value) || 1 })}
            className="w-20"
          />
          <Select value={material.unit} onValueChange={(value) => onMaterialChange({ ...material, unit: value })}>
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
        <Select value={material.category} onValueChange={(value) => onMaterialChange({ ...material, category: value })}>
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
            value={material.estimatedCost || ''}
            onChange={(e) => onMaterialChange({ ...material, estimatedCost: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={onSave}>
          {saveLabel}
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          Annuleren
        </Button>
      </div>
    </div>
  );
}
