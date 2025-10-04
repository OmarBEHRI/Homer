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
  const [isOpen, setIsOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date | undefined>(value);
  const [tempHour, setTempHour] = useState<string>(value ? String(value.getHours()).padStart(2, '0') : "09");
  const [tempMinute, setTempMinute] = useState<string>(value ? String(value.getMinutes()).padStart(2, '0') : "00");

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    if (dateValue) {
      const newDate = new Date(dateValue);
      newDate.setHours(parseInt(tempHour), parseInt(tempMinute), 0, 0);
      setTempDate(newDate);
    } else {
      setTempDate(undefined);
    }
  };

  const handleTimeChange = (type: 'hour' | 'minute', newValue: string) => {
    if (type === 'hour') {
      setTempHour(newValue);
    } else {
      setTempMinute(newValue);
    }
    
    if (tempDate) {
      const newDate = new Date(tempDate);
      newDate.setHours(
        type === 'hour' ? parseInt(newValue) : parseInt(tempHour),
        type === 'minute' ? parseInt(newValue) : parseInt(tempMinute),
        0,
        0
      );
      setTempDate(newDate);
    }
  };

  const handleApply = () => {
    if (tempDate) {
      const finalDate = new Date(tempDate);
      finalDate.setHours(parseInt(tempHour), parseInt(tempMinute), 0, 0);
      onChange(finalDate);
    } else {
      onChange(undefined);
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setTempDate(undefined);
    setTempHour("09");
    setTempMinute("00");
    onChange(undefined);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempDate(value);
    setTempHour(value ? String(value.getHours()).padStart(2, '0') : "09");
    setTempMinute(value ? String(value.getMinutes()).padStart(2, '0') : "00");
    setIsOpen(false);
  };

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            type="date"
            value={tempDate ? formatDateForInput(tempDate) : ""}
            onChange={handleDateChange}
            className="pl-10"
            onClick={() => setIsOpen(true)}
            readOnly
          />
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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

      {isOpen && (
        <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Clock className="w-4 h-4" />
            Set Time
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Hour</label>
              <Select value={tempHour} onValueChange={(value) => handleTimeChange('hour', value)}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hours.map((hour) => (
                    <SelectItem key={hour} value={hour}>
                      {hour}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Minute</label>
              <Select value={tempMinute} onValueChange={(value) => handleTimeChange('minute', value)}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {minutes.filter((_, i) => i % 5 === 0).map((minute) => (
                    <SelectItem key={minute} value={minute}>
                      {minute}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleApply}
            >
              Apply
            </Button>
          </div>
        </div>
      )}

      {value && (
        <div className="text-xs text-gray-500">
          Due: {value.toLocaleString()}
        </div>
      )}
    </div>
  );
}
