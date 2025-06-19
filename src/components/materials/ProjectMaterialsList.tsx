
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Euro, Search, Download, ChevronDown, ChevronRight, Package } from "lucide-react";
import { Material } from "@/pages/Index";
import { materialService } from "@/services/materialService";
import { useToast } from "@/hooks/use-toast";

interface ProjectMaterialsListProps {
  projectId: string;
  phases: { id: number; name: string }[];
}

export function ProjectMaterialsList({ projectId, phases }: ProjectMaterialsListProps) {
  const [materialsByPhase, setMaterialsByPhase] = useState<{ [phaseId: number]: Material[] }>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expandedPhases, setExpandedPhases] = useState<{ [phaseId: number]: boolean }>({});
  const { toast } = useToast();

  const categories = [
    'Beton', 'Staal', 'Hout', 'Metselwerk', 'Mortel', 'Dakbedekking', 
    'Zinwerk', 'Afvoer', 'Isolatie', 'Folie', 'Afdichting', 'Bevestiging',
    'Elektra', 'Sanitair', 'Verlichting', 'Afwerking', 'Diversen'
  ];

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

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        const materials = await materialService.fetchAllMaterialsForProject(projectId);
        setMaterialsByPhase(materials);
        
        // Expand all phases by default
        const initialExpanded: { [phaseId: number]: boolean } = {};
        phases.forEach(phase => {
          initialExpanded[phase.id] = true;
        });
        setExpandedPhases(initialExpanded);
      } catch (error) {
        console.error('Error fetching materials:', error);
        toast({
          title: "Fout",
          description: "Kon materialen niet laden",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (projectId && phases.length > 0) {
      fetchMaterials();
    }
  }, [projectId, phases, toast]);

  // Set up real-time subscription
  useEffect(() => {
    const unsubscribe = materialService.subscribeToMaterialChanges(projectId, (payload) => {
      console.log('Real-time material update:', payload);
      
      // Refresh materials when changes occur
      const refreshMaterials = async () => {
        try {
          const materials = await materialService.fetchAllMaterialsForProject(projectId);
          setMaterialsByPhase(materials);
        } catch (error) {
          console.error('Error refreshing materials:', error);
        }
      };

      refreshMaterials();
    });

    return unsubscribe;
  }, [projectId]);

  const togglePhase = (phaseId: number) => {
    setExpandedPhases(prev => ({
      ...prev,
      [phaseId]: !prev[phaseId]
    }));
  };

  const getFilteredMaterials = (materials: Material[]) => {
    return materials.filter(material => {
      const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || material.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  };

  const getPhaseTotalCost = (materials: Material[]) => {
    return materials.reduce((total, material) => {
      return total + ((material.estimatedCost || 0) * material.quantity);
    }, 0);
  };

  const getTotalProjectCost = () => {
    let total = 0;
    Object.values(materialsByPhase).forEach(materials => {
      total += getPhaseTotalCost(materials);
    });
    return total;
  };

  const getTotalMaterialsCount = () => {
    let count = 0;
    Object.values(materialsByPhase).forEach(materials => {
      count += materials.length;
    });
    return count;
  };

  const exportMaterialsList = () => {
    let csvContent = "Fase,Materiaal,Aantal,Eenheid,Categorie,Kosten per eenheid,Totale kosten\n";
    
    phases.forEach(phase => {
      const materials = materialsByPhase[phase.id] || [];
      materials.forEach(material => {
        const totalCost = (material.estimatedCost || 0) * material.quantity;
        csvContent += `"${phase.name}","${material.name}",${material.quantity},"${material.unit}","${material.category}",€${(material.estimatedCost || 0).toFixed(2)},€${totalCost.toFixed(2)}\n`;
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'materialen_lijst.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export voltooid",
      description: "Materialen lijst is geëxporteerd naar CSV bestand",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Materialen Overzicht</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Materialen laden...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Materialen Overzicht - Alle Fasen
          </div>
          <Button onClick={exportMaterialsList} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporteer
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-900">{getTotalMaterialsCount()}</div>
            <div className="text-sm text-blue-700">Totaal Materialen</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-900">€{getTotalProjectCost().toFixed(2)}</div>
            <div className="text-sm text-green-700">Totale Kosten</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-900">{phases.length}</div>
            <div className="text-sm text-purple-700">Project Fasen</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Zoek materialen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter op categorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle categorieën</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Materials by Phase */}
        <div className="space-y-4">
          {phases.map(phase => {
            const phaseMaterials = materialsByPhase[phase.id] || [];
            const filteredMaterials = getFilteredMaterials(phaseMaterials);
            const phaseCost = getPhaseTotalCost(phaseMaterials);
            
            if (phaseMaterials.length === 0) {
              return null;
            }

            return (
              <Collapsible
                key={phase.id}
                open={expandedPhases[phase.id]}
                onOpenChange={() => togglePhase(phase.id)}
              >
                <Card className="border-l-4 border-l-blue-500">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <CardTitle className="flex items-center justify-between text-lg">
                        <div className="flex items-center gap-3">
                          {expandedPhases[phase.id] ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                          <span>{phase.name}</span>
                          <Badge variant="outline" className="bg-blue-100 text-blue-800">
                            {phaseMaterials.length} materialen
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Euro className="w-4 h-4 text-green-600" />
                          <span className="font-bold text-green-900">€{phaseCost.toFixed(2)}</span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      {filteredMaterials.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">
                          Geen materialen gevonden voor de huidige filters
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {filteredMaterials.map(material => (
                            <div
                              key={material.id}
                              className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
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
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>

        {getTotalMaterialsCount() === 0 && (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Geen materialen gevonden</h3>
            <p className="text-gray-500">
              Er zijn nog geen materialen toegevoegd aan dit project. Ga naar de individuele fasen om materialen toe te voegen.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
