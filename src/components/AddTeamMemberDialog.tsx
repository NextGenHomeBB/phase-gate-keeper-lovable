
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TeamMember } from "@/components/TeamPage";

interface AddTeamMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (member: Omit<TeamMember, 'id'>) => void;
}

const predefinedRoles = [
  "Project Manager",
  "Developer", 
  "Designer",
  "Loodgieter",
  "Electrician",
  "Architect",
  "Engineer",
  "Contractor"
];

export function AddTeamMemberDialog({ isOpen, onClose, onAdd }: AddTeamMemberDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    phone: '',
  });
  const [customRole, setCustomRole] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalRole = formData.role === 'custom' ? customRole : formData.role;
    if (formData.name && formData.email && finalRole) {
      onAdd({
        name: formData.name,
        email: formData.email,
        role: finalRole,
        phone: formData.phone || undefined,
        startDate: new Date().toISOString().split('T')[0], // Default to today
      });
      setFormData({
        name: '',
        email: '',
        role: '',
        phone: '',
      });
      setCustomRole('');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'role' && value !== 'custom') {
      setCustomRole('');
    }
  };

  const isFormValid = () => {
    const finalRole = formData.role === 'custom' ? customRole : formData.role;
    return formData.name && formData.email && finalRole;
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
              <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer een rol" />
                </SelectTrigger>
                <SelectContent>
                  {predefinedRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Aangepaste rol...</SelectItem>
                </SelectContent>
              </Select>
              {formData.role === 'custom' && (
                <Input
                  className="mt-2"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="Voer aangepaste rol in..."
                />
              )}
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
              disabled={!isFormValid()}
            >
              Toevoegen
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
