import { useState, useEffect } from "react";
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
import { X, Edit } from "lucide-react";
import { TeamMember } from "@/components/TeamPage";

interface EditTeamMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memberId: string, updatedData: Partial<TeamMember>) => void;
  member: TeamMember | null;
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

export function EditTeamMemberDialog({ isOpen, onClose, onSave, member }: EditTeamMemberDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [customRole, setCustomRole] = useState('');

  // Initialize form data when member changes
  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        email: member.email,
        phone: member.phone || '',
      });
      setSelectedRoles(member.roles || [member.role]);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
      });
      setSelectedRoles([]);
    }
    setCustomRole('');
  }, [member]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (member && formData.name && formData.email && selectedRoles.length > 0) {
      onSave(member.id, {
        name: formData.name,
        email: formData.email,
        role: selectedRoles.join(', '), // Legacy field for backward compatibility
        roles: selectedRoles, // New multiple roles field
        phone: formData.phone || undefined,
      });
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

  if (!member) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Teamlid Bewerken
          </DialogTitle>
          <DialogDescription>
            Bewerk de gegevens en rollen van {member.name}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="edit-name">Naam *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Volledige naam"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="email@bedrijf.nl"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="edit-phone">Telefoon</Label>
              <Input
                id="edit-phone"
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
                        id={`edit-role-${role}`}
                        checked={selectedRoles.includes(role)}
                        onCheckedChange={(checked) => handleRoleToggle(role, checked as boolean)}
                      />
                      <Label 
                        htmlFor={`edit-role-${role}`} 
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
                <Label htmlFor="edit-customRole" className="text-sm">
                  Aangepaste rol toevoegen:
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-customRole"
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
              Wijzigingen Opslaan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}