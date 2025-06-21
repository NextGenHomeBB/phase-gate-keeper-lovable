
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phase } from "@/pages/Index";
import { PhaseBadge, PhaseStatus } from "./PhaseBadge";
import { Pencil, Trash2, Package, CheckCircle, Clock } from "lucide-react";

interface KanbanCardProps {
  phase: Phase;
  phaseIcon: React.ComponentType<any>;
  onPhaseClick: (phase: Phase) => void;
  onEditPhaseName: (phase: Phase) => void;
  onDeletePhase: (phaseId: number) => void;
  getPhaseProgress: (phase: Phase) => number;
  getPhaseStatus: (phase: Phase) => PhaseStatus;
}

export function KanbanCard({
  phase,
  phaseIcon: PhaseIcon,
  onPhaseClick,
  onEditPhaseName,
  onDeletePhase,
  getPhaseProgress,
  getPhaseStatus,
}: KanbanCardProps) {
  const progress = getPhaseProgress(phase);
  const phaseStatus = getPhaseStatus(phase);

  const getProgressColor = (progress: number) => {
    if (progress === 100) return "text-green-600";
    if (progress >= 75) return "text-blue-600";
    if (progress >= 50) return "text-yellow-600";
    if (progress >= 25) return "text-orange-600";
    return "text-red-500";
  };

  return (
    <Card 
      className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 transform shadow-md bg-white border-gray-200 mb-3" 
      onClick={() => onPhaseClick(phase)}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gray-100">
              <PhaseIcon className="w-4 h-4 text-gray-700" />
            </div>
            <span className="text-gray-800 leading-tight truncate">{phase.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onEditPhaseName(phase);
              }}
            >
              <Pencil className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-red-100 text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onDeletePhase(phase.id);
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed">{phase.description}</p>
        
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 font-medium">Progress</span>
            <span className={`font-bold ${getProgressColor(progress)}`}>{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
          <div className="flex justify-between text-xs text-gray-400">
            <span>{phase.checklist.filter(item => item.completed).length} done</span>
            <span>{phase.checklist.length} total</span>
          </div>
        </div>

        {/* Status and Materials */}
        <div className="flex items-center justify-between">
          <PhaseBadge status={phaseStatus} size="sm" />
          {phase.materials && phase.materials.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Package className="w-3 h-3" />
              <span>{phase.materials.length}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
