import { supabase } from './supabase';
import { Spec, CreateSpecInput, UpdateSpecInput } from '@/lib/types';

/**
 * Service for managing project specifications (Specs) in Supabase.
 */

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

/**
 * Creates a new specification.
 * @param spec - The specification data to insert.
 */
export const createSpec = async (spec: CreateSpecInput): Promise<Spec> => {
  const { data, error } = await supabase
    .from('specs')
    .insert(spec)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Updates an existing specification.
 * @param id - The ID of the spec to update.
 * @param updates - The fields to update.
 */
export const updateSpec = async (id: string, updates: UpdateSpecInput): Promise<void> => {
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
