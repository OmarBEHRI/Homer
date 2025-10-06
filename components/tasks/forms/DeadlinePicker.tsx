"use client";

import { useState } from "react";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Calendar, X, Clock } from "lucide-react";

interface DeadlinePickerProps {
  value?: Date;
  onChange: (value: Date | undefined) => void;
}

export function DeadlinePicker({ value, onChange }: DeadlinePickerProps) {
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTimeForInput = (date: Date) => {
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${hour}:${minute}`;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    if (dateValue) {
      const newDate = new Date(dateValue);
      // Preserve existing time or set to 9:00 AM
      if (value) {
        newDate.setHours(value.getHours(), value.getMinutes(), 0, 0);
      } else {
        newDate.setHours(9, 0, 0, 0);
      }
      onChange(newDate);
    } else {
      onChange(undefined);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = e.target.value;
    if (timeValue && value) {
      const [hour, minute] = timeValue.split(':');
      const newDate = new Date(value);
      newDate.setHours(parseInt(hour), parseInt(minute), 0, 0);
      onChange(newDate);
    }
  };

  const handleClear = () => {
    onChange(undefined);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            type="date"
            value={value ? formatDateForInput(value) : ""}
            onChange={handleDateChange}
            className="pl-10"
          />
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>
        
        <div className="relative flex-1">
          <Input
            type="time"
            value={value ? formatTimeForInput(value) : "09:00"}
            onChange={handleTimeChange}
            className="pl-10"
          />
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>
        
        {value && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="px-2"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {value && (
        <div className="text-xs text-gray-500">
          Due: {value.toLocaleString()}
        </div>
      )}
    </div>
  );
}
