import { supabase } from '../lib/supabase';

export class SpecService {
  /**
   * Update a spec in the database.
   * This service uses the backend Supabase client.
   */
  async updateSpec(id: string, updates: any): Promise<void> {
    const { error } = await supabase
      .from('specs')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error(`Error updating spec ${id}:`, error);
      throw error;
    }
  }
}

export const specService = new SpecService();
