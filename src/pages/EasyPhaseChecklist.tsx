
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";

interface ChecklistItem {
  id: string;
  description: string;
  completed: boolean;
}

const EasyPhaseChecklist = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: "1", description: "Projectdoelstellingen vaststellen", completed: false },
    { id: "2", description: "Team samenstellen", completed: false },
    { id: "3", description: "Budget goedkeuring verkrijgen", completed: false },
    { id: "4", description: "Tijdlijn opstellen", completed: false },
    { id: "5", description: "Stakeholders identificeren", completed: false },
    { id: "6", description: "Risico's in kaart brengen", completed: false },
    { id: "7", description: "Communicatieplan opstellen", completed: false },
    { id: "8", description: "Eerste milestone definiëren", completed: false },
  ]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

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
              Een simpele checklist om je project op te starten. Vink af wat je hebt voltooid!
            </p>
          </div>

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
              <CardTitle>Project Start Checklist</CardTitle>
              <CardDescription>
                Doorloop deze stappen om je project succesvol op te starten
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
                      {item.description}
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
