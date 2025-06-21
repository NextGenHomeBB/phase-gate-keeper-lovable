
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phase } from "@/pages/Index";
import { KanbanCard } from "./KanbanCard";
import { PhaseStatus } from "./PhaseBadge";
import { CheckCircle, Clock, Calendar, AlertTriangle, Building, Hammer, PaintBucket, Wrench, Zap, Drill, HardHat } from "lucide-react";

interface KanbanViewProps {
  phases: Phase[];
  onPhaseClick: (phase: Phase) => void;
  onEditPhaseName: (phase: Phase) => void;
  onDeletePhase: (phaseId: number) => void;
  getPhaseProgress: (phase: Phase) => number;
  getPhaseStatus: (phase: Phase) => PhaseStatus;
}

const statusColumns = [
  {
    status: "done" as PhaseStatus,
    title: "Done",
    icon: CheckCircle,
    color: "bg-green-50 border-green-200",
    badgeColor: "bg-green-100 text-green-800",
  },
  {
    status: "active" as PhaseStatus,
    title: "In Progress",
    icon: Clock,
    color: "bg-red-50 border-red-200",
    badgeColor: "bg-red-100 text-red-800",
  },
  {
    status: "queued" as PhaseStatus,
    title: "Scheduled",
    icon: Calendar,
    color: "bg-gray-50 border-gray-200",
    badgeColor: "bg-gray-100 text-gray-800",
  },
  {
    status: "special" as PhaseStatus,
    title: "Special Task",
    icon: AlertTriangle,
    color: "bg-orange-50 border-orange-200",
    badgeColor: "bg-orange-100 text-orange-800",
  },
];

const phaseIcons = [
  Building,    // Planning/Foundation
  Hammer,      // Construction
  PaintBucket, // Interior work
  Wrench,      // Finishing
  Zap,         // Electrical/Utilities
  Drill,       // Installation
  HardHat,     // Safety/Inspection
  Calendar,    // Scheduling
];

export function KanbanView({
  phases,
  onPhaseClick,
  onEditPhaseName,
  onDeletePhase,
  getPhaseProgress,
  getPhaseStatus,
}: KanbanViewProps) {
  const getPhaseIcon = (index: number) => {
    return phaseIcons[index % phaseIcons.length];
  };

  const getPhasesByStatus = (status: PhaseStatus) => {
    return phases.filter(phase => getPhaseStatus(phase) === status);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statusColumns.map((column) => {
        const ColumnIcon = column.icon;
        const columnPhases = getPhasesByStatus(column.status);
        
        return (
          <Card key={column.status} className={`${column.color} min-h-[500px]`}>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ColumnIcon className="w-5 h-5" />
                  <span>{column.title}</span>
                </div>
                <Badge className={`${column.badgeColor} border-0`}>
                  {columnPhases.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 group">
              {columnPhases.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <ColumnIcon className="w-8 h-8 mx-auto opacity-50" />
                  </div>
                  <p className="text-sm text-gray-500">No phases</p>
                </div>
              ) : (
                columnPhases.map((phase, index) => (
                  <KanbanCard
                    key={phase.id}
                    phase={phase}
                    phaseIcon={getPhaseIcon(phases.indexOf(phase))}
                    onPhaseClick={onPhaseClick}
                    onEditPhaseName={onEditPhaseName}
                    onDeletePhase={onDeletePhase}
                    getPhaseProgress={getPhaseProgress}
                    getPhaseStatus={getPhaseStatus}
                  />
                ))
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
