import { supabase } from './supabase';
import { ProjectLog } from '@/lib/types';

export interface PaginatedLogs {
  data: ProjectLog[];
  count: number;
}

export const getAllRecentLogs = async (page: number = 1, limit: number = 10): Promise<PaginatedLogs> => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('project_log')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { data: data || [], count: count || 0 };
};

export const getLogsByProjectId = async (projectId: string, page: number = 1, limit: number = 10): Promise<PaginatedLogs> => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('project_log')
    .select('*', { count: 'exact' })
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { data: data || [], count: count || 0 };
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
