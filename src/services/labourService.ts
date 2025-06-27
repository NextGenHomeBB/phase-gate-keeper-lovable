
import { supabase } from "@/integrations/supabase/client";
import { Labour } from "@/pages/Index";

export interface DatabaseLabour {
  id: string;
  project_id: string;
  phase_id: number;
  task: string;
  hours: number;
  hourly_rate: number;
  cost_per_job: number;
  bill_per_hour: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const labourService = {
  async fetchLabourForPhase(projectId: string, phaseId: number): Promise<Labour[]> {
    const { data, error } = await supabase
      .from('project_labour')
      .select('*')
      .eq('project_id', projectId)
      .eq('phase_id', phaseId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching labour:', error);
      throw error;
    }

    return (data || []).map(item => ({
      id: item.id,
      task: item.task,
      hours: item.hours || 0,
      hourlyRate: item.hourly_rate || 0,
      costPerJob: item.cost_per_job || 0,
      billPerHour: item.bill_per_hour
    }));
  },

  async fetchAllLabourForProject(projectId: string): Promise<{ [phaseId: number]: Labour[] }> {
    const { data, error } = await supabase
      .from('project_labour')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all labour:', error);
      throw error;
    }

    const labourByPhase: { [phaseId: number]: Labour[] } = {};
    
    (data || []).forEach(item => {
      if (!labourByPhase[item.phase_id]) {
        labourByPhase[item.phase_id] = [];
      }
      
      labourByPhase[item.phase_id].push({
        id: item.id,
        task: item.task,
        hours: item.hours || 0,
        hourlyRate: item.hourly_rate || 0,
        costPerJob: item.cost_per_job || 0,
        billPerHour: item.bill_per_hour
      });
    });

    return labourByPhase;
  },

  async addLabour(projectId: string, phaseId: number, labour: Omit<Labour, 'id'>): Promise<Labour> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('project_labour')
      .insert({
        project_id: projectId,
        phase_id: phaseId,
        task: labour.task,
        hours: labour.hours,
        hourly_rate: labour.hourlyRate,
        cost_per_job: labour.costPerJob,
        bill_per_hour: labour.billPerHour,
        created_by: user?.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding labour:', error);
      throw error;
    }

    return {
      id: data.id,
      task: data.task,
      hours: data.hours || 0,
      hourlyRate: data.hourly_rate || 0,
      costPerJob: data.cost_per_job || 0,
      billPerHour: data.bill_per_hour
    };
  },

  async updateLabour(labourId: string, updates: Partial<Omit<Labour, 'id'>>): Promise<void> {
    const updateData: any = {};
    
    if (updates.task !== undefined) updateData.task = updates.task;
    if (updates.hours !== undefined) updateData.hours = updates.hours;
    if (updates.hourlyRate !== undefined) updateData.hourly_rate = updates.hourlyRate;
    if (updates.costPerJob !== undefined) updateData.cost_per_job = updates.costPerJob;
    if (updates.billPerHour !== undefined) updateData.bill_per_hour = updates.billPerHour;

    const { error } = await supabase
      .from('project_labour')
      .update(updateData)
      .eq('id', labourId);

    if (error) {
      console.error('Error updating labour:', error);
      throw error;
    }
  },

  async deleteLabour(labourId: string): Promise<void> {
    const { error } = await supabase
      .from('project_labour')
      .delete()
      .eq('id', labourId);

    if (error) {
      console.error('Error deleting labour:', error);
      throw error;
    }
  },

  subscribeToLabourChanges(projectId: string, callback: (payload: any) => void) {
    const channel = supabase
      .channel('labour-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_labour',
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
