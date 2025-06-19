
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Lock } from "lucide-react";
import { Phase } from "@/pages/Index";
import { useLanguage } from "@/contexts/LanguageContext";

interface PhaseHeaderProps {
  phase: Phase;
  progress: number;
  onPhaseCompletionToggle: (phaseId: number, completed: boolean) => void;
  onPhaseLockToggle: (phaseId: number, locked: boolean) => void;
}

export function PhaseHeader({ 
  phase, 
  progress, 
  onPhaseCompletionToggle, 
  onPhaseLockToggle 
}: PhaseHeaderProps) {
  const { t } = useLanguage();

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-b">
        <CardTitle className="text-2xl font-bold flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-gray-800">{phase.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onPhaseCompletionToggle(phase.id, !phase.completed)}
              className="hover:scale-105 transition-transform"
            >
              {phase.completed ? (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  {t('projectDetail.markIncomplete')}
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {t('projectDetail.markComplete')}
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onPhaseLockToggle(phase.id, !phase.locked)}
              className="hover:scale-105 transition-transform"
            >
              {phase.locked ? (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  {t('projectDetail.unlockPhase')}
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  {t('projectDetail.lockPhase')}
                </>
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <p className="text-gray-700 text-base leading-relaxed">{phase.description}</p>
        
        {/* Progress Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium">Progress</span>
            <span className="font-bold text-blue-600">{progress.toFixed(0)}%</span>
          </div>
          <div className="relative">
            <Progress value={progress} className="h-2.5" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{phase.checklist.filter(item => item.completed).length} completed</span>
              <span>{phase.checklist.length} total</span>
            </div>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex items-center gap-2">
          {phase.completed ? (
            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Completed
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
              <Clock className="w-3 h-3 mr-1" />
              Active
            </Badge>
          )}
          {phase.locked && (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              <Lock className="w-3 h-3 mr-1" />
              Locked
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
