import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Mail, Phone, User, UserPlus, Shield, UserCog, Edit } from "lucide-react";
import { AddTeamMemberDialog } from "@/components/AddTeamMemberDialog";
import { EditTeamMemberDialog } from "@/components/EditTeamMemberDialog";
import { CreateWorkerDialog } from "@/components/admin/CreateWorkerDialog";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { teamService } from "@/services/teamService";
import { useLanguage } from "@/contexts/LanguageContext";
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
  roles?: string[]; // New field for multiple roles
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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isCreateWorkerDialogOpen, setIsCreateWorkerDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const { toast } = useToast();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { t } = useLanguage();

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
          title: t('common.error'),
          description: t('team.loadError'),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadTeamMembers();
  }, [roleLoading, onUpdateTeamMembers, toast, t]);

  const handleAddTeamMember = async (newMember: Omit<TeamMember, 'id'>) => {
    try {
      const memberWithId = await teamService.addTeamMember(newMember);
      onUpdateTeamMembers([...teamMembers, memberWithId]);
      setIsAddDialogOpen(false);
      toast({
        title: t('team.memberAdded'),
        description: `${newMember.name} ${t('team.memberAddedSuccess')}`,
      });
    } catch (error) {
      console.error('Error adding team member:', error);
      toast({
        title: t('common.error'),
        description: t('team.memberAddError'),
        variant: "destructive",
      });
    }
  };

  const handleEditTeamMember = async (memberId: string, updatedData: Partial<TeamMember>) => {
    try {
      // Update roles in database
      if (updatedData.roles) {
        await teamService.updateTeamMemberRoles(memberId, updatedData.roles);
      }
      
      // Update local state
      const updatedMembers = teamMembers.map(member => 
        member.id === memberId 
          ? { ...member, ...updatedData }
          : member
      );
      onUpdateTeamMembers(updatedMembers);
      
      setIsEditDialogOpen(false);
      setEditingMember(null);
      
      toast({
        title: "Teamlid bijgewerkt",
        description: "De gegevens zijn succesvol opgeslagen.",
      });
    } catch (error) {
      console.error('Error updating team member:', error);
      toast({
        title: t('common.error'),
        description: "Kon teamlid niet bijwerken.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (member: TeamMember) => {
    setEditingMember(member);
    setIsEditDialogOpen(true);
  };

  const handleDeleteTeamMember = async (memberId: string) => {
    try {
      await teamService.deleteTeamMember(memberId);
      onUpdateTeamMembers(teamMembers.filter(member => member.id !== memberId));
      toast({
        title: t('team.memberRemoved'),
        description: t('team.memberRemovedSuccess'),
      });
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast({
        title: t('common.error'),
        description: t('team.memberRemoveError'),
        variant: "destructive",
      });
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: t('common.error'),
        description: t('team.invalidEmail'),
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
        title: t('team.inviteSent'),
        description: `${t('team.inviteSentSuccess')} ${inviteEmail}`,
      });
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: t('common.error'),
        description: t('team.inviteError'),
        variant: "destructive",
      });
    } finally {
      setInviteLoading(false);
    }
  };

  const handleWorkerCreated = async () => {
    // Refresh the team members list after a worker is created
    try {
      setLoading(true);
      const members = await teamService.fetchTeamMembers();
      onUpdateTeamMembers(members);
    } catch (error) {
      console.error('Error refreshing team members:', error);
      toast({
        title: t('common.error'),
        description: t('team.loadError'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (roleLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading.text')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">{t('team.management')}</h1>
          <p className="text-gray-600 mt-2">
            {t('team.description')}
          </p>
          {isAdmin && (
            <div className="flex items-center mt-2 text-sm text-blue-600">
              <Shield className="w-4 h-4 mr-1" />
              {t('team.adminRights')}
            </div>
          )}
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-green-50 hover:bg-green-100 border-green-200">
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t('team.inviteUser')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('team.inviteNew')}</DialogTitle>
                  <DialogDescription>
                    {t('team.inviteDescription')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="inviteEmail">{t('team.emailAddress')}</Label>
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
                      {t('team.cancel')}
                    </Button>
                    <Button 
                      onClick={handleInviteUser}
                      disabled={inviteLoading}
                    >
                      {inviteLoading ? t('team.sending') : t('team.sendInvite')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button 
              onClick={() => setIsCreateWorkerDialogOpen(true)}
              variant="outline"
              className="bg-orange-50 hover:bg-orange-100 border-orange-200"
            >
              <UserCog className="w-4 h-4 mr-2" />
              Create Worker
            </Button>

            <Button 
              onClick={() => {
                if (teamMembers.length > 0) {
                  openEditDialog(teamMembers[0]);
                }
              }}
              variant="outline"
              className="bg-purple-50 hover:bg-purple-100 border-purple-200"
              disabled={teamMembers.length === 0}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Teamleden
            </Button>
            
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('team.newMember')}
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{t('team.members')} ({teamMembers.length})</h2>
            {isAdmin && (
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('team.addMember')}
              </Button>
            )}
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">{t('team.loading')}</p>
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('team.noMembers')}</h3>
              <p className="text-gray-500 mb-4">
                {isAdmin 
                  ? t('team.noMembersAdmin')
                  : t('team.noMembersUser')
                }
              </p>
              {isAdmin && (
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('team.addFirst')}
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('team.name')}</TableHead>
                  <TableHead>{t('team.email')}</TableHead>
                  <TableHead>{t('team.role')}</TableHead>
                  <TableHead>{t('team.phone')}</TableHead>
                  <TableHead>{t('team.startDate')}</TableHead>
                  {isAdmin && <TableHead>{t('team.actions')}</TableHead>}
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
                      <div className="flex flex-wrap gap-1">
                        {member.roles && member.roles.length > 0 ? (
                          member.roles.map((role, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="text-xs bg-primary/10 text-primary border-primary/20"
                            >
                              {role}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            {member.role}
                          </Badge>
                        )}
                      </div>
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
                         <div className="flex gap-2">
                           <Button 
                             variant="outline" 
                             size="sm"
                             onClick={() => openEditDialog(member)}
                             className="hover:bg-purple-50"
                           >
                             <Edit className="w-4 h-4" />
                           </Button>
                           <Button 
                             variant="destructive" 
                             size="sm"
                             onClick={() => handleDeleteTeamMember(member.id)}
                           >
                             {t('team.remove')}
                           </Button>
                         </div>
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
        <>
          <AddTeamMemberDialog
            isOpen={isAddDialogOpen}
            onClose={() => setIsAddDialogOpen(false)}
            onAdd={handleAddTeamMember}
          />

          <EditTeamMemberDialog
            isOpen={isEditDialogOpen}
            onClose={() => {
              setIsEditDialogOpen(false);
              setEditingMember(null);
            }}
            onSave={handleEditTeamMember}
            member={editingMember}
          />
          
          <CreateWorkerDialog
            isOpen={isCreateWorkerDialogOpen}
            onClose={() => setIsCreateWorkerDialogOpen(false)}
            onWorkerCreated={handleWorkerCreated}
          />
        </>
      )}
    </div>
  );
}
