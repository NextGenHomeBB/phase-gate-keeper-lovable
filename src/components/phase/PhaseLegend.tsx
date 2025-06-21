
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhaseBadge, PhaseStatus } from "./PhaseBadge";
import { Info } from "lucide-react";

interface PhaseLegendProps {
  title?: string;
  compact?: boolean;
}

const phaseStatuses: PhaseStatus[] = ["done", "active", "queued", "special"];

const statusDescriptions = {
  done: "Phase has been completed successfully",
  active: "Phase is currently being worked on",
  queued: "Phase is scheduled for future work",
  special: "Phase requires special attention or extra help",
};

export function PhaseLegend({ title = "Phase Status Legend", compact = false }: PhaseLegendProps) {
  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Info className="w-4 h-4" />
          {title}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {phaseStatuses.map((status) => (
            <div key={status} className="flex items-center gap-2">
              <PhaseBadge status={status} size="sm" showIcon={false} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-gray-50 border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Info className="w-4 h-4 text-gray-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {phaseStatuses.map((status) => (
          <div key={status} className="flex items-center justify-between">
            <PhaseBadge status={status} size="sm" />
            <span className="text-xs text-gray-600 ml-2 flex-1">
              {statusDescriptions[status]}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
