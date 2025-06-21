
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Calendar, AlertTriangle } from "lucide-react";

export type PhaseStatus = "done" | "active" | "queued" | "special";

interface PhaseBadgeProps {
  status: PhaseStatus;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
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

export function PhaseBadge({ status, size = "md", showIcon = true }: PhaseBadgeProps) {
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
