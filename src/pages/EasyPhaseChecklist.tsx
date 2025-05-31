
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { ChecklistSelector } from "@/components/checklist/ChecklistSelector";
import { ChecklistProgress } from "@/components/checklist/ChecklistProgress";
import { ChecklistItemsList } from "@/components/checklist/ChecklistItemsList";
import { ChecklistHeader } from "@/components/checklist/ChecklistHeader";

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  notes?: string;
}

interface Checklist {
  id: string;
  title: string;
  description: string;
  items: ChecklistItem[];
}

const EasyPhaseChecklist = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  
  // Sample saved checklists - in a real app, these would come from a database
  const [savedChecklists] = useState<Checklist[]>([
    {
      id: "default",
      title: "Standaard Project Start",
      description: "Basis checklist voor project opstart",
      items: [
        { id: "1", text: "Projectdoelstellingen vaststellen", completed: false },
        { id: "2", text: "Team samenstellen", completed: false },
        { id: "3", text: "Budget goedkeuring verkrijgen", completed: false },
        { id: "4", text: "Tijdlijn opstellen", completed: false },
        { id: "5", text: "Stakeholders identificeren", completed: false },
        { id: "6", text: "Risico's in kaart brengen", completed: false },
        { id: "7", text: "Communicatieplan opstellen", completed: false },
        { id: "8", text: "Eerste milestone definiëren", completed: false },
      ]
    },
    {
      id: "safety",
      title: "Veiligheids Checklist",
      description: "Veiligheidsprotocollen en controles",
      items: [
        { id: "s1", text: "Veiligheidsplan opstellen", completed: false },
        { id: "s2", text: "Persoonlijke beschermingsmiddelen controleren", completed: false },
        { id: "s3", text: "Noodprocedures bespreken", completed: false },
        { id: "s4", text: "Werkplekbeveiliging inrichten", completed: false },
        { id: "s5", text: "Veiligheidstraining plannen", completed: false },
      ]
    },
    {
      id: "quality",
      title: "Kwaliteitscontrole",
      description: "Kwaliteitsnormen en controles",
      items: [
        { id: "q1", text: "Kwaliteitsnormen definiëren", completed: false },
        { id: "q2", text: "Controlepunten opstellen", completed: false },
        { id: "q3", text: "Testprocedures voorbereiden", completed: false },
        { id: "q4", text: "Documentatie reviewen", completed: false },
      ]
    }
  ]);

  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(savedChecklists[0]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(savedChecklists[0].items);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Update checklist when selection changes
  useEffect(() => {
    if (selectedChecklist) {
      setChecklist(selectedChecklist.items);
    }
  }, [selectedChecklist]);

  const handleSelectChecklist = (checklist: Checklist) => {
    setSelectedChecklist(checklist);
  };

  const updateChecklistItem = (itemId: string, completed: boolean) => {
    setChecklist(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, completed } : item
      )
    );

    if (completed) {
      toast({
        title: "Taak voltooid!",
        description: "Goed gedaan! Je hebt een taak afgerond.",
      });
    }
  };

  const updateItemText = (itemId: string, text: string) => {
    setChecklist(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, text } : item
      )
    );
  };

  const completedCount = checklist.filter(item => item.completed).length;
  const totalCount = checklist.length;

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <ChecklistHeader />

        {/* Main Content */}
        <div className="space-y-6">
          {/* Checklist Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Checklist Selecteren</CardTitle>
              <CardDescription>
                Kies uit je opgeslagen checklists
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChecklistSelector
                checklists={savedChecklists}
                selectedChecklist={selectedChecklist}
                onSelectChecklist={handleSelectChecklist}
              />
            </CardContent>
          </Card>

          {/* Progress Card */}
          <ChecklistProgress 
            completedCount={completedCount} 
            totalCount={totalCount} 
          />

          {/* Checklist */}
          <ChecklistItemsList
            selectedChecklist={selectedChecklist}
            checklist={checklist}
            onUpdateChecklistItem={updateChecklistItem}
            onUpdateItemText={updateItemText}
          />
        </div>
      </div>
    </div>
  );
};

export default EasyPhaseChecklist;
