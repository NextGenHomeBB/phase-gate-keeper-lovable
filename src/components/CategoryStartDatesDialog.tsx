import React, { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CategoryStartDatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectStartDate: string;
  categoryStartDates: Record<string, string> | null;
  onSave: (projectStartDate: string, categoryDates: Record<string, string>) => void;
}

const CONSTRUCTION_CATEGORIES = [
  { key: "inbouwmaterialen", label: "Inbouwmaterialen (elektra, leidingen, installaties)" },
  { key: "vloeren", label: "Vloeren" },
  { key: "tegels", label: "Tegels (badkamer, toilet, evt. keukenwand)" },
  { key: "badkamermeubels", label: "Badkamermeubels & sanitair" },
  { key: "keuken", label: "Keuken" },
  { key: "overige", label: "Overige (maatwerk, schilderwerk, meubels)" },
];

export function CategoryStartDatesDialog({
  open,
  onOpenChange,
  projectStartDate,
  categoryStartDates,
  onSave,
}: CategoryStartDatesDialogProps) {
  const [mainStartDate, setMainStartDate] = useState<Date | undefined>(
    projectStartDate ? new Date(projectStartDate) : undefined
  );
  const [categoryDates, setCategoryDates] = useState<Record<string, Date | undefined>>(() => {
    const dates: Record<string, Date | undefined> = {};
    CONSTRUCTION_CATEGORIES.forEach(({ key }) => {
      if (categoryStartDates?.[key]) {
        dates[key] = new Date(categoryStartDates[key]);
      }
    });
    return dates;
  });

  const handleCategoryDateChange = (categoryKey: string, date: Date | undefined) => {
    setCategoryDates(prev => ({
      ...prev,
      [categoryKey]: date,
    }));
  };

  const handleSave = () => {
    if (!mainStartDate) return;

    const formattedCategoryDates: Record<string, string> = {};
    Object.entries(categoryDates).forEach(([key, date]) => {
      if (date) {
        formattedCategoryDates[key] = format(date, "yyyy-MM-dd");
      }
    });

    onSave(format(mainStartDate, "yyyy-MM-dd"), formattedCategoryDates);
    onOpenChange(false);
  };

  const resetCategoryDate = (categoryKey: string) => {
    setCategoryDates(prev => ({
      ...prev,
      [categoryKey]: undefined,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Project Start Dates</DialogTitle>
          <DialogDescription>
            Set the main project start date and specific start dates for construction categories.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Main Project Start Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Main Project Start Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !mainStartDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {mainStartDate ? format(mainStartDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={mainStartDate}
                  onSelect={setMainStartDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Category Start Dates */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Construction Categories</h3>
            {CONSTRUCTION_CATEGORIES.map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-muted-foreground">{label}</label>
                  {categoryDates[key] && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => resetCategoryDate(key)}
                      className="text-xs"
                    >
                      Reset to main date
                    </Button>
                  )}
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !categoryDates[key] && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {categoryDates[key] ? (
                        format(categoryDates[key]!, "PPP")
                      ) : mainStartDate ? (
                        <span className="opacity-60">
                          Inherits from main date ({format(mainStartDate, "PPP")})
                        </span>
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={categoryDates[key]}
                      onSelect={(date) => handleCategoryDateChange(key, date)}
                      disabled={(date) => mainStartDate ? date < mainStartDate : false}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!mainStartDate}>
            Save Dates
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}