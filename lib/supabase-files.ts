import { supabase } from './supabase';
import { ProjectFile } from '@/types';

export const getFilesByProjectId = async (projectId: string): Promise<ProjectFile[]> => {
  const { data, error } = await supabase
    .from('project_files')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createProjectFile = async (file: Partial<ProjectFile>): Promise<ProjectFile> => {
  const { data, error } = await supabase
    .from('project_files')
    .insert(file)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteProjectFile = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('project_files')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
