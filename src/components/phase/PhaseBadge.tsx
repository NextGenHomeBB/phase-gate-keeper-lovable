
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Calendar, AlertTriangle, ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type PhaseStatus = "done" | "active" | "queued" | "special";

interface PhaseBadgeProps {
  status: PhaseStatus;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  onStatusChange?: (status: PhaseStatus) => void;
  editable?: boolean;
}

const statusConfig = {
  done: {
    label: "Done",
    color: "bg-green-600 text-white border-green-600",
    icon: CheckCircle,
  },
  active: {
    label: "In Progress",
    color: "bg-red-600 text-white border-red-600",
    icon: Clock,
  },
  queued: {
    label: "Scheduled",
    color: "bg-gray-500 text-white border-gray-500",
    icon: Calendar,
  },
  special: {
    label: "Special Task",
    color: "bg-orange-600 text-white border-orange-600",
    icon: AlertTriangle,
  },
};

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

export function PhaseBadge({ 
  status, 
  size = "md", 
  showIcon = true, 
  onStatusChange,
  editable = false 
}: PhaseBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-0.5",
    lg: "text-base px-3 py-1",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  if (editable && onStatusChange) {
    return (
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className={`w-auto h-auto p-0 border-0 bg-transparent hover:bg-transparent focus:ring-0 focus:ring-offset-0`}>
          <SelectValue>
            <Badge 
              variant="outline" 
              className={`${config.color} ${sizeClasses[size]} inline-flex items-center gap-1 font-medium cursor-pointer hover:opacity-80 transition-opacity`}
            >
              {showIcon && <Icon className={iconSizes[size]} />}
              {config.label}
              <ChevronDown className="w-3 h-3 ml-1" />
            </Badge>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white border-gray-200 shadow-lg z-50">
          {statusOptions.map((option) => {
            const OptionIcon = option.icon;
            return (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <OptionIcon className={`w-4 h-4 ${option.color}`} />
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className={`${config.color} ${sizeClasses[size]} inline-flex items-center gap-1 font-medium`}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </Badge>
  );
}
