
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProjectDetail } from "@/components/ProjectDetail";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { projectService } from "@/services/projectService";
import { Project } from "@/pages/Index";

const ProjectPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProject() {
      if (!projectId) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const fetchedProject = await projectService.getProject(projectId);
        setProject(fetchedProject);
      } catch (error) {
        console.error('Error loading project:', error);
        toast({
          title: t('common.error'),
          description: t('project.loadError'),
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [projectId, navigate, toast, t]);

  const handleUpdateProject = async (updatedProject: Project) => {
    try {
      await projectService.updateProject(updatedProject);
      setProject(updatedProject);
      toast({
        title: t('project.updated'),
        description: t('project.updateSuccess'),
      });
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: t('common.error'),
        description: t('project.updateError'),
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading.text')}</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project niet gevonden</h1>
          <p className="text-gray-600 mb-4">Het opgevraagde project kon niet worden geladen.</p>
          <button
            onClick={handleBack}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Terug naar dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <ProjectDetail
          project={project}
          onUpdateProject={handleUpdateProject}
          onBack={handleBack}
        />
      </div>
    </div>
  );
};

export default ProjectPage;
