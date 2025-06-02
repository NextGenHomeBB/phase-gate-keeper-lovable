
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Wand2, Upload, Lightbulb, Home } from "lucide-react";
import { ProjectFile } from "@/services/projectFileService";
import { useToast } from "@/hooks/use-toast";

interface AILayoutGeneratorProps {
  projectId: string;
  existingDrawings: ProjectFile[];
  onNewLayout: (layoutData: any) => void;
}

export function AILayoutGenerator({ projectId, existingDrawings, onNewLayout }: AILayoutGeneratorProps) {
  const [selectedDrawing, setSelectedDrawing] = useState<string>("");
  const [roomType, setRoomType] = useState<string>("");
  const [requirements, setRequirements] = useState("");
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const roomTypes = [
    { value: "woonkamer", label: "Woonkamer" },
    { value: "keuken", label: "Keuken" },
    { value: "slaapkamer", label: "Slaapkamer" },
    { value: "badkamer", label: "Badkamer" },
    { value: "kantoor", label: "Kantoor" },
    { value: "berging", label: "Berging" },
    { value: "garage", label: "Garage" },
    { value: "zolder", label: "Zolder" },
    { value: "kelder", label: "Kelder" },
    { value: "bijkeuken", label: "Bijkeuken" },
  ];

  const predefinedRequirements = [
    "Meer natuurlijk licht",
    "Open keuken verbinden met woonkamer",
    "Extra slaapkamer creëren",
    "Betere doorstroom tussen ruimtes",
    "Meer opbergruimte",
    "Badkamer vergroten",
    "Thuiswerkplek inrichten",
    "Kindvriendelijke indeling",
    "Toegankelijkheid verbeteren",
    "Energiezuinige indeling"
  ];

  const handleGenerateLayout = async () => {
    if (!selectedDrawing || !roomType) {
      toast({
        title: "Ontbrekende informatie",
        description: "Selecteer een bouwtekening en kamer type",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    
    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In a real implementation, this would call an AI service
      const layoutSuggestions = {
        originalDrawing: selectedDrawing,
        roomType: roomType,
        requirements: requirements,
        suggestions: [
          {
            title: "Optie 1: Open Concept",
            description: "Muur tussen keuken en woonkamer wegbreken voor meer ruimte en licht",
            benefits: ["Meer ruimte", "Betere sociale interactie", "Meer natuurlijk licht"],
            considerations: ["Ventilatie keukengeuren", "Geluidsisolatie"]
          },
          {
            title: "Optie 2: Functionele Scheiding",
            description: "Gedeeltelijke scheiding behouden met een kookeiland als natuurlijke verdeling",
            benefits: ["Behoud van privacy", "Duidelijke functiescheiding", "Extra werkblad"],
            considerations: ["Minder open gevoel", "Meer meubilair nodig"]
          },
          {
            title: "Optie 3: Flexibele Ruimte",
            description: "Schuifwanden installeren voor aanpasbare ruimte-indeling",
            benefits: ["Flexibiliteit", "Moderne uitstraling", "Geluidsisolatie mogelijk"],
            considerations: ["Hogere kosten", "Technische complexiteit"]
          }
        ]
      };

      onNewLayout(layoutSuggestions);
      
      toast({
        title: "AI indeling gegenereerd!",
        description: "Bekijk de voorgestelde indelingsopties hieronder",
      });

    } catch (error) {
      console.error('Error generating layout:', error);
      toast({
        title: "Generatie fout",
        description: "Kon geen nieuwe indeling genereren",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const addRequirement = (requirement: string) => {
    if (requirements) {
      setRequirements(requirements + ", " + requirement);
    } else {
      setRequirements(requirement);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wand2 className="w-5 h-5 mr-2" />
          AI Indeling Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Selecteer bestaande bouwtekening
          </label>
          <Select value={selectedDrawing} onValueChange={setSelectedDrawing}>
            <SelectTrigger>
              <SelectValue placeholder="Kies een bouwtekening..." />
            </SelectTrigger>
            <SelectContent>
              {existingDrawings.map((drawing) => (
                <SelectItem key={drawing.id} value={drawing.id}>
                  {drawing.file_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Type ruimte
          </label>
          <Select value={roomType} onValueChange={setRoomType}>
            <SelectTrigger>
              <SelectValue placeholder="Selecteer ruimte type..." />
            </SelectTrigger>
            <SelectContent>
              {roomTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center">
                    <Home className="w-4 h-4 mr-2" />
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Specifieke wensen en eisen
          </label>
          <Textarea
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="Beschrijf uw wensen voor de nieuwe indeling..."
            className="min-h-[100px]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            <Lightbulb className="w-4 h-4 inline mr-1" />
            Snelle suggesties
          </label>
          <div className="flex flex-wrap gap-2">
            {predefinedRequirements.map((req, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-blue-50"
                onClick={() => addRequirement(req)}
              >
                {req}
              </Badge>
            ))}
          </div>
        </div>

        <Button
          onClick={handleGenerateLayout}
          disabled={generating || !selectedDrawing || !roomType}
          className="w-full"
        >
          {generating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              AI genereert indeling...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Genereer nieuwe indeling
            </>
          )}
        </Button>

        {generating && (
          <div className="text-center py-4">
            <div className="text-sm text-gray-600">
              De AI analyseert uw bouwtekening en genereert voorstellen...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
