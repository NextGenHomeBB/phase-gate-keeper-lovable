
import { Edit3, Trash2, Euro } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Material } from "@/pages/Index";
import { WebshopPriceComparison } from "../WebshopPriceComparison";

interface MaterialCardProps {
  material: Material;
  onEdit: (materialId: string) => void;
  onDelete: (materialId: string) => void;
  readOnly?: boolean;
}

export function MaterialCard({ material, onEdit, onDelete, readOnly = false }: MaterialCardProps) {
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
            <div className="flex items-center gap-2 mt-2">
              <WebshopPriceComparison material={material} />
            </div>
          </div>
          {!readOnly && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onEdit(material.id)}
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
