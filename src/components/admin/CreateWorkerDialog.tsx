
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CreateWorkerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkerCreated: () => void;
}

export function CreateWorkerDialog({ isOpen, onClose, onWorkerCreated }: CreateWorkerDialogProps) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Error",
          description: "Not authenticated",
          variant: "destructive",
        });
        return;
      }

      console.log('Creating worker with data:', { email, fullName, phone, roleTitle });

      // Call the edge function to create the worker
      const { data, error } = await supabase.functions.invoke('create-worker', {
        body: {
          email,
          fullName,
          phone,
          roleTitle
        }
      });

      console.log('Function response:', { data, error });

      // Handle function invocation error (network/system errors)
      if (error) {
        console.error('Function invocation error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to create worker",
          variant: "destructive",
        });
        return;
      }

      // Handle application errors returned by the function
      if (data && data.error) {
        console.error('Application error:', data.error);
        
        // Show specific error message from the function
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      // Success case
      if (data && data.success) {
        if (data.tempPassword) {
          toast({
            title: "Success",
            description: `${data.message}. Temporary password: ${data.tempPassword}`,
          });
        } else {
          toast({
            title: "Success",
            description: data.message,
          });
        }

        // Reset form
        setEmail('');
        setFullName('');
        setPhone('');
        setRoleTitle('');
        onWorkerCreated();
        onClose();
      } else {
        // Fallback for unexpected response format
        console.error('Unexpected response format:', data);
        toast({
          title: "Error",
          description: "Unexpected response from server",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating the worker",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Worker</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="roleTitle">Role Title</Label>
            <Input
              id="roleTitle"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="e.g., Construction Worker, Electrician"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Worker'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
