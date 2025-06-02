
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Trash2, Upload, Image, Ruler, Wand2 } from "lucide-react";
import { FileUpload } from "./FileUpload";
import { AILayoutGenerator } from "./AILayoutGenerator";
import { projectFileService, ProjectFile } from "@/services/projectFileService";
import { useToast } from "@/hooks/use-toast";

interface ConstructionDrawingsProps {
  projectId: string;
  title: string;
}

export function ConstructionDrawings({ projectId, title }: ConstructionDrawingsProps) {
  const [drawings, setDrawings] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDrawings();
  }, [projectId]);

  const loadDrawings = async () => {
    try {
      setLoading(true);
      const projectFiles = await projectFileService.getProjectFiles(projectId);
      // Filter for construction drawings (images and PDFs)
      const constructionDrawings = projectFiles.filter(file => 
        file.file_type.startsWith('image/') || file.file_type === 'application/pdf'
      );
      setDrawings(constructionDrawings);
    } catch (error) {
      console.error('Error loading drawings:', error);
      toast({
        title: "Fout",
        description: "Kon bouwtekeningen niet laden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDrawingUpload = async (fileBlob: Blob) => {
    try {
      const file = fileBlob as File;
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          await projectFileService.uploadProjectFile(
            projectId,
            `drawing_${file.name}`,
            base64Data,
            file.type,
            file.size
          );
          
          toast({
            title: "Bouwtekening geüpload",
            description: `${file.name} is succesvol toegevoegd`,
          });
          
          loadDrawings();
        } catch (error) {
          console.error('Error uploading drawing:', error);
          toast({
            title: "Upload fout",
            description: "Kon bouwtekening niet uploaden",
            variant: "destructive",
          });
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing drawing:', error);
      toast({
        title: "Bestand fout",
        description: "Kon bouwtekening niet verwerken",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (drawing: ProjectFile) => {
    try {
      const link = document.createElement('a');
      link.href = drawing.file_data;
      link.download = drawing.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading drawing:', error);
      toast({
        title: "Download fout",
        description: "Kon bouwtekening niet downloaden",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (drawingId: string) => {
    try {
      await projectFileService.deleteProjectFile(drawingId);
      toast({
        title: "Bouwtekening verwijderd",
        description: "De bouwtekening is succesvol verwijderd",
      });
      loadDrawings();
    } catch (error) {
      console.error('Error deleting drawing:', error);
      toast({
        title: "Verwijder fout",
        description: "Kon bouwtekening niet verwijderen",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Ruler className="w-5 h-5 mr-2" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Bouwtekeningen laden...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Ruler className="w-5 h-5 mr-2" />
              {title} ({drawings.length})
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAIGenerator(!showAIGenerator)}
              >
                <Wand2 className="w-4 h-4 mr-2" />
                AI Indeling Generator
              </Button>
              <FileUpload 
                onFileUpload={handleDrawingUpload}
                acceptedTypes="image/*,application/pdf"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {drawings.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Ruler className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Geen bouwtekeningen geüpload</p>
              <p className="text-sm mt-1">Upload plattegronden, doorsnedes of andere technische tekeningen</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {drawings.map((drawing) => (
                <div
                  key={drawing.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {drawing.file_type.startsWith('image/') ? (
                    <div className="mb-3">
                      <img
                        src={drawing.file_data}
                        alt={drawing.file_name}
                        className="w-full h-32 object-cover rounded"
                      />
                    </div>
                  ) : (
                    <div className="mb-3 flex items-center justify-center h-32 bg-gray-100 rounded">
                      <FileText className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 truncate">{drawing.file_name}</h4>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{formatFileSize(drawing.file_size)}</span>
                      <Badge variant="outline" className="text-xs">
                        {drawing.file_type.split('/')[1]?.toUpperCase() || 'FILE'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {new Date(drawing.uploaded_at).toLocaleDateString()}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(drawing)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(drawing.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showAIGenerator && (
        <AILayoutGenerator 
          projectId={projectId}
          existingDrawings={drawings}
          onNewLayout={(layoutData) => {
            toast({
              title: "Nieuwe indeling gegenereerd",
              description: "De AI heeft een nieuwe indeling voorgesteld",
            });
            loadDrawings();
          }}
        />
      )}
    </div>
  );
}
