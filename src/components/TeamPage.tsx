import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Phone, User, UserPlus, Shield } from "lucide-react";
import { AddTeamMemberDialog } from "@/components/AddTeamMemberDialog";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { teamService } from "@/services/teamService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  startDate: string;
  avatar?: string;
}

interface TeamPageProps {
  teamMembers: TeamMember[];
  onUpdateTeamMembers: (members: TeamMember[]) => void;
}

export function TeamPage({ teamMembers, onUpdateTeamMembers }: TeamPageProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const { toast } = useToast();
  const { isAdmin, loading: roleLoading } = useUserRole();

  // Load team members from database on component mount
  useEffect(() => {
    async function loadTeamMembers() {
      if (roleLoading) return;
      
      try {
        setLoading(true);
        const members = await teamService.fetchTeamMembers();
        onUpdateTeamMembers(members);
      } catch (error) {
        console.error('Error loading team members:', error);
        toast({
          title: "Fout",
          description: "Kon teamleden niet laden",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadTeamMembers();
  }, [roleLoading, onUpdateTeamMembers, toast]);

  const handleAddTeamMember = async (newMember: Omit<TeamMember, 'id'>) => {
    try {
      const memberWithId = await teamService.addTeamMember(newMember);
      onUpdateTeamMembers([...teamMembers, memberWithId]);
      setIsAddDialogOpen(false);
      toast({
        title: "Teamlid toegevoegd",
        description: `${newMember.name} is succesvol toegevoegd aan het team`,
      });
    } catch (error) {
      console.error('Error adding team member:', error);
      toast({
        title: "Fout",
        description: "Kon teamlid niet toevoegen",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTeamMember = async (memberId: string) => {
    try {
      await teamService.deleteTeamMember(memberId);
      onUpdateTeamMembers(teamMembers.filter(member => member.id !== memberId));
      toast({
        title: "Teamlid verwijderd",
        description: "Het teamlid is succesvol verwijderd",
      });
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast({
        title: "Fout",
        description: "Kon teamlid niet verwijderen",
        variant: "destructive",
      });
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Fout",
        description: "Vul een geldig email adres in",
        variant: "destructive",
      });
      return;
    }

    try {
      setInviteLoading(true);
      await teamService.inviteUserToRegister(inviteEmail);
      setIsInviteDialogOpen(false);
      setInviteEmail('');
      toast({
        title: "Uitnodiging verzonden",
        description: `Een uitnodiging is verzonden naar ${inviteEmail}`,
      });
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Fout",
        description: "Kon uitnodiging niet verzenden",
        variant: "destructive",
      });
    } finally {
      setInviteLoading(false);
    }
  };

  if (roleLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Team Beheer</h1>
          <p className="text-gray-600 mt-2">
            Beheer je teamleden en hun rollen binnen projecten
          </p>
          {isAdmin && (
            <div className="flex items-center mt-2 text-sm text-blue-600">
              <Shield className="w-4 h-4 mr-1" />
              Administrator rechten actief
            </div>
          )}
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-green-50 hover:bg-green-100 border-green-200">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Gebruiker Uitnodigen
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nieuwe gebruiker uitnodigen</DialogTitle>
                  <DialogDescription>
                    Stuur een uitnodiging om een nieuw account aan te maken
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="inviteEmail">Email adres</Label>
                    <Input
                      id="inviteEmail"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="gebruiker@example.com"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsInviteDialogOpen(false)}
                    >
                      Annuleren
                    </Button>
                    <Button 
                      onClick={handleInviteUser}
                      disabled={inviteLoading}
                    >
                      {inviteLoading ? 'Verzenden...' : 'Uitnodiging Versturen'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nieuw Teamlid
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Teamleden ({teamMembers.length})</h2>
            {isAdmin && (
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Teamlid Toevoegen
              </Button>
            )}
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Teamleden laden...</p>
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Geen teamleden</h3>
              <p className="text-gray-500 mb-4">
                {isAdmin 
                  ? "Voeg je eerste teamlid toe om te beginnen met samenwerken."
                  : "Er zijn nog geen teamleden toegevoegd."
                }
              </p>
              {isAdmin && (
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Eerste teamlid toevoegen
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Naam</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Telefoon</TableHead>
                  <TableHead>Startdatum</TableHead>
                  {isAdmin && <TableHead>Acties</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span>{member.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{member.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {member.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      {member.phone ? (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{member.phone}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(member.startDate).toLocaleDateString('nl-NL')}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteTeamMember(member.id)}
                        >
                          Verwijder
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {isAdmin && (
        <AddTeamMemberDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onAdd={handleAddTeamMember}
        />
      )}
    </div>
  );
}
