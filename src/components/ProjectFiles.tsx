
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Trash2, Upload, File, Image } from "lucide-react";
import { FileUpload } from "./FileUpload";
import { projectFileService, ProjectFile } from "@/services/projectFileService";
import { useToast } from "@/hooks/use-toast";

interface ProjectFilesProps {
  projectId: string;
  title: string;
}

export function ProjectFiles({ projectId, title }: ProjectFilesProps) {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadFiles();
  }, [projectId]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const projectFiles = await projectFileService.getProjectFiles(projectId);
      setFiles(projectFiles);
    } catch (error) {
      console.error('Error loading files:', error);
      toast({
        title: "Fout",
        description: "Kon bestanden niet laden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (fileBlob: Blob) => {
    try {
      const file = fileBlob as File;
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          await projectFileService.uploadProjectFile(
            projectId,
            file.name,
            base64Data,
            file.type,
            file.size
          );
          
          toast({
            title: "Bestand geüpload",
            description: `${file.name} is succesvol toegevoegd`,
          });
          
          loadFiles();
        } catch (error) {
          console.error('Error uploading file:', error);
          toast({
            title: "Upload fout",
            description: "Kon bestand niet uploaden",
            variant: "destructive",
          });
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Bestand fout",
        description: "Kon bestand niet verwerken",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (file: ProjectFile) => {
    try {
      const link = document.createElement('a');
      link.href = file.file_data;
      link.download = file.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Download fout",
        description: "Kon bestand niet downloaden",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      await projectFileService.deleteProjectFile(fileId);
      toast({
        title: "Bestand verwijderd",
        description: "Het bestand is succesvol verwijderd",
      });
      loadFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Verwijder fout",
        description: "Kon bestand niet verwijderen",
        variant: "destructive",
      });
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="w-5 h-5" />;
    }
    return <File className="w-5 h-5" />;
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
            <FileText className="w-5 h-5 mr-2" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Bestanden laden...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            {title} ({files.length})
          </CardTitle>
          <FileUpload onFileUpload={handleFileUpload} />
        </div>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Geen bestanden geüpload</p>
            <p className="text-sm mt-1">Upload documenten, bouwtekeningen of andere projectbestanden</p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.file_type)}
                  <div>
                    <h4 className="font-medium text-gray-900">{file.file_name}</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{formatFileSize(file.file_size)}</span>
                      <Badge variant="outline" className="text-xs">
                        {file.file_type.split('/')[1]?.toUpperCase() || 'FILE'}
                      </Badge>
                      <span>•</span>
                      <span>{new Date(file.uploaded_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(file)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(file.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
