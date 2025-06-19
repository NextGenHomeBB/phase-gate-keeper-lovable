
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Calculator, Lightbulb, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Material } from "@/pages/Index";

interface AIMaterialsCalculatorProps {
  onAddMaterials: (materials: Material[]) => Promise<void>;
}

const AIMaterialsCalculator = ({ onAddMaterials }: AIMaterialsCalculatorProps) => {
  const [projectDescription, setProjectDescription] = useState("");
  const [roomDimensions, setRoomDimensions] = useState("");
  const [additionalRequirements, setAdditionalRequirements] = useState("");
  const [suggestions, setSuggestions] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateSuggestions = async () => {
    if (!projectDescription.trim()) {
      toast({
        title: "Fout",
        description: "Voeg een projectbeschrijving toe",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const mockSuggestions: Material[] = [
        {
          id: "ai-1",
          name: "Cement",
          quantity: 25,
          unit: "zakken",
          category: "Bouwmaterialen",
          estimatedCost: 12.50
        },
        {
          id: "ai-2",
          name: "Baksteen rood",
          quantity: 2000,
          unit: "stuks",
          category: "Metselwerk",
          estimatedCost: 0.35
        },
        {
          id: "ai-3",
          name: "Glaswol isolatie",
          quantity: 50,
          unit: "m²",
          category: "Isolatie",
          estimatedCost: 8.75
        },
        {
          id: "ai-4",
          name: "Dakpannen beton",
          quantity: 150,
          unit: "stuks",
          category: "Dakbedekking",
          estimatedCost: 2.20
        },
        {
          id: "ai-5",
          name: "Houten balken behandeld",
          quantity: 20,
          unit: "stuks",
          category: "Houtwerk",
          estimatedCost: 25.00
        }
      ];
      
      setSuggestions(mockSuggestions);
      setIsLoading(false);
      
      toast({
        title: "Succes",
        description: "AI suggesties gegenereerd!",
      });
    }, 2000);
  };

  const handleAddAllMaterials = async () => {
    if (suggestions.length === 0) return;
    
    try {
      await onAddMaterials(suggestions);
      setSuggestions([]);
      toast({
        title: "Succes",
        description: `${suggestions.length} materialen toegevoegd!`,
      });
    } catch (error) {
      console.error('Failed to add AI materials:', error);
      toast({
        title: "Fout",
        description: "Kon materialen niet toevoegen",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            AI Materialen Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="description">Projectbeschrijving</Label>
            <Textarea
              id="description"
              placeholder="Beschrijf je bouwproject in detail..."
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="dimensions">Afmetingen (optioneel)</Label>
            <Input
              id="dimensions"
              placeholder="bijv. 10m x 8m x 3m hoog"
              value={roomDimensions}
              onChange={(e) => setRoomDimensions(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="requirements">Aanvullende eisen</Label>
            <Textarea
              id="requirements"
              placeholder="Specifieke materiaalwensen, budget, tijdslijn..."
              value={additionalRequirements}
              onChange={(e) => setAdditionalRequirements(e.target.value)}
              rows={2}
            />
          </div>
          
          <Button 
            onClick={generateSuggestions}
            disabled={isLoading}
            className="w-full"
          >
            <Calculator className="w-4 h-4 mr-2" />
            {isLoading ? "Genereren..." : "Genereer AI Suggesties"}
          </Button>
        </CardContent>
      </Card>

      {suggestions.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              AI Materiaal Suggesties
            </CardTitle>
            <Button onClick={handleAddAllMaterials} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Voeg alle toe
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suggestions.map((material) => (
                <div key={material.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{material.name}</div>
                    <div className="text-sm text-gray-600">
                      {material.quantity} {material.unit} • €{material.estimatedCost?.toFixed(2)} per {material.unit}
                    </div>
                    <div className="text-xs text-gray-500">{material.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      €{((material.estimatedCost || 0) * material.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center font-medium">
                <span>Totaal geschatte kosten:</span>
                <span>€{suggestions.reduce((total, material) => total + (material.estimatedCost || 0) * material.quantity, 0).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIMaterialsCalculator;
