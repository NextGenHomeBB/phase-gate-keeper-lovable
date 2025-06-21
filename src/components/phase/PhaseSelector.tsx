
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhaseBadge, PhaseStatus } from "./PhaseBadge";
import { CheckCircle, Clock, Calendar, AlertTriangle } from "lucide-react";

interface PhaseSelectorProps {
  value: PhaseStatus;
  onValueChange: (status: PhaseStatus) => void;
  disabled?: boolean;
}

const statusOptions: { value: PhaseStatus; label: string; icon: React.ComponentType<any>; color: string }[] = [
  {
    value: "done",
    label: "Done",
    icon: CheckCircle,
    color: "text-green-600",
  },
  {
    value: "active",
    label: "In Progress",
    icon: Clock,
    color: "text-red-600",
  },
  {
    value: "queued",
    label: "Scheduled",
    icon: Calendar,
    color: "text-gray-500",
  },
  {
    value: "special",
    label: "Special Task",
    icon: AlertTriangle,
    color: "text-orange-600",
  },
];

export function PhaseSelector({ value, onValueChange, disabled = false }: PhaseSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-full bg-white border-gray-300 focus:border-blue-500">
        <SelectValue>
          <PhaseBadge status={value} size="sm" />
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-white border-gray-200 shadow-lg z-50">
        {statusOptions.map((option) => {
          const Icon = option.icon;
          return (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${option.color}`} />
                <span>{option.label}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
