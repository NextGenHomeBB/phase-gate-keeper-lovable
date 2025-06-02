
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calculator, Sparkles, Plus } from "lucide-react";
import { Material } from "@/pages/Index";
import { useToast } from "@/hooks/use-toast";

interface AIMaterialsCalculatorProps {
  onAddMaterials: (materials: Material[]) => void;
}

export function AIMaterialsCalculator({ onAddMaterials }: AIMaterialsCalculatorProps) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [squareMeters, setSquareMeters] = useState<number>(0);
  const [projectType, setProjectType] = useState<string>("");
  const [roomType, setRoomType] = useState<string>("");
  const [calculatedMaterials, setCalculatedMaterials] = useState<Material[]>([]);
  const { toast } = useToast();

  const projectTypes = [
    "Nieuwbouw woning",
    "Renovatie badkamer",
    "Renovatie keuken",
    "Dakvernieuwing",
    "Vloervernieuwing",
    "Schilderwerk binnen",
    "Schilderwerk buiten",
    "Isolatie",
    "Uitbreiding woning"
  ];

  const roomTypes = [
    "Woonkamer",
    "Slaapkamer", 
    "Badkamer",
    "Keuken",
    "Hal/gang",
    "Toilet",
    "Zolder",
    "Kelder",
    "Garage"
  ];

  const calculateMaterialsWithAI = async () => {
    if (!squareMeters || !projectType) {
      toast({
        title: "Incomplete gegevens",
        description: "Vul alle vereiste velden in om de berekening uit te voeren.",
        variant: "destructive"
      });
      return;
    }

    setIsCalculating(true);
    
    try {
      // Simulate AI calculation based on common construction standards
      const materials = generateMaterialsBasedOnType(squareMeters, projectType, roomType);
      setCalculatedMaterials(materials);
      
      toast({
        title: "Berekening voltooid!",
        description: `${materials.length} materialen berekend voor ${squareMeters}m²`,
      });
    } catch (error) {
      toast({
        title: "Berekeningsfout",
        description: "Er is een fout opgetreden bij het berekenen van de materialen.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const generateMaterialsBasedOnType = (m2: number, type: string, room: string): Material[] => {
    const materials: Material[] = [];
    
    // Base calculations per project type
    switch (type) {
      case "Renovatie badkamer":
        materials.push(
          {
            id: `ai-${Date.now()}-1`,
            name: "Tegels vloer",
            quantity: Math.ceil(m2 * 1.1), // 10% extra
            unit: "m²",
            category: "Afwerking",
            estimatedCost: 25
          },
          {
            id: `ai-${Date.now()}-2`,
            name: "Tegels wand",
            quantity: Math.ceil(m2 * 2.5), // walls
            unit: "m²",
            category: "Afwerking",
            estimatedCost: 30
          },
          {
            id: `ai-${Date.now()}-3`,
            name: "Tegellijm",
            quantity: Math.ceil(m2 * 0.5),
            unit: "zakken",
            category: "Bevestiging",
            estimatedCost: 15
          },
          {
            id: `ai-${Date.now()}-4`,
            name: "Voegmortel",
            quantity: Math.ceil(m2 * 0.2),
            unit: "zakken",
            category: "Afwerking",
            estimatedCost: 12
          }
        );
        break;

      case "Vloervernieuwing":
        materials.push(
          {
            id: `ai-${Date.now()}-1`,
            name: "Laminaat/PVC",
            quantity: Math.ceil(m2 * 1.1),
            unit: "m²",
            category: "Afwerking",
            estimatedCost: 35
          },
          {
            id: `ai-${Date.now()}-2`,
            name: "Onderlaag",
            quantity: Math.ceil(m2 * 1.05),
            unit: "m²",
            category: "Isolatie",
            estimatedCost: 8
          },
          {
            id: `ai-${Date.now()}-3`,
            name: "Plinten",
            quantity: Math.ceil(Math.sqrt(m2) * 4 * 1.1), // perimeter estimate
            unit: "meter",
            category: "Afwerking",
            estimatedCost: 12
          }
        );
        break;

      case "Schilderwerk binnen":
        const wallArea = m2 * 2.5; // estimate wall area
        materials.push(
          {
            id: `ai-${Date.now()}-1`,
            name: "Muurverf",
            quantity: Math.ceil(wallArea / 10), // 1 liter per 10m²
            unit: "liter",
            category: "Afwerking",
            estimatedCost: 18
          },
          {
            id: `ai-${Date.now()}-2`,
            name: "Primer",
            quantity: Math.ceil(wallArea / 12),
            unit: "liter",
            category: "Afwerking",
            estimatedCost: 22
          },
          {
            id: `ai-${Date.now()}-3`,
            name: "Kwast set",
            quantity: 1,
            unit: "stuks",
            category: "Diversen",
            estimatedCost: 35
          },
          {
            id: `ai-${Date.now()}-4`,
            name: "Roller set",
            quantity: 1,
            unit: "stuks",
            category: "Diversen",
            estimatedCost: 25
          }
        );
        break;

      case "Dakvernieuwing":
        materials.push(
          {
            id: `ai-${Date.now()}-1`,
            name: "Dakpannen",
            quantity: Math.ceil(m2 * 12), // 12 pannen per m²
            unit: "stuks",
            category: "Dakbedekking",
            estimatedCost: 1.2
          },
          {
            id: `ai-${Date.now()}-2`,
            name: "Daklatten",
            quantity: Math.ceil(m2 * 2),
            unit: "meter",
            category: "Hout",
            estimatedCost: 2.5
          },
          {
            id: `ai-${Date.now()}-3`,
            name: "Onderdakfolie",
            quantity: Math.ceil(m2 * 1.1),
            unit: "m²",
            category: "Folie",
            estimatedCost: 4.5
          }
        );
        break;

      default:
        // Generic materials for other project types
        materials.push(
          {
            id: `ai-${Date.now()}-1`,
            name: "Basismateriaal",
            quantity: Math.ceil(m2 * 1.1),
            unit: "m²",
            category: "Diversen",
            estimatedCost: 20
          }
        );
    }

    return materials;
  };

  const handleAddAllMaterials = () => {
    onAddMaterials(calculatedMaterials);
    setCalculatedMaterials([]);
    toast({
      title: "Materialen toegevoegd!",
      description: `${calculatedMaterials.length} materialen zijn toegevoegd aan de lijst.`,
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
          AI Materialen Calculator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Input fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Oppervlakte (m²)</label>
              <Input
                type="number"
                placeholder="Bijv. 25"
                value={squareMeters || ''}
                onChange={(e) => setSquareMeters(parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Project type</label>
              <Select value={projectType} onValueChange={setProjectType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer project type" />
                </SelectTrigger>
                <SelectContent>
                  {projectTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Ruimte type (optioneel)</label>
              <Select value={roomType} onValueChange={setRoomType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer ruimte" />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes.map((room) => (
                    <SelectItem key={room} value={room}>{room}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Calculate button */}
          <Button 
            onClick={calculateMaterialsWithAI} 
            disabled={isCalculating || !squareMeters || !projectType}
            className="w-full md:w-auto"
          >
            {isCalculating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Berekenen...
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4 mr-2" />
                Bereken Materialen
              </>
            )}
          </Button>

          {/* Results */}
          {calculatedMaterials.length > 0 && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Berekende Materialen ({calculatedMaterials.length})</h4>
                <Button onClick={handleAddAllMaterials} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Alle toevoegen
                </Button>
              </div>
              
              <div className="space-y-2">
                {calculatedMaterials.map((material) => (
                  <div key={material.id} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{material.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {material.category}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          {material.quantity} {material.unit} × €{material.estimatedCost?.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          €{((material.estimatedCost || 0) * material.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Totaal geschatte kosten:</span>
                  <span className="text-lg font-bold text-green-700">
                    €{calculatedMaterials.reduce((total, material) => 
                      total + (material.estimatedCost || 0) * material.quantity, 0
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
