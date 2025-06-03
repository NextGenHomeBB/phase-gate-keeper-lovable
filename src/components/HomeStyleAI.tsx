
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Palette, Upload, Wand2, Download, Trash2, Image as ImageIcon, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HomeStyleAIProps {
  projectId: string;
  title: string;
}

interface StyleResult {
  id: string;
  originalImage: string;
  styledImage: string;
  style: string;
  room: string;
  prompt: string;
  createdAt: string;
}

export function HomeStyleAI({ projectId, title }: HomeStyleAIProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [styleResults, setStyleResults] = useState<StyleResult[]>([]);
  const { toast } = useToast();

  const styleOptions = [
    { value: "modern", label: "Modern" },
    { value: "scandinavian", label: "Scandinavisch" },
    { value: "industrial", label: "Industrieel" },
    { value: "classic", label: "Klassiek" },
    { value: "minimalist", label: "Minimalistisch" },
    { value: "bohemian", label: "Bohemian" },
    { value: "rustic", label: "Rustiek" },
    { value: "contemporary", label: "Eigentijds" },
    { value: "traditional", label: "Traditioneel" },
    { value: "art-deco", label: "Art Deco" }
  ];

  const roomOptions = [
    { value: "living-room", label: "Woonkamer" },
    { value: "bedroom", label: "Slaapkamer" },
    { value: "kitchen", label: "Keuken" },
    { value: "bathroom", label: "Badkamer" },
    { value: "dining-room", label: "Eetkamer" },
    { value: "office", label: "Kantoor" },
    { value: "hallway", label: "Gang" },
    { value: "balcony", label: "Balkon" },
    { value: "garden", label: "Tuin" }
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateStyle = async () => {
    if (!selectedImage || !selectedStyle || !selectedRoom) {
      toast({
        title: "Incomplete gegevens",
        description: "Selecteer een afbeelding, stijl en ruimte type",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate AI processing - in a real implementation, this would call an AI service
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newResult: StyleResult = {
        id: Date.now().toString(),
        originalImage: selectedImage,
        styledImage: selectedImage, // In real implementation, this would be the AI-generated styled image
        style: selectedStyle,
        room: selectedRoom,
        prompt: customPrompt,
        createdAt: new Date().toISOString()
      };

      setStyleResults(prev => [newResult, ...prev]);
      
      toast({
        title: "Styling voltooid",
        description: "Uw ruimte is succesvol gestyled met AI",
      });
    } catch (error) {
      console.error('Error generating style:', error);
      toast({
        title: "Styling fout",
        description: "Kon styling niet genereren",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (result: StyleResult) => {
    const link = document.createElement('a');
    link.href = result.styledImage;
    link.download = `styled-${result.room}-${result.style}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (resultId: string) => {
    setStyleResults(prev => prev.filter(result => result.id !== resultId));
    toast({
      title: "Styling verwijderd",
      description: "Het styling resultaat is verwijderd",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="w-5 h-5 mr-2" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image Upload Section */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Upload ruimte foto</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {selectedImage ? (
                <div className="space-y-4">
                  <img
                    src={selectedImage}
                    alt="Uploaded room"
                    className="max-w-full h-48 object-cover mx-auto rounded-lg"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setSelectedImage(null)}
                  >
                    Andere foto selecteren
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <ImageIcon className="w-12 h-12 mx-auto text-gray-400" />
                  <div>
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <div className="text-sm text-gray-600">
                        Klik om een foto van uw ruimte te uploaden
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        JPG, PNG tot 10MB
                      </div>
                    </Label>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Style Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Interieurstijl</Label>
              <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="Kies een stijl" />
                </SelectTrigger>
                <SelectContent>
                  {styleOptions.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ruimte type</Label>
              <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                <SelectTrigger>
                  <SelectValue placeholder="Kies ruimte type" />
                </SelectTrigger>
                <SelectContent>
                  {roomOptions.map((room) => (
                    <SelectItem key={room.value} value={room.value}>
                      {room.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Custom Prompt */}
          <div className="space-y-2">
            <Label>Aangepaste beschrijving (optioneel)</Label>
            <Textarea
              placeholder="Beschrijf specifieke wensen voor de styling..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={3}
            />
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerateStyle}
            disabled={!selectedImage || !selectedStyle || !selectedRoom || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                AI styling genereren...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Genereer AI styling
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {styleResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              Styling resultaten ({styleResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {styleResults.map((result) => (
                <div key={result.id} className="border rounded-lg p-4 space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-600">Origineel</div>
                    <img
                      src={result.originalImage}
                      alt="Original room"
                      className="w-full h-32 object-cover rounded"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-600">AI Styling</div>
                    <img
                      src={result.styledImage}
                      alt="Styled room"
                      className="w-full h-32 object-cover rounded border-2 border-blue-200"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary">{result.style}</Badge>
                      <Badge variant="outline">{result.room}</Badge>
                    </div>
                    {result.prompt && (
                      <p className="text-xs text-gray-600 line-clamp-2">{result.prompt}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {new Date(result.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(result)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(result.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
