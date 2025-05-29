
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Phone, User } from "lucide-react";
import { AddTeamMemberDialog } from "@/components/AddTeamMemberDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

  const handleAddTeamMember = (newMember: Omit<TeamMember, 'id'>) => {
    const memberWithId: TeamMember = {
      ...newMember,
      id: Date.now().toString(),
    };
    onUpdateTeamMembers([...teamMembers, memberWithId]);
    setIsAddDialogOpen(false);
  };

  const handleDeleteTeamMember = (memberId: string) => {
    onUpdateTeamMembers(teamMembers.filter(member => member.id !== memberId));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Team Beheer</h1>
          <p className="text-gray-600 mt-2">
            Beheer je teamleden en hun rollen binnen projecten
          </p>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nieuw Teamlid
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Teamleden ({teamMembers.length})</h2>
          
          {teamMembers.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Geen teamleden</h3>
              <p className="text-gray-500 mb-4">
                Voeg je eerste teamlid toe om te beginnen met samenwerken.
              </p>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Eerste teamlid toevoegen
              </Button>
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
                  <TableHead>Acties</TableHead>
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
                    <TableCell>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteTeamMember(member.id)}
                      >
                        Verwijder
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <AddTeamMemberDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddTeamMember}
      />
    </div>
  );
}
