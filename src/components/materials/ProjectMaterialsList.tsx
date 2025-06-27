
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Euro, Search, Download, ChevronDown, ChevronRight, Package, Hammer } from "lucide-react";
import { Material, Labour } from "@/pages/Index";
import { materialService } from "@/services/materialService";
import { labourService } from "@/services/labourService";
import { useToast } from "@/hooks/use-toast";

interface ProjectMaterialsListProps {
  projectId: string;
  phases: { id: number; name: string }[];
}

export function ProjectMaterialsList({ projectId, phases }: ProjectMaterialsListProps) {
  const [materialsByPhase, setMaterialsByPhase] = useState<{ [phaseId: number]: Material[] }>({});
  const [labourByPhase, setLabourByPhase] = useState<{ [phaseId: number]: Labour[] }>({});
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
    const fetchData = async () => {
      try {
        setLoading(true);
        const [materials, labour] = await Promise.all([
          materialService.fetchAllMaterialsForProject(projectId),
          labourService.fetchAllLabourForProject(projectId)
        ]);
        
        setMaterialsByPhase(materials);
        setLabourByPhase(labour);
        
        // Expand all phases by default
        const initialExpanded: { [phaseId: number]: boolean } = {};
        phases.forEach(phase => {
          initialExpanded[phase.id] = true;
        });
        setExpandedPhases(initialExpanded);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Fout",
          description: "Kon materialen en arbeidskosten niet laden",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (projectId && phases.length > 0) {
      fetchData();
    }
  }, [projectId, phases, toast]);

  // Set up real-time subscriptions
  useEffect(() => {
    const materialUnsubscribe = materialService.subscribeToMaterialChanges(projectId, (payload) => {
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

    const labourUnsubscribe = labourService.subscribeToLabourChanges(projectId, (payload) => {
      console.log('Real-time labour update:', payload);
      
      // Refresh labour when changes occur
      const refreshLabour = async () => {
        try {
          const labour = await labourService.fetchAllLabourForProject(projectId);
          setLabourByPhase(labour);
        } catch (error) {
          console.error('Error refreshing labour:', error);
        }
      };

      refreshLabour();
    });

    return () => {
      materialUnsubscribe();
      labourUnsubscribe();
    };
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

  const getPhaseMaterialsCost = (materials: Material[]) => {
    return materials.reduce((total, material) => {
      return total + ((material.estimatedCost || 0) * material.quantity);
    }, 0);
  };

  const getPhaseLabourCost = (labour: Labour[]) => {
    return labour.reduce((total, labourItem) => {
      return total + (labourItem.billPerHour ? labourItem.hours * labourItem.hourlyRate : labourItem.costPerJob);
    }, 0);
  };

  const getPhaseTotalCost = (phaseId: number) => {
    const materials = materialsByPhase[phaseId] || [];
    const labour = labourByPhase[phaseId] || [];
    return getPhaseMaterialsCost(materials) + getPhaseLabourCost(labour);
  };

  const getTotalProjectCost = () => {
    let total = 0;
    phases.forEach(phase => {
      total += getPhaseTotalCost(phase.id);
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

  const getTotalLabourCount = () => {
    let count = 0;
    Object.values(labourByPhase).forEach(labour => {
      count += labour.length;
    });
    return count;
  };

  const exportProjectList = () => {
    let csvContent = "Fase,Type,Item,Aantal/Uren,Eenheid,Kosten per eenheid,Totale kosten\n";
    
    phases.forEach(phase => {
      const materials = materialsByPhase[phase.id] || [];
      const labour = labourByPhase[phase.id] || [];
      
      materials.forEach(material => {
        const totalCost = (material.estimatedCost || 0) * material.quantity;
        csvContent += `"${phase.name}","Materiaal","${material.name}",${material.quantity},"${material.unit}",€${(material.estimatedCost || 0).toFixed(2)},€${totalCost.toFixed(2)}\n`;
      });
      
      labour.forEach(labourItem => {
        const totalCost = labourItem.billPerHour ? labourItem.hours * labourItem.hourlyRate : labourItem.costPerJob;
        const unit = labourItem.billPerHour ? `${labourItem.hours} uur à €${labourItem.hourlyRate}` : 'Per klus';
        csvContent += `"${phase.name}","Arbeid","${labourItem.task}",${labourItem.billPerHour ? labourItem.hours : 1},"${unit}",€${labourItem.billPerHour ? labourItem.hourlyRate.toFixed(2) : labourItem.costPerJob.toFixed(2)},€${totalCost.toFixed(2)}\n`;
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'project_overzicht.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export voltooid",
      description: "Project overzicht is geëxporteerd naar CSV bestand",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Overzicht</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Gegevens laden...</span>
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
            Project Overzicht - Alle Fasen
          </div>
          <Button onClick={exportProjectList} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporteer
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-900">{getTotalMaterialsCount()}</div>
            <div className="text-sm text-blue-700">Materialen</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-900">{getTotalLabourCount()}</div>
            <div className="text-sm text-purple-700">Arbeidskosten</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-900">€{getTotalProjectCost().toFixed(2)}</div>
            <div className="text-sm text-green-700">Totale Kosten</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{phases.length}</div>
            <div className="text-sm text-gray-700">Project Fasen</div>
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

        {/* Phase Overview */}
        <div className="space-y-4">
          {phases.map(phase => {
            const phaseMaterials = materialsByPhase[phase.id] || [];
            const phaseLabour = labourByPhase[phase.id] || [];
            const filteredMaterials = getFilteredMaterials(phaseMaterials);
            const phaseTotalCost = getPhaseTotalCost(phase.id);
            
            if (phaseMaterials.length === 0 && phaseLabour.length === 0) {
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
                          <div className="flex gap-2">
                            <Badge variant="outline" className="bg-blue-100 text-blue-800">
                              <Package className="w-3 h-3 mr-1" />
                              {phaseMaterials.length}
                            </Badge>
                            <Badge variant="outline" className="bg-purple-100 text-purple-800">
                              <Hammer className="w-3 h-3 mr-1" />
                              {phaseLabour.length}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Euro className="w-4 h-4 text-green-600" />
                          <span className="font-bold text-green-900">€{phaseTotalCost.toFixed(2)}</span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0 space-y-4">
                      {/* Materials */}
                      {filteredMaterials.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Materialen
                          </h4>
                          <div className="space-y-3">
                            {filteredMaterials.map(material => (
                              <div
                                key={material.id}
                                className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-3">
                                    <h5 className="font-medium">{material.name}</h5>
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
                        </div>
                      )}

                      {/* Labour */}
                      {phaseLabour.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Hammer className="w-4 h-4" />
                            Arbeidskosten
                          </h4>
                          <div className="space-y-3">
                            {phaseLabour.map(labourItem => (
                              <div
                                key={labourItem.id}
                                className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-3">
                                    <h5 className="font-medium">{labourItem.task}</h5>
                                    <Badge variant="outline" className={labourItem.billPerHour ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}>
                                      {labourItem.billPerHour ? 'Per uur' : 'Per klus'}
                                    </Badge>
                                  </div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    {labourItem.billPerHour ? (
                                      <span>
                                        {labourItem.hours} uur × €{labourItem.hourlyRate.toFixed(2)} = 
                                        <span className="font-medium ml-1 text-blue-600">€{(labourItem.hours * labourItem.hourlyRate).toFixed(2)}</span>
                                      </span>
                                    ) : (
                                      <span className="font-medium text-green-600">€{labourItem.costPerJob.toFixed(2)}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>

        {getTotalMaterialsCount() === 0 && getTotalLabourCount() === 0 && (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Geen gegevens gevonden</h3>
            <p className="text-gray-500">
              Er zijn nog geen materialen of arbeidskosten toegevoegd aan dit project. Ga naar de individuele fasen om gegevens toe te voegen.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
