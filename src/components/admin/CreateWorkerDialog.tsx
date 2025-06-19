
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
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
        
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      // Success case - handle both new and existing workers
      if (data && data.success) {
        // Different toast messages based on whether it's a new user or existing
        const isNewUser = data.tempPassword;
        const isUpdated = data.message && data.message.includes('updated');
        
        let toastTitle = "Success";
        let toastDescription = data.message;
        
        if (isNewUser) {
          toastTitle = "Worker Created";
          toastDescription = `${data.message}. Temporary password: ${data.tempPassword}`;
        } else if (isUpdated) {
          toastTitle = "Worker Updated";
          toastDescription = data.message;
        } else {
          toastTitle = "Worker Added";
          toastDescription = data.message;
        }

        toast({
          title: toastTitle,
          description: toastDescription,
        });

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

  const handleClose = () => {
    if (!loading) {
      // Reset form when closing
      setEmail('');
      setFullName('');
      setPhone('');
      setRoleTitle('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="roleTitle">Role Title</Label>
            <Input
              id="roleTitle"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="e.g., Construction Worker, Electrician"
              disabled={loading}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'Create Worker'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
