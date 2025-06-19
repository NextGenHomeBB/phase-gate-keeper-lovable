import { supabase } from '@/integrations/supabase/client';
import { Material } from '@/pages/Index';

export interface DatabaseMaterial {
  id: string;
  project_id: string;
  phase_id: number;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  estimated_cost: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  checklist_item_id: string | null;
}

export const materialService = {
  async fetchMaterialsForPhase(projectId: string, phaseId: number): Promise<Material[]> {
    const { data, error } = await supabase
      .from('project_materials')
      .select('*')
      .eq('project_id', projectId)
      .eq('phase_id', phaseId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching materials:', error);
      throw error;
    }

    return (data || []).map(this.mapDatabaseToMaterial);
  },

  async fetchMaterialsForChecklistItem(projectId: string, phaseId: number, checklistItemId: string): Promise<Material[]> {
    const { data, error } = await supabase
      .from('project_materials')
      .select('*')
      .eq('project_id', projectId)
      .eq('phase_id', phaseId)
      .eq('checklist_item_id', checklistItemId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching checklist item materials:', error);
      throw error;
    }

    return (data || []).map(this.mapDatabaseToMaterial);
  },

  async fetchAllMaterialsForProject(projectId: string): Promise<{ [phaseId: number]: Material[] }> {
    const { data, error } = await supabase
      .from('project_materials')
      .select('*')
      .eq('project_id', projectId)
      .order('phase_id', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching project materials:', error);
      throw error;
    }

    const materialsByPhase: { [phaseId: number]: Material[] } = {};
    
    (data || []).forEach(material => {
      const phaseId = material.phase_id;
      if (!materialsByPhase[phaseId]) {
        materialsByPhase[phaseId] = [];
      }
      materialsByPhase[phaseId].push(this.mapDatabaseToMaterial(material));
    });

    return materialsByPhase;
  },

  async addMaterial(projectId: string, phaseId: number, material: Omit<Material, 'id'>, checklistItemId?: string): Promise<Material> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('project_materials')
      .insert({
        project_id: projectId,
        phase_id: phaseId,
        name: material.name,
        quantity: material.quantity,
        unit: material.unit,
        category: material.category,
        estimated_cost: material.estimatedCost || 0,
        created_by: user?.id || null,
        checklist_item_id: checklistItemId || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding material:', error);
      throw error;
    }

    return this.mapDatabaseToMaterial(data);
  },

  async addMaterialsForChecklistItem(projectId: string, phaseId: number, checklistItemId: string, materials: Omit<Material, 'id'>[]): Promise<Material[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const insertData = materials.map(material => ({
      project_id: projectId,
      phase_id: phaseId,
      name: material.name,
      quantity: material.quantity,
      unit: material.unit,
      category: material.category,
      estimated_cost: material.estimatedCost || 0,
      created_by: user?.id || null,
      checklist_item_id: checklistItemId
    }));

    const { data, error } = await supabase
      .from('project_materials')
      .insert(insertData)
      .select();

    if (error) {
      console.error('Error adding checklist item materials:', error);
      throw error;
    }

    return (data || []).map(this.mapDatabaseToMaterial);
  },

  async updateMaterial(materialId: string, updates: Partial<Material>): Promise<Material> {
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
    if (updates.unit !== undefined) updateData.unit = updates.unit;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.estimatedCost !== undefined) updateData.estimated_cost = updates.estimatedCost;

    const { data, error } = await supabase
      .from('project_materials')
      .update(updateData)
      .eq('id', materialId)
      .select()
      .single();

    if (error) {
      console.error('Error updating material:', error);
      throw error;
    }

    return this.mapDatabaseToMaterial(data);
  },

  async deleteMaterial(materialId: string): Promise<void> {
    const { error } = await supabase
      .from('project_materials')
      .delete()
      .eq('id', materialId);

    if (error) {
      console.error('Error deleting material:', error);
      throw error;
    }
  },

  async addBulkMaterials(projectId: string, phaseId: number, materials: Omit<Material, 'id'>[]): Promise<Material[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const insertData = materials.map(material => ({
      project_id: projectId,
      phase_id: phaseId,
      name: material.name,
      quantity: material.quantity,
      unit: material.unit,
      category: material.category,
      estimated_cost: material.estimatedCost || 0,
      created_by: user?.id || null
    }));

    const { data, error } = await supabase
      .from('project_materials')
      .insert(insertData)
      .select();

    if (error) {
      console.error('Error adding bulk materials:', error);
      throw error;
    }

    return (data || []).map(this.mapDatabaseToMaterial);
  },

  mapDatabaseToMaterial(dbMaterial: DatabaseMaterial): Material {
    return {
      id: dbMaterial.id,
      name: dbMaterial.name,
      quantity: dbMaterial.quantity,
      unit: dbMaterial.unit,
      category: dbMaterial.category,
      estimatedCost: dbMaterial.estimated_cost || 0
    };
  },

  subscribeToMaterialChanges(projectId: string, callback: (payload: any) => void) {
    const channel = supabase
      .channel(`project_materials_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_materials',
          filter: `project_id=eq.${projectId}`
        },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
