
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { ChecklistSelector } from "@/components/checklist/ChecklistSelector";

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

  const getProgress = () => {
    const completedItems = checklist.filter(item => item.completed).length;
    return (completedItems / checklist.length) * 100;
  };

  const completedCount = checklist.filter(item => item.completed).length;
  const totalCount = checklist.length;

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Terug naar Dashboard
          </Button>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Eenvoudige Fase Checklist</h1>
            <p className="text-gray-600 mt-2">
              Selecteer een checklist en vink af wat je hebt voltooid!
            </p>
          </div>

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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Voortgang</span>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-lg font-semibold">{completedCount}/{totalCount}</span>
                </div>
              </CardTitle>
              <CardDescription>
                Je hebt {completedCount} van de {totalCount} taken voltooid
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${getProgress()}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {Math.round(getProgress())}% voltooid
              </p>
            </CardContent>
          </Card>

          {/* Checklist */}
          <Card>
            <CardHeader>
              <CardTitle>{selectedChecklist?.title || "Checklist"}</CardTitle>
              <CardDescription>
                {selectedChecklist?.description || "Doorloop deze stappen om je project succesvol op te starten"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {checklist.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={(checked) => 
                        updateChecklistItem(item.id, checked as boolean)
                      }
                    />
                    <span 
                      className={`flex-1 ${
                        item.completed 
                          ? 'line-through text-gray-500' 
                          : 'text-gray-900'
                      }`}
                    >
                      {item.text}
                    </span>
                    {item.completed && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                ))}
              </div>

              {completedCount === totalCount && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <h3 className="font-semibold text-green-800">Gefeliciteerd!</h3>
                      <p className="text-green-700">
                        Je hebt alle taken voltooid. Je project is klaar om te starten!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EasyPhaseChecklist;
