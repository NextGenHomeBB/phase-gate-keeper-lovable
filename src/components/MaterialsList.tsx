
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit3, Trash2, Package, Euro, Calculator, Sparkles } from "lucide-react";
import { Material } from "@/pages/Index";
import { useLanguage } from "@/contexts/LanguageContext";
import { AIMaterialsCalculator } from "./AIMaterialsCalculator";

interface MaterialsListProps {
  materials: Material[];
  onUpdateMaterials: (materials: Material[]) => void;
  readOnly?: boolean;
}

export function MaterialsList({ materials, onUpdateMaterials, readOnly = false }: MaterialsListProps) {
  const { t } = useLanguage();
  const [editingMaterial, setEditingMaterial] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newMaterial, setNewMaterial] = useState<Omit<Material, 'id'>>({
    name: '',
    quantity: 1,
    unit: 'stuks',
    category: 'Diversen',
    estimatedCost: 0
  });

  const categories = [
    'Beton', 'Staal', 'Hout', 'Metselwerk', 'Mortel', 'Dakbedekking', 
    'Zinwerk', 'Afvoer', 'Isolatie', 'Folie', 'Afdichting', 'Bevestiging',
    'Elektra', 'Sanitair', 'Verlichting', 'Afwerking', 'Diversen'
  ];

  const units = ['stuks', 'm²', 'm³', 'meter', 'kg', 'ton', 'zakken', 'rollen', 'liter'];

  const handleAddMaterial = () => {
    if (newMaterial.name.trim()) {
      const material: Material = {
        ...newMaterial,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: newMaterial.name.trim()
      };
      onUpdateMaterials([...materials, material]);
      setNewMaterial({
        name: '',
        quantity: 1,
        unit: 'stuks',
        category: 'Diversen',
        estimatedCost: 0
      });
      setIsAdding(false);
    }
  };

  const handleAddAIMaterials = (aiMaterials: Material[]) => {
    onUpdateMaterials([...materials, ...aiMaterials]);
  };

  const handleUpdateMaterial = (materialId: string, updatedMaterial: Partial<Material>) => {
    const updatedMaterials = materials.map(material =>
      material.id === materialId ? { ...material, ...updatedMaterial } : material
    );
    onUpdateMaterials(updatedMaterials);
    setEditingMaterial(null);
  };

  const handleDeleteMaterial = (materialId: string) => {
    const updatedMaterials = materials.filter(material => material.id !== materialId);
    onUpdateMaterials(updatedMaterials);
  };

  const getTotalEstimatedCost = () => {
    return materials.reduce((total, material) => {
      return total + (material.estimatedCost || 0) * material.quantity;
    }, 0);
  };

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
    <div className="space-y-6">
      {/* AI Calculator - only show when not readonly */}
      {!readOnly && (
        <AIMaterialsCalculator onAddMaterials={handleAddAIMaterials} />
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Materialen ({materials.length})
            </CardTitle>
            {!readOnly && (
              <Tabs defaultValue="manual" className="w-auto">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="manual" className="flex items-center">
                    <Plus className="w-4 h-4 mr-1" />
                    Handmatig
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="flex items-center">
                    <Sparkles className="w-4 h-4 mr-1" />
                    AI Bereken
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="manual">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAdding(true)}
                    disabled={isAdding}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Materiaal toevoegen
                  </Button>
                </TabsContent>
                <TabsContent value="ai">
                  <div className="text-center text-sm text-gray-600">
                    Gebruik de AI calculator hierboven
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
          {materials.length > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <Euro className="w-4 h-4 mr-1" />
              Geschatte totale kosten: €{getTotalEstimatedCost().toFixed(2)}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Add new material form */}
            {isAdding && (
              <div className="p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Materiaal naam"
                    value={newMaterial.name}
                    onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Aantal"
                      value={newMaterial.quantity}
                      onChange={(e) => setNewMaterial({ ...newMaterial, quantity: parseInt(e.target.value) || 1 })}
                      className="w-20"
                    />
                    <Select value={newMaterial.unit} onValueChange={(value) => setNewMaterial({ ...newMaterial, unit: value })}>
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
                  <Select value={newMaterial.category} onValueChange={(value) => setNewMaterial({ ...newMaterial, category: value })}>
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
                      value={newMaterial.estimatedCost || ''}
                      onChange={(e) => setNewMaterial({ ...newMaterial, estimatedCost: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddMaterial}>
                    Toevoegen
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsAdding(false)}>
                    Annuleren
                  </Button>
                </div>
              </div>
            )}

            {/* Materials list */}
            {materials.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Geen materialen toegevoegd</p>
                {!readOnly && (
                  <p className="text-sm mt-1">Gebruik de AI calculator of voeg handmatig materialen toe</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {materials.map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow"
                  >
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
                              onClick={() => setEditingMaterial(material.id)}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteMaterial(material.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
