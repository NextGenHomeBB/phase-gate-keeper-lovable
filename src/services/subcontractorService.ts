
import { supabase } from "@/integrations/supabase/client";

export interface Subcontractor {
  id: string;
  name: string;
  trade_specialty: string;
  phone?: string;
  email?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const subcontractorService = {
  async fetchSubcontractors(): Promise<Subcontractor[]> {
    const { data, error } = await supabase
      .from('sub_contractors')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching subcontractors:', error);
      throw error;
    }

    return data || [];
  },

  async searchSubcontractors(query: string): Promise<Subcontractor[]> {
    const { data, error } = await supabase
      .from('sub_contractors')
      .select('*')
      .or(`name.ilike.%${query}%,trade_specialty.ilike.%${query}%`)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error searching subcontractors:', error);
      throw error;
    }

    return data || [];
  },

  async addSubcontractor(subcontractor: Omit<Subcontractor, 'id' | 'created_at' | 'updated_at'>): Promise<Subcontractor> {
    const { data, error } = await supabase
      .from('sub_contractors')
      .insert(subcontractor)
      .select()
      .single();

    if (error) {
      console.error('Error adding subcontractor:', error);
      throw error;
    }

    return data;
  },

  async updateSubcontractor(id: string, updates: Partial<Omit<Subcontractor, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
    const { error } = await supabase
      .from('sub_contractors')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating subcontractor:', error);
      throw error;
    }
  },

  async deleteSubcontractor(id: string): Promise<void> {
    const { error } = await supabase
      .from('sub_contractors')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting subcontractor:', error);
      throw error;
    }
  }
};
