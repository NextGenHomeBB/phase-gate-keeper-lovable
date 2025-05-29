
import { supabase } from '@/integrations/supabase/client';

export interface ProjectFile {
  id: string;
  project_id: string;
  file_name: string;
  file_data: string;
  file_type: string;
  file_size: number;
  uploaded_by: string | null;
  uploaded_at: string;
  updated_at: string;
}

export const projectFileService = {
  async uploadProjectFile(
    projectId: string,
    fileName: string,
    fileData: string,
    fileType: string,
    fileSize: number
  ): Promise<ProjectFile> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('project_files')
      .insert({
        project_id: projectId,
        file_name: fileName,
        file_data: fileData,
        file_type: fileType,
        file_size: fileSize,
        uploaded_by: user?.id || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error uploading project file:', error);
      throw error;
    }

    return data;
  },

  async getProjectFiles(projectId: string): Promise<ProjectFile[]> {
    const { data, error } = await supabase
      .from('project_files')
      .select('*')
      .eq('project_id', projectId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error fetching project files:', error);
      throw error;
    }

    return data || [];
  },

  async deleteProjectFile(fileId: string): Promise<void> {
    const { error } = await supabase
      .from('project_files')
      .delete()
      .eq('id', fileId);

    if (error) {
      console.error('Error deleting project file:', error);
      throw error;
    }
  }
};
