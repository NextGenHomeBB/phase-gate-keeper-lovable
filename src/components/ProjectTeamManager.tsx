
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, X, Users, Phone, Calendar, Mail, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { TeamMember } from "@/components/TeamPage";
import { projectService } from "@/services/projectService";
import { teamService } from "@/services/teamService";
import { format } from "date-fns";

interface ProjectTeamManagerProps {
  projectId: string;
  onTeamMembersChange: () => void;
  autoSelectMemberId?: string;
}

export function ProjectTeamManager({ projectId, onTeamMembersChange, autoSelectMemberId }: ProjectTeamManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMemberInfo, setSelectedMemberInfo] = useState<TeamMember | null>(null);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [allTeamMembers, setAllTeamMembers] = useState<TeamMember[]>([]);
  const [projectTeamMembers, setProjectTeamMembers] = useState<TeamMember[]>([]);
  const [selectedTeamMemberId, setSelectedTeamMemberId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [projectId]);

  // Calculate available team members
  const availableTeamMembers = allTeamMembers.filter(
    member => !projectTeamMembers.some(pm => pm.id === member.id)
  );

  // Auto-select team member when autoSelectMemberId is provided
  useEffect(() => {
    if (autoSelectMemberId && allTeamMembers.length > 0) {
      const memberExists = availableTeamMembers.some(member => member.id === autoSelectMemberId);
      if (memberExists) {
        console.log('Auto-selecting team member:', autoSelectMemberId);
        setSelectedTeamMemberId(autoSelectMemberId);
        setIsOpen(true); // Open the dialog to show the selection
      }
    }
  }, [autoSelectMemberId, allTeamMembers, projectTeamMembers]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allMembers, projectMembers] = await Promise.all([
        teamService.fetchTeamMembers(),
        projectService.fetchProjectTeamMembers(projectId)
      ]);
      
      setAllTeamMembers(allMembers);
      setProjectTeamMembers(projectMembers);
    } catch (error) {
      console.error('Error loading team data:', error);
      toast({
        title: "Fout",
        description: "Kon teamgegevens niet laden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeamMember = async () => {
    if (!selectedTeamMemberId) return;

    try {
      await projectService.addTeamMemberToProject(projectId, selectedTeamMemberId);
      await loadData();
      onTeamMembersChange();
      setSelectedTeamMemberId("");
      
      const addedMember = allTeamMembers.find(m => m.id === selectedTeamMemberId);
      toast({
        title: "Teamlid toegevoegd",
        description: `${addedMember?.name} is toegevoegd aan het project`,
      });
    } catch (error) {
      console.error('Error adding team member to project:', error);
      toast({
        title: "Fout",
        description: "Kon teamlid niet toevoegen aan project",
        variant: "destructive",
      });
    }
  };

  const handleRemoveTeamMember = async (teamMemberId: string) => {
    try {
      await projectService.removeTeamMemberFromProject(projectId, teamMemberId);
      await loadData();
      onTeamMembersChange();
      
      const removedMember = projectTeamMembers.find(m => m.id === teamMemberId);
      toast({
        title: "Teamlid verwijderd",
        description: `${removedMember?.name} is verwijderd van het project`,
      });
    } catch (error) {
      console.error('Error removing team member from project:', error);
      toast({
        title: "Fout",
        description: "Kon teamlid niet verwijderen van project",
        variant: "destructive",
      });
    }
  };

  const handleMemberClick = (member: TeamMember) => {
    setSelectedMemberInfo(member);
    setIsInfoDialogOpen(true);
  };


  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="mb-4">
            <Users className="w-4 h-4 mr-2" />
            Beheer Teamleden ({projectTeamMembers.length})
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Project Teamleden Beheren</DialogTitle>
            <DialogDescription>
              Voeg teamleden toe aan dit project of verwijder ze
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Add new team member */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Teamlid toevoegen</h3>
              <div className="flex gap-2">
                <Select value={selectedTeamMemberId} onValueChange={setSelectedTeamMemberId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecteer een teamlid" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTeamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} - {member.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleAddTeamMember}
                  disabled={!selectedTeamMemberId || loading}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Toevoegen
                </Button>
              </div>
            </div>

            {/* Current project team members */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Huidige projectteamleden</h3>
              {projectTeamMembers.length === 0 ? (
                <p className="text-sm text-gray-500">Geen teamleden toegewezen aan dit project</p>
              ) : (
                <div className="space-y-2">
                  {projectTeamMembers.map((member) => (
                    <div 
                      key={member.id} 
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleMemberClick(member)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-gray-600">{member.email}</p>
                        </div>
                        <Badge variant="outline">{member.role}</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveTeamMember(member.id);
                        }}
                        disabled={loading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Team Member Information Dialog */}
      <Dialog open={isInfoDialogOpen} onOpenChange={setIsInfoDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Teamlid Informatie
            </DialogTitle>
          </DialogHeader>
          
          {selectedMemberInfo && (
            <div className="space-y-6">
              {/* Profile Section */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-blue-600">
                    {selectedMemberInfo.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedMemberInfo.name}</h3>
                  <Badge variant="secondary" className="mt-1">
                    {selectedMemberInfo.role}
                  </Badge>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">Contact Informatie</h4>
                
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedMemberInfo.email}</p>
                  </div>
                </div>

                {selectedMemberInfo.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Telefoon</p>
                      <p className="font-medium">{selectedMemberInfo.phone}</p>
                    </div>
                  </div>
                )}

                {selectedMemberInfo.startDate && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Startdatum</p>
                      <p className="font-medium">
                        {format(new Date(selectedMemberInfo.startDate), "dd MMMM yyyy")}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsInfoDialogOpen(false)}
                >
                  Sluiten
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleRemoveTeamMember(selectedMemberInfo.id);
                    setIsInfoDialogOpen(false);
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Verwijderen
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
