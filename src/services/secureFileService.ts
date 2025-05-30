
import { supabase } from '@/integrations/supabase/client';
import { fileUploadSchema, sanitizeInput } from '@/lib/validationSchemas';

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

const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const secureFileService = {
  async uploadProjectFile(
    projectId: string,
    fileName: string,
    fileData: string,
    fileType: string,
    fileSize: number
  ): Promise<ProjectFile> {
    // Validate inputs
    const validatedFile = fileUploadSchema.parse({
      fileName,
      fileType,
      fileSize
    });

    // Validate project ID
    if (!projectId || typeof projectId !== 'string') {
      throw new Error('Invalid project ID');
    }

    // Check file type allowlist
    if (!ALLOWED_FILE_TYPES.includes(validatedFile.fileType)) {
      throw new Error(`File type ${validatedFile.fileType} is not allowed`);
    }

    // Check file size
    if (validatedFile.fileSize > MAX_FILE_SIZE) {
      throw new Error('File size exceeds maximum allowed size');
    }

    // Validate file data (should be base64)
    if (!fileData || typeof fileData !== 'string' || !fileData.startsWith('data:')) {
      throw new Error('Invalid file data format');
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    // Sanitize inputs
    const sanitizedData = {
      project_id: projectId,
      file_name: sanitizeInput(validatedFile.fileName),
      file_data: fileData, // Base64 data doesn't need sanitization
      file_type: validatedFile.fileType,
      file_size: validatedFile.fileSize,
      uploaded_by: user.id
    };
    
    const { data, error } = await supabase
      .from('project_files')
      .insert(sanitizedData)
      .select()
      .single();

    if (error) {
      console.error('Error uploading project file:', error);
      throw error;
    }

    return data;
  },

  async getProjectFiles(projectId: string): Promise<ProjectFile[]> {
    // Validate project ID
    if (!projectId || typeof projectId !== 'string') {
      throw new Error('Invalid project ID');
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    const { data, error } = await supabase
      .from('project_files')
      .select('*')
      .eq('project_id', projectId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error fetching project files:', error);
      throw error;
    }

    return (data || []).map(file => ({
      ...file,
      file_name: sanitizeInput(file.file_name)
    }));
  },

  async deleteProjectFile(fileId: string): Promise<void> {
    // Validate file ID
    if (!fileId || typeof fileId !== 'string') {
      throw new Error('Invalid file ID');
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    const { error } = await supabase
      .from('project_files')
      .delete()
      .eq('id', fileId);

    if (error) {
      console.error('Error deleting project file:', error);
      throw error;
    }
  },

  validateFileBeforeUpload(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: 'File size exceeds 10MB limit' };
    }

    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return { valid: false, error: `File type ${file.type} is not allowed` };
    }

    // Check file name
    const fileNameRegex = /^[a-zA-Z0-9\s\-_.()]+$/;
    if (!fileNameRegex.test(file.name)) {
      return { valid: false, error: 'File name contains invalid characters' };
    }

    return { valid: true };
  }
};
