
import { useState, useEffect, useCallback } from 'react';
import { Material } from '@/pages/Index';
import { materialService } from '@/services/materialService';
import { useToast } from '@/hooks/use-toast';

export function useMaterials(projectId: string, phaseId: number) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMaterials = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedMaterials = await materialService.fetchMaterialsForPhase(projectId, phaseId);
      setMaterials(fetchedMaterials);
    } catch (err) {
      console.error('Error fetching materials:', err);
      setError('Failed to load materials');
      toast({
        title: "Error",
        description: "Failed to load materials",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [projectId, phaseId, toast]);

  const addMaterial = useCallback(async (material: Omit<Material, 'id'>) => {
    try {
      const newMaterial = await materialService.addMaterial(projectId, phaseId, material);
      setMaterials(prev => [...prev, newMaterial]);
      toast({
        title: "Success",
        description: "Material added successfully"
      });
      return newMaterial;
    } catch (err) {
      console.error('Error adding material:', err);
      toast({
        title: "Error",
        description: "Failed to add material",
        variant: "destructive"
      });
      throw err;
    }
  }, [projectId, phaseId, toast]);

  const updateMaterial = useCallback(async (materialId: string, updates: Partial<Material>) => {
    try {
      const updatedMaterial = await materialService.updateMaterial(materialId, updates);
      setMaterials(prev => prev.map(material => 
        material.id === materialId ? updatedMaterial : material
      ));
      toast({
        title: "Success",
        description: "Material updated successfully"
      });
      return updatedMaterial;
    } catch (err) {
      console.error('Error updating material:', err);
      toast({
        title: "Error",
        description: "Failed to update material",
        variant: "destructive"
      });
      throw err;
    }
  }, [toast]);

  const deleteMaterial = useCallback(async (materialId: string) => {
    try {
      await materialService.deleteMaterial(materialId);
      setMaterials(prev => prev.filter(material => material.id !== materialId));
      toast({
        title: "Success",
        description: "Material deleted successfully"
      });
    } catch (err) {
      console.error('Error deleting material:', err);
      toast({
        title: "Error",
        description: "Failed to delete material",
        variant: "destructive"
      });
      throw err;
    }
  }, [toast]);

  const addBulkMaterials = useCallback(async (newMaterials: Omit<Material, 'id'>[]) => {
    try {
      const addedMaterials = await materialService.addBulkMaterials(projectId, phaseId, newMaterials);
      setMaterials(prev => [...prev, ...addedMaterials]);
      toast({
        title: "Success",
        description: `${addedMaterials.length} materials added successfully`
      });
      return addedMaterials;
    } catch (err) {
      console.error('Error adding bulk materials:', err);
      toast({
        title: "Error",
        description: "Failed to add materials",
        variant: "destructive"
      });
      throw err;
    }
  }, [projectId, phaseId, toast]);

  // Set up real-time subscription
  useEffect(() => {
    const unsubscribe = materialService.subscribeToMaterialChanges(projectId, (payload) => {
      console.log('Real-time material update:', payload);
      
      if (payload.new?.phase_id === phaseId) {
        switch (payload.eventType) {
          case 'INSERT':
            const newMaterial = materialService.mapDatabaseToMaterial(payload.new);
            setMaterials(prev => {
              const exists = prev.some(m => m.id === newMaterial.id);
              return exists ? prev : [...prev, newMaterial];
            });
            break;
          case 'UPDATE':
            const updatedMaterial = materialService.mapDatabaseToMaterial(payload.new);
            setMaterials(prev => prev.map(material => 
              material.id === updatedMaterial.id ? updatedMaterial : material
            ));
            break;
          case 'DELETE':
            setMaterials(prev => prev.filter(material => material.id !== payload.old.id));
            break;
        }
      }
    });

    return unsubscribe;
  }, [projectId, phaseId]);

  // Initial fetch
  useEffect(() => {
    if (projectId && phaseId) {
      fetchMaterials();
    }
  }, [fetchMaterials]);

  return {
    materials,
    loading,
    error,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    addBulkMaterials,
    refetch: fetchMaterials
  };
}
