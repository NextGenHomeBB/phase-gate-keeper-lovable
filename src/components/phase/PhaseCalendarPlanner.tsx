import * as React from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval, getDay, startOfWeek, endOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Phase } from "@/pages/Index";

interface PhaseCalendarPlannerProps {
  phases: Phase[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onPhaseClick: (phase: Phase) => void;
  onAddPhase?: () => void;
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

export function PhaseCalendarPlanner({
  phases,
  currentDate,
  onDateChange,
  onPhaseClick,
  onAddPhase
}: PhaseCalendarPlannerProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  // Get the full calendar grid including leading/trailing days to properly align with weekdays
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // 0 = Sunday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const previousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  };

  const getPhasesForDate = (date: Date) => {
    const dayOfWeek = getDay(date);
    // Don't show phases on Sundays (day 0 = Sunday)
    if (dayOfWeek === 0) {
      console.log(`Excluding Sunday: ${format(date, 'yyyy-MM-dd')}`);
      return [];
    }
    
    return phases.filter(phase => {
      if (!phase.start_date || !phase.end_date) return false;
      
      const startDate = new Date(phase.start_date);
      const endDate = new Date(phase.end_date);
      
      // Check if the date is within the phase range
      const isInRange = isWithinInterval(date, { start: startDate, end: endDate });
      
      if (isInRange) {
        console.log(`Phase "${phase.name}" appears on ${format(date, 'yyyy-MM-dd')} (${dayOfWeek === 0 ? 'Sunday' : 'Weekday'})`);
      }
      
      return isInRange;
    });
  };

  const getPhaseColor = (phase: Phase) => {
    return PHASE_COLORS[phase.color_index || 0] || PHASE_COLORS[0];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Project Timeline</CardTitle>
          {onAddPhase && (
            <Button onClick={onAddPhase} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Phase
            </Button>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {format(currentDate, "MMMM yyyy")}
          </h3>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dayPhases = getPhasesForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());
            const isSunday = getDay(day) === 0;
            
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "min-h-[80px] p-1 border rounded-lg transition-colors",
                  !isCurrentMonth && "opacity-50",
                  isToday && "ring-2 ring-primary",
                  isSunday ? "bg-muted/20 border-dashed border-muted cursor-not-allowed" : "hover:bg-muted/50"
                )}
              >
                <div className={cn(
                  "text-sm font-medium mb-1",
                  isToday && "text-primary font-bold"
                )}>
                  {format(day, "d")}
                </div>
                
                <div className="space-y-1">
                  {dayPhases.slice(0, 2).map((phase) => (
                    <Badge
                      key={`${phase.id}-${day.toISOString()}`}
                      variant="secondary"
                      className={cn(
                        "text-xs cursor-pointer truncate w-full justify-start p-1 h-auto",
                        getPhaseColor(phase),
                        "text-white hover:opacity-80"
                      )}
                      onClick={() => onPhaseClick(phase)}
                    >
                      {phase.name}
                    </Badge>
                  ))}
                  {dayPhases.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayPhases.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {phases.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-3">Phase Legend</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {phases.map((phase) => (
                <div
                  key={phase.id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded"
                  onClick={() => onPhaseClick(phase)}
                >
                  <div className={cn("w-3 h-3 rounded", getPhaseColor(phase))} />
                  <span className="text-sm truncate">{phase.name}</span>
                  {phase.start_date && phase.end_date && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {phase.estimated_duration_days} days
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}