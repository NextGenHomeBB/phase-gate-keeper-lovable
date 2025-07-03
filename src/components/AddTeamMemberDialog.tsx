
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
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
  "Contractor",
  "Safety Inspector",
  "Quality Assurance",
  "Site Supervisor",
  "Materials Coordinator"
];

export function AddTeamMemberDialog({ isOpen, onClose, onAdd }: AddTeamMemberDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [customRole, setCustomRole] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && selectedRoles.length > 0) {
      onAdd({
        name: formData.name,
        email: formData.email,
        role: selectedRoles.join(', '), // Legacy field for backward compatibility
        roles: selectedRoles, // New multiple roles field
        phone: formData.phone || undefined,
        startDate: new Date().toISOString().split('T')[0], // Default to today
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
      });
      setSelectedRoles([]);
      setCustomRole('');
      onClose();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRoleToggle = (role: string, checked: boolean) => {
    if (checked) {
      setSelectedRoles(prev => [...prev, role]);
    } else {
      setSelectedRoles(prev => prev.filter(r => r !== role));
    }
  };

  const handleAddCustomRole = () => {
    if (customRole.trim() && !selectedRoles.includes(customRole.trim())) {
      setSelectedRoles(prev => [...prev, customRole.trim()]);
      setCustomRole('');
    }
  };

  const handleRemoveRole = (roleToRemove: string) => {
    setSelectedRoles(prev => prev.filter(role => role !== roleToRemove));
  };

  const isFormValid = () => {
    return formData.name && formData.email && selectedRoles.length > 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nieuw Teamlid Toevoegen</DialogTitle>
          <DialogDescription>
            Voeg een nieuw teamlid toe aan je organisatie. Je kunt meerdere rollen selecteren.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
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
              <Label htmlFor="phone">Telefoon</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+31 6 12345678"
              />
            </div>

            <div className="space-y-3">
              <Label>Rollen * (selecteer één of meerdere)</Label>
              
              {/* Selected roles display */}
              {selectedRoles.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                  {selectedRoles.map((role) => (
                    <Badge 
                      key={role} 
                      variant="secondary" 
                      className="flex items-center gap-1"
                    >
                      {role}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 hover:bg-transparent"
                        onClick={() => handleRemoveRole(role)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Predefined roles */}
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Beschikbare rollen:
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {predefinedRoles.map((role) => (
                    <div key={role} className="flex items-center space-x-2">
                      <Checkbox
                        id={`role-${role}`}
                        checked={selectedRoles.includes(role)}
                        onCheckedChange={(checked) => handleRoleToggle(role, checked as boolean)}
                      />
                      <Label 
                        htmlFor={`role-${role}`} 
                        className="text-sm cursor-pointer flex-1"
                      >
                        {role}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom role input */}
              <div className="space-y-2">
                <Label htmlFor="customRole" className="text-sm">
                  Aangepaste rol toevoegen:
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="customRole"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    placeholder="Voer aangepaste rol in..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomRole();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddCustomRole}
                    disabled={!customRole.trim() || selectedRoles.includes(customRole.trim())}
                  >
                    Toevoegen
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuleren
            </Button>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90"
              disabled={!isFormValid()}
            >
              Teamlid Toevoegen
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
