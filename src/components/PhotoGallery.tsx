import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Image as ImageIcon, Plus, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { CameraCapture } from "@/components/CameraCapture";
import { ImageUpload } from "@/components/ImageUpload";
import { FileUpload } from "@/components/FileUpload";
import { supabase } from "@/integrations/supabase/client";

interface Photo {
  id: string;
  photo_url: string;
  photo_data?: string;
  caption?: string;
  phase_id?: number;
  checklist_item_id?: string;
  created_at: string;
}

interface PhotoGalleryProps {
  projectId: string;
  phaseId?: number;
  title: string;
  className?: string;
}

export function PhotoGallery({ projectId, phaseId, title, className }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    loadPhotos();
  }, [projectId, phaseId]);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('project_photos')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (phaseId !== undefined) {
        query = query.eq('phase_id', phaseId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading photos:', error);
        throw error;
      }

      setPhotos(data || []);
    } catch (error) {
      console.error('Error loading photos:', error);
      toast({
        title: "Fout",
        description: "Kon foto's niet laden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addPhoto = async (photoBlob: Blob, captionText?: string) => {
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = reader.result as string;
        
        const { data, error } = await supabase
          .from('project_photos')
          .insert({
            project_id: projectId,
            phase_id: phaseId || null,
            photo_url: base64String,
            photo_data: base64String,
            caption: captionText || caption || null,
          })
          .select()
          .single();

        if (error) {
          console.error('Error adding photo:', error);
          throw error;
        }

        setPhotos([data, ...photos]);
        setCaption("");
        setIsAddDialogOpen(false);
        
        toast({
          title: "Foto toegevoegd",
          description: "De foto is succesvol toegevoegd aan de galerij",
        });
      };
      reader.readAsDataURL(photoBlob);
    } catch (error) {
      console.error('Error adding photo:', error);
      toast({
        title: "Fout",
        description: "Kon foto niet toevoegen",
        variant: "destructive",
      });
    }
  };

  const removePhoto = async (photoId: string) => {
    try {
      const { error } = await supabase
        .from('project_photos')
        .delete()
        .eq('id', photoId);

      if (error) {
        console.error('Error removing photo:', error);
        throw error;
      }

      setPhotos(photos.filter(p => p.id !== photoId));
      setSelectedPhoto(null);
      
      toast({
        title: "Foto verwijderd",
        description: "De foto is succesvol verwijderd",
      });
    } catch (error) {
      console.error('Error removing photo:', error);
      toast({
        title: "Fout",
        description: "Kon foto niet verwijderen",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    
    for (const file of files) {
      // Check if it's an image or PDF
      const isImage = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf';
      
      if (!isImage && !isPdf) {
        toast({
          title: "Bestandstype niet ondersteund",
          description: `${file.name} is geen afbeelding of PDF bestand`,
          variant: "destructive",
        });
        continue;
      }

      // Check file size (max 10MB for PDFs, 5MB for images)
      const maxSize = isPdf ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: "Bestand te groot",
          description: `${file.name} is groter dan ${isPdf ? '10MB' : '5MB'}`,
          variant: "destructive",
        });
        continue;
      }

      await addPhoto(file, file.name);
    }
  }, [addPhoto]);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <ImageIcon className="w-5 h-5 mr-2" />
            {title}
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Foto toevoegen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Foto toevoegen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="caption">Bijschrift (optioneel)</Label>
                  <Input
                    id="caption"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Voer een bijschrift in..."
                  />
                </div>
                <div className="flex justify-center gap-2">
                  <CameraCapture
                    onCapture={(blob) => addPhoto(blob, caption)}
                  />
                  <ImageUpload
                    onImageUpload={(blob) => addPhoto(blob, caption)}
                  />
                  <FileUpload
                    onFileUpload={(blob) => addPhoto(blob, caption)}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative ${isDragOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''}`}
      >
        {isDragOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-90 z-10 border-2 border-blue-300 border-dashed rounded">
            <div className="text-center">
              <Upload className="w-12 h-12 mx-auto mb-2 text-blue-500" />
              <p className="text-blue-700 font-medium">Sleep bestanden hier om te uploaden</p>
              <p className="text-blue-600 text-sm">Ondersteunt afbeeldingen en PDF bestanden</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center text-gray-500 py-16">
            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Nog geen foto's toegevoegd</p>
            <p className="text-sm mt-2">Sleep bestanden hierheen of gebruik de knoppen hierboven</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group cursor-pointer">
                <img
                  src={photo.photo_url}
                  alt={photo.caption || "Project foto"}
                  className="w-full h-24 object-cover rounded border hover:opacity-75 transition-opacity"
                  onClick={() => setSelectedPhoto(photo)}
                />
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b">
                    {photo.caption}
                  </div>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePhoto(photo.id);
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Photo viewer dialog */}
        {selectedPhoto && (
          <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{selectedPhoto.caption || "Project Foto"}</DialogTitle>
              </DialogHeader>
              <div className="flex justify-center">
                <img
                  src={selectedPhoto.photo_url}
                  alt={selectedPhoto.caption || "Project foto"}
                  className="max-w-full max-h-[70vh] object-contain rounded"
                />
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>
                  Toegevoegd: {new Date(selectedPhoto.created_at).toLocaleDateString('nl-NL')}
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removePhoto(selectedPhoto.id)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Verwijderen
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}
