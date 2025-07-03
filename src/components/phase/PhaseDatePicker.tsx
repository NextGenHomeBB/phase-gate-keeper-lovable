import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

interface PhaseDatePickerProps {
  startDate?: Date;
  endDate?: Date;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  disabled?: boolean;
  minStartDate?: Date;
}

export function PhaseDatePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  disabled = false,
  minStartDate
}: PhaseDatePickerProps) {
  const [startOpen, setStartOpen] = React.useState(false);
  const [endOpen, setEndOpen] = React.useState(false);

  const duration = React.useMemo(() => {
    if (startDate && endDate) {
      const diffTime = endDate.getTime() - startDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return null;
  }, [startDate, endDate]);

  const handleStartDateSelect = (date: Date | undefined) => {
    onStartDateChange(date);
    setStartOpen(false);
    
    // Auto-adjust end date if it's before the new start date
    if (date && endDate && endDate < date) {
      onEndDateChange(undefined);
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    onEndDateChange(date);
    setEndOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Popover open={startOpen} onOpenChange={setStartOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
                disabled={disabled}
                aria-label={startDate ? `Start date: ${format(startDate, "PPP")}` : "Pick start date"}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : <span>Pick start date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={handleStartDateSelect}
                disabled={(date) => 
                  (minStartDate && date < minStartDate) || 
                  date < new Date()
                }
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>End Date</Label>
          <Popover open={endOpen} onOpenChange={setEndOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
                disabled={disabled || !startDate}
                aria-label={endDate ? `End date: ${format(endDate, "PPP")}` : "Pick end date"}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : <span>Pick end date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={handleEndDateSelect}
                disabled={(date) => 
                  !startDate || 
                  date < startDate ||
                  date < new Date()
                }
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {duration && (
        <div className="p-3 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground">Duration</div>
          <div className="text-lg font-semibold">
            {duration} {duration === 1 ? 'day' : 'days'}
            {duration > 7 && (
              <span className="text-sm text-muted-foreground ml-2">
                ({Math.ceil(duration / 7)} weeks)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}