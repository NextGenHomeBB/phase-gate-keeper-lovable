
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Lock } from "lucide-react";
import { Phase } from "@/pages/Index";
import { useLanguage } from "@/contexts/LanguageContext";
import { PhaseBadge, PhaseStatus } from "./PhaseBadge";

interface PhaseHeaderProps {
  phase: Phase;
  progress: number;
  onPhaseCompletionToggle: (phaseId: number, completed: boolean) => void;
  onPhaseLockToggle: (phaseId: number, locked: boolean) => void;
}

// Helper function to determine phase status based on existing Phase properties
function getPhaseStatus(phase: Phase): PhaseStatus {
  if (phase.completed) return "done";
  if (phase.locked) return "queued";
  // Check if phase has any special indicators (you can customize this logic)
  const hasSpecialTasks = phase.checklist.some(item => item.description.toLowerCase().includes('special') || item.description.toLowerCase().includes('help'));
  if (hasSpecialTasks) return "special";
  return "active";
}

export function PhaseHeader({ 
  phase, 
  progress, 
  onPhaseCompletionToggle, 
  onPhaseLockToggle 
}: PhaseHeaderProps) {
  const { t } = useLanguage();
  const phaseStatus = getPhaseStatus(phase);

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

        {/* Status Badge - Updated to use new PhaseBadge */}
        <div className="flex items-center gap-2">
          <PhaseBadge status={phaseStatus} size="md" />
          {phase.locked && (
            <div className="ml-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-orange-50 text-orange-700 border-orange-200">
              <Lock className="w-3 h-3 mr-1" />
              Locked
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
