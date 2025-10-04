"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { AlertCircle, Clock, Circle } from "lucide-react";

interface PrioritySelectorProps {
  value: "low" | "medium" | "high";
  onChange: (value: "low" | "medium" | "high") => void;
}

const priorityOptions = [
  {
    value: "low" as const,
    label: "Low",
    icon: Circle,
    color: "text-green-600",
  },
  {
    value: "medium" as const,
    label: "Medium",
    icon: Clock,
    color: "text-yellow-600",
  },
  {
    value: "high" as const,
    label: "High",
    icon: AlertCircle,
    color: "text-red-600",
  },
];

export function PrioritySelector({ value, onChange }: PrioritySelectorProps) {
  const selectedOption = priorityOptions.find(option => option.value === value);
  const SelectedIcon = selectedOption?.icon || Circle;

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue>
          <div className="flex items-center gap-2">
            <SelectedIcon className={`w-4 h-4 ${selectedOption?.color}`} />
            <span>{selectedOption?.label}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {priorityOptions.map((option) => {
          const Icon = option.icon;
          return (
            <SelectItem key={option.value} value={option.value}>
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
