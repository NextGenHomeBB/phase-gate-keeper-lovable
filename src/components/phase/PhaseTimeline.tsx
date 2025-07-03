import * as React from "react";
import { format, differenceInDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Phase } from "@/pages/Index";

interface PhaseTimelineProps {
  phases: Phase[];
  onPhaseClick: (phase: Phase) => void;
}

const PHASE_COLORS = [
  "bg-blue-500",
  "bg-green-500", 
  "bg-yellow-500",
  "bg-purple-500",
  "bg-red-500",
  "bg-indigo-500",
  "bg-pink-500",
  "bg-orange-500"
];

export function PhaseTimeline({ phases, onPhaseClick }: PhaseTimelineProps) {
  const scheduledPhases = phases.filter(phase => phase.start_date && phase.end_date);
  
  const projectStart = React.useMemo(() => {
    if (scheduledPhases.length === 0) return null;
    return new Date(Math.min(...scheduledPhases.map(p => new Date(p.start_date!).getTime())));
  }, [scheduledPhases]);

  const projectEnd = React.useMemo(() => {
    if (scheduledPhases.length === 0) return null;
    return new Date(Math.max(...scheduledPhases.map(p => new Date(p.end_date!).getTime())));
  }, [scheduledPhases]);

  const totalProjectDays = React.useMemo(() => {
    if (!projectStart || !projectEnd) return 0;
    return differenceInDays(projectEnd, projectStart) + 1;
  }, [projectStart, projectEnd]);

  const getPhasePosition = (phase: Phase) => {
    if (!projectStart || !phase.start_date || !phase.end_date) return { left: 0, width: 0 };
    
    const phaseStart = new Date(phase.start_date);
    const phaseEnd = new Date(phase.end_date);
    
    const startOffset = differenceInDays(phaseStart, projectStart);
    const duration = differenceInDays(phaseEnd, phaseStart) + 1;
    
    const left = (startOffset / totalProjectDays) * 100;
    const width = (duration / totalProjectDays) * 100;
    
    return { left: `${left}%`, width: `${width}%` };
  };

  const getPhaseColor = (phase: Phase) => {
    return PHASE_COLORS[phase.color_index || 0] || PHASE_COLORS[0];
  };

  const getPhaseProgress = (phase: Phase) => {
    if (!phase.start_date || !phase.end_date) return 0;
    
    const now = new Date();
    const start = new Date(phase.start_date);
    const end = new Date(phase.end_date);
    
    if (now < start) return 0;
    if (now > end) return phase.completed ? 100 : 90; // Show 90% if overdue but not completed
    
    const totalDays = differenceInDays(end, start) + 1;
    const passedDays = differenceInDays(now, start) + 1;
    
    return Math.min((passedDays / totalDays) * 100, 100);
  };

  if (scheduledPhases.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No phases have been scheduled yet. Add start and end dates to your phases to see the timeline.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Timeline</CardTitle>
        {projectStart && projectEnd && (
          <div className="text-sm text-muted-foreground">
            {format(projectStart, "MMM d, yyyy")} - {format(projectEnd, "MMM d, yyyy")} 
            ({totalProjectDays} days)
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timeline header */}
        {projectStart && projectEnd && (
          <div className="relative">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>{format(projectStart, "MMM d")}</span>
              <span>{format(projectEnd, "MMM d")}</span>
            </div>
            <div className="h-1 bg-muted rounded-full" />
          </div>
        )}

        {/* Phase bars */}
        <div className="space-y-4">
          {scheduledPhases.map((phase) => {
            const position = getPhasePosition(phase);
            const progress = getPhaseProgress(phase);
            const isOverdue = !phase.completed && new Date() > new Date(phase.end_date!);
            
            return (
              <div key={phase.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium">{phase.name}</h4>
                    <Badge variant={phase.completed ? "default" : isOverdue ? "destructive" : "secondary"}>
                      {phase.completed ? "Completed" : isOverdue ? "Overdue" : "In Progress"}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {phase.estimated_duration_days} days
                  </div>
                </div>
                
                <div 
                  className="relative h-8 bg-muted rounded cursor-pointer hover:bg-muted/80 transition-colors"
                  onClick={() => onPhaseClick(phase)}
                >
                  <div
                    className={cn(
                      "absolute top-0 h-full rounded flex items-center px-2 text-white text-xs font-medium",
                      getPhaseColor(phase),
                      "hover:opacity-90 transition-opacity"
                    )}
                    style={position}
                  >
                    <span className="truncate">{phase.name}</span>
                  </div>
                  
                  {/* Progress overlay */}
                  {progress > 0 && (
                    <div
                      className="absolute top-0 h-full bg-white/20 rounded-l"
                      style={{
                        left: position.left,
                        width: `${(parseFloat(position.width.toString()) * progress) / 100}%`
                      }}
                    />
                  )}
                </div>
                
                <div className="text-xs text-muted-foreground flex justify-between">
                  <span>{format(new Date(phase.start_date!), "MMM d")}</span>
                  <span>{format(new Date(phase.end_date!), "MMM d")}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Overall project progress */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">
              {scheduledPhases.filter(p => p.completed).length} of {scheduledPhases.length} phases completed
            </span>
          </div>
          <Progress 
            value={(scheduledPhases.filter(p => p.completed).length / scheduledPhases.length) * 100} 
            className="h-2"
          />
        </div>
      </CardContent>
    </Card>
  );
}