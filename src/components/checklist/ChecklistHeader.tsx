
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ChecklistHeader() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Terug naar Dashboard
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Eenvoudige Fase Checklist</h1>
        <p className="text-gray-600 mt-2">
          Selecteer een checklist en vink af wat je hebt voltooid!
        </p>
      </div>
    </div>
  );
}
