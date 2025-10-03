"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Salary {
  monthlySalary: number;
  payDay: number;
}

interface EditSalaryModalProps {
  isEditModalOpen: boolean;
  setIsEditModalOpen: (open: boolean) => void;
  salary: Salary;
  updateSalary: (field: "monthlySalary" | "payDay", value: number) => void;
}

export default function EditSalaryModal({ isEditModalOpen, setIsEditModalOpen, salary, updateSalary }: EditSalaryModalProps) {
  // Generate array of numbers from 1 to 31 for pay day dropdown
  const payDayOptions = Array.from({ length: 31 }, (_, i) => i + 1);
  
  // Local state for form values
  const [localSalary, setLocalSalary] = useState<Salary>(salary);
  
  // Update local state when the modal opens or salary props change
  useEffect(() => {
    if (isEditModalOpen) {
      setLocalSalary(salary);
    }
  }, [isEditModalOpen, salary]);
  
  // Handle save changes
  const handleSaveChanges = () => {
    updateSalary("monthlySalary", localSalary.monthlySalary);
    updateSalary("payDay", localSalary.payDay);
    setIsEditModalOpen(false);
  };

  return (
    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
      <DialogContent className="glass-card max-w-lg border-gray-300/50 bg-white/98 p-5">
        <DialogHeader>
          <DialogTitle className="glass-text text-lg">Edit Salary Information</DialogTitle>
          <DialogDescription className="text-gray-600 text-xs">
            Update your monthly income and pay day.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2.5">
          <div className="space-y-0.5">
            <Label htmlFor="monthly-income-edit" className="glass-text text-[9px] uppercase tracking-wide text-gray-600">
              Monthly Income
            </Label>
            <Input
              id="monthly-income-edit"
              type="number"
              min={0}
              value={localSalary.monthlySalary}
              onChange={(event) => setLocalSalary(prev => ({ ...prev, monthlySalary: parseFloat(event.target.value) || 0 }))}
              className="glass-card border-gray-300/50 bg-gray-100/30 text-gray-900 placeholder:text-gray-500 h-8 text-xs"
            />
          </div>
          <div className="space-y-0.5">
            <Label className="glass-text text-[9px] uppercase tracking-wide text-gray-600">
              Pay Day
            </Label>
            <Select
              value={String(localSalary.payDay)}
              onValueChange={(value) => setLocalSalary(prev => ({ ...prev, payDay: parseInt(value) }))}
            >
              <SelectTrigger className="glass-card border-gray-300/50 bg-gray-100/30 text-left text-gray-900 h-8 text-xs">
                <SelectValue placeholder="Select pay day" />
              </SelectTrigger>
              <SelectContent className="bg-white/98 backdrop-blur">
                {payDayOptions.map((day) => (
                  <SelectItem key={day} value={String(day)} className="text-gray-900 text-xs">
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="mt-3 flex gap-3">
          <Button
            onClick={handleSaveChanges}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-blue-500 px-3 py-1.5 text-xs font-semibold text-white hover:from-emerald-600 hover:to-blue-600"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}