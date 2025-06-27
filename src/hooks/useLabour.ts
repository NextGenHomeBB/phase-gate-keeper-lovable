
import { useState, useEffect } from 'react';
import { Labour } from '@/pages/Index';
import { labourService } from '@/services/labourService';
import { useToast } from '@/hooks/use-toast';

export function useLabour(projectId: string, phaseId: number) {
  const [labour, setLabour] = useState<Labour[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLabour = async () => {
      try {
        setLoading(true);
        const data = await labourService.fetchLabourForPhase(projectId, phaseId);
        setLabour(data);
      } catch (error) {
        console.error('Error fetching labour:', error);
        toast({
          title: "Fout",
          description: "Kon arbeidskosten niet laden",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (projectId && phaseId) {
      fetchLabour();
    }
  }, [projectId, phaseId, toast]);

  // Set up real-time subscription
  useEffect(() => {
    const unsubscribe = labourService.subscribeToLabourChanges(projectId, () => {
      // Refresh labour when changes occur
      const refreshLabour = async () => {
        try {
          const data = await labourService.fetchLabourForPhase(projectId, phaseId);
          setLabour(data);
        } catch (error) {
          console.error('Error refreshing labour:', error);
        }
      };

      refreshLabour();
    });

    return unsubscribe;
  }, [projectId, phaseId]);

  const addLabour = async (newLabour: Omit<Labour, 'id'>) => {
    try {
      const addedLabour = await labourService.addLabour(projectId, phaseId, newLabour);
      setLabour(prev => [addedLabour, ...prev]);
      return addedLabour;
    } catch (error) {
      console.error('Error adding labour:', error);
      toast({
        title: "Fout",
        description: "Kon arbeidskosten niet toevoegen",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateLabour = async (labourId: string, updates: Partial<Omit<Labour, 'id'>>) => {
    try {
      await labourService.updateLabour(labourId, updates);
      setLabour(prev => prev.map(l => l.id === labourId ? { ...l, ...updates } : l));
    } catch (error) {
      console.error('Error updating labour:', error);
      toast({
        title: "Fout",
        description: "Kon arbeidskosten niet bijwerken",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteLabour = async (labourId: string) => {
    try {
      await labourService.deleteLabour(labourId);
      setLabour(prev => prev.filter(l => l.id !== labourId));
    } catch (error) {
      console.error('Error deleting labour:', error);
      toast({
        title: "Fout",
        description: "Kon arbeidskosten niet verwijderen",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    labour,
    loading,
    addLabour,
    updateLabour,
    deleteLabour
  };
}
