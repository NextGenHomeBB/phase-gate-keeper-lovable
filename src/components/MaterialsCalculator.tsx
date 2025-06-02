
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, Euro, Package } from "lucide-react";
import { Project } from "@/pages/Index";
import { useLanguage } from "@/contexts/LanguageContext";

interface MaterialsCalculatorProps {
  project: Project;
}

export function MaterialsCalculator({ project }: MaterialsCalculatorProps) {
  const { t } = useLanguage();

  const calculateTotalCosts = () => {
    let totalCost = 0;
    let totalItems = 0;
    const categoryTotals: { [key: string]: number } = {};

    project.phases.forEach(phase => {
      phase.materials?.forEach(material => {
        const materialTotal = (material.estimatedCost || 0) * material.quantity;
        totalCost += materialTotal;
        totalItems += material.quantity;
        
        if (categoryTotals[material.category]) {
          categoryTotals[material.category] += materialTotal;
        } else {
          categoryTotals[material.category] = materialTotal;
        }
      });
    });

    return {
      totalCost,
      totalItems,
      categoryTotals
    };
  };

  const { totalCost, totalItems, categoryTotals } = calculateTotalCosts();

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
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calculator className="w-5 h-5 mr-2" />
          Materialen Kostenberekening
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Total overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Euro className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Totale Kosten</p>
                  <p className="text-2xl font-bold text-blue-900">€{totalCost.toFixed(2)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Package className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm text-green-600 font-medium">Totaal Items</p>
                  <p className="text-2xl font-bold text-green-900">{totalItems}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Package className="w-5 h-5 text-purple-600 mr-2" />
                <div>
                  <p className="text-sm text-purple-600 font-medium">Categorieën</p>
                  <p className="text-2xl font-bold text-purple-900">{Object.keys(categoryTotals).length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Category breakdown */}
          {Object.keys(categoryTotals).length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Kosten per Categorie</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {Object.entries(categoryTotals)
                  .sort(([,a], [,b]) => b - a)
                  .map(([category, cost]) => (
                    <div key={category} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                      <Badge variant="outline" className={getCategoryColor(category)}>
                        {category}
                      </Badge>
                      <span className="font-medium text-sm">€{cost.toFixed(2)}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Cost distribution */}
          {Object.keys(categoryTotals).length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Verdeling per Categorie</h4>
              <div className="space-y-2">
                {Object.entries(categoryTotals)
                  .sort(([,a], [,b]) => b - a)
                  .map(([category, cost]) => {
                    const percentage = totalCost > 0 ? (cost / totalCost) * 100 : 0;
                    return (
                      <div key={category} className="flex items-center">
                        <div className="w-24 text-sm">
                          <Badge variant="outline" className={getCategoryColor(category)}>
                            {category}
                          </Badge>
                        </div>
                        <div className="flex-1 mx-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="w-20 text-right text-sm">
                          <span className="font-medium">€{cost.toFixed(2)}</span>
                          <span className="text-gray-500 ml-1">({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {totalCost === 0 && (
            <div className="text-center py-6 text-gray-500">
              <Calculator className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Geen materialen met kosten gevonden</p>
              <p className="text-sm">Voeg materialen toe aan de project fases om kosten te berekenen</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
