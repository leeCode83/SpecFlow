import { supabase } from './supabase';
import { Spec } from '@/types';

export const getSpecsByProjectId = async (projectId: string): Promise<Spec[]> => {
  const { data, error } = await supabase
    .from('specs')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const getSpecById = async (id: string): Promise<Spec> => {
  const { data, error } = await supabase
    .from('specs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const createSpec = async (spec: Partial<Spec>): Promise<Spec> => {
  const { data, error } = await supabase
    .from('specs')
    .insert(spec)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateSpec = async (id: string, updates: Partial<Spec>): Promise<void> => {
  const { error } = await supabase
    .from('specs')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
};

export const deleteSpec = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('specs')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
