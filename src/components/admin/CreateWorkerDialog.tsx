
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Generate a temporary password
      const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
      
      // Create the user account
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        user_metadata: {
          full_name: fullName
        },
        email_confirm: false
      });

      if (authError) {
        console.error('Auth error:', authError);
        toast({
          title: "Error",
          description: authError.message,
          variant: "destructive",
        });
        return;
      }

      if (!authData.user) {
        toast({
          title: "Error",
          description: "Failed to create user",
          variant: "destructive",
        });
        return;
      }

      // Add worker role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'worker'
        });

      if (roleError) {
        console.error('Role error:', roleError);
        toast({
          title: "Error",
          description: "Failed to assign worker role",
          variant: "destructive",
        });
        return;
      }

      // Update profile with must_reset_password flag
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          must_reset_password: true
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error('Profile error:', profileError);
      }

      // Add to team members if needed
      if (phone || roleTitle) {
        const { error: teamError } = await supabase
          .from('team_members')
          .insert({
            user_id: authData.user.id,
            name: fullName,
            email: email,
            phone: phone || null,
            role_title: roleTitle || null
          });

        if (teamError) {
          console.error('Team member error:', teamError);
        }
      }

      // Log the user creation
      const { error: logError } = await supabase
        .from('created_users_log')
        .insert({
          admin_id: user.id,
          email: email
        });

      if (logError) {
        console.error('Log error:', logError);
      }

      toast({
        title: "Success",
        description: `Worker ${fullName} created successfully. Temporary password: ${tempPassword}`,
      });

      // Reset form
      setEmail('');
      setFullName('');
      setPhone('');
      setRoleTitle('');
      onWorkerCreated();
      onClose();

    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
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
