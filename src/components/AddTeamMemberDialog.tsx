
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TeamMember } from "@/components/TeamPage";

interface AddTeamMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (member: Omit<TeamMember, 'id'>) => void;
}

export function AddTeamMemberDialog({ isOpen, onClose, onAdd }: AddTeamMemberDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    phone: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.role) {
      onAdd({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        phone: formData.phone || undefined,
        startDate: new Date().toISOString().split('T')[0], // Default to today
      });
      setFormData({
        name: '',
        email: '',
        role: '',
        phone: '',
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nieuw Teamlid Toevoegen</DialogTitle>
          <DialogDescription>
            Voeg een nieuw teamlid toe aan je organisatie.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="name">Naam *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Volledige naam"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="email@bedrijf.nl"
                required
              />
            </div>
            <div>
              <Label htmlFor="role">Rol *</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                placeholder="Project Manager, Developer, Designer..."
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefoon</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+31 6 12345678"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuleren
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!formData.name || !formData.email || !formData.role}
            >
              Toevoegen
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
