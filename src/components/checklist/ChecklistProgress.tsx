
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface ChecklistProgressProps {
  completedCount: number;
  totalCount: number;
}

export function ChecklistProgress({ completedCount, totalCount }: ChecklistProgressProps) {
  const getProgress = () => {
    return (completedCount / totalCount) * 100;
  };

  return (
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
  );
}
