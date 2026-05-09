import { supabase } from './supabase';
import { ProjectLog } from '@/lib/types';

export const getLogsByProjectId = async (projectId: string): Promise<ProjectLog[]> => {
  const { data, error } = await supabase
    .from('project_log')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const logProjectEvent = async (projectId: string, action: string, details: any, userId: string): Promise<void> => {
  const { error } = await supabase.rpc('log_project_event', {
    p_project_id: projectId,
    p_action: action,
    p_details: typeof details === 'string' ? { message: details } : details,
    p_user_id: userId
  });

  if (error) throw error;
};
