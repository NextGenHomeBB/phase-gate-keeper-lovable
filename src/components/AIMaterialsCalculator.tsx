
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Calculator, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AIMaterialsCalculator = () => {
  const [projectDescription, setProjectDescription] = useState("");
  const [roomDimensions, setRoomDimensions] = useState("");
  const [additionalRequirements, setAdditionalRequirements] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
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
      const mockSuggestions = [
        "Cement: 25 zakken (25kg per zak) voor fundering en vloer",
        "Baksteen: 2000 stuks rood metselwerk",
        "Isolatiemateriaal: 50m² glaswol isolatie (10cm dik)",
        "Dakpannen: 150 stuks betonnen dakpannen",
        "Houten balken: 20 stuks 2x8 inch behandeld hout",
        "Gipsplaten: 30 stuks 120x250cm voor binnenwanden",
        "Elektrische bekabeling: 200m NYM-kabel 3x2.5mm²",
        "Sanitair: Basis toilet, wasbak en douche set"
      ];
      
      setSuggestions(mockSuggestions);
      setIsLoading(false);
      
      toast({
        title: "Succes",
        description: "AI suggesties gegenereerd!",
      });
    }, 2000);
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              AI Materiaal Suggesties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-sm">{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIMaterialsCalculator;
