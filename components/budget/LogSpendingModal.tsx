"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NewExpense {
  amount: string;
  category: string;
  description: string;
  newCategory: string;
}

interface LogSpendingModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  newExpense: NewExpense;
  setNewExpense: React.Dispatch<React.SetStateAction<NewExpense>>;
  allCategories: string[];
  addExpense: () => void;
  resetExpenseForm: () => void;
}

export default function LogSpendingModal({
  isModalOpen,
  setIsModalOpen,
  newExpense,
  setNewExpense,
  allCategories,
  addExpense,
  resetExpenseForm,
}: LogSpendingModalProps) {
  // Local state for form values
  const [localExpense, setLocalExpense] = useState<NewExpense>(newExpense);
  
  // Update local state when the modal opens or newExpense props change
  useEffect(() => {
    if (isModalOpen) {
      setLocalExpense(newExpense);
    }
  }, [isModalOpen, newExpense]);
  
  // Handle save expense
  const handleSaveExpense = () => {
    setNewExpense(localExpense);
    // Call the original addExpense function
    addExpense();
  };
  
  // Handle clear
  const handleClear = () => {
    setLocalExpense({ amount: "", category: "", description: "", newCategory: "" });
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="glass-card max-w-lg border-gray-300/50 bg-white/98 p-5">
        <DialogHeader>
          <DialogTitle className="glass-text text-lg">Add Expense</DialogTitle>
          <DialogDescription className="text-gray-600 text-xs">
            Provide the essentials of today's purchase.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2.5">
          <div className="space-y-0.5">
            <Label htmlFor="expense-amount" className="glass-text text-[9px] uppercase tracking-wide text-gray-600">
              Amount
            </Label>
            <Input
              id="expense-amount"
              type="number"
              min={0}
              placeholder="e.g. 42.75"
              value={localExpense.amount}
              onChange={(event) => setLocalExpense((prev) => ({ ...prev, amount: event.target.value }))}
              className="glass-card border-gray-300/50 bg-gray-100/30 text-gray-900 placeholder:text-gray-500 h-8 text-xs"
            />
          </div>
          <div className="grid gap-1.5 sm:grid-cols-2">
            <div className="space-y-0.5">
              <Label className="glass-text text-[9px] uppercase tracking-wide text-gray-600">Category</Label>
              <Select
                value={localExpense.category}
                onValueChange={(value) => setLocalExpense((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="glass-card border-gray-300/50 bg-gray-100/30 text-left text-gray-900 h-8 text-xs">
                  <SelectValue placeholder="Pick a category" />
                </SelectTrigger>
                <SelectContent className="bg-white/98 backdrop-blur">
                  {allCategories.map((category) => (
                    <SelectItem key={category} value={category} className="text-gray-900 text-xs">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-0.5">
              <Label htmlFor="expense-new-category" className="glass-text text-[9px] uppercase tracking-wide text-gray-600">
                Or New Category
              </Label>
              <Input
                id="expense-new-category"
                placeholder="Create new"
                value={localExpense.newCategory}
                onChange={(event) =>
                  setLocalExpense((prev) => ({ ...prev, newCategory: event.target.value }))
                }
                className="glass-card border-gray-300/50 bg-gray-100/30 text-gray-900 placeholder:text-gray-500 h-8 text-xs"
              />
            </div>
          </div>
          <div className="space-y-0.5">
            <Label htmlFor="expense-description" className="glass-text text-[9px] uppercase tracking-wide text-gray-600">
              Description (optional)
            </Label>
            <Input
              id="expense-description"
              placeholder="Short memo"
              value={localExpense.description}
              onChange={(event) => setLocalExpense((prev) => ({ ...prev, description: event.target.value }))}
              className="glass-card border-gray-300/50 bg-gray-100/30 text-gray-900 placeholder:text-gray-500 h-8 text-xs"
            />
          </div>
        </div>
        <DialogFooter className="mt-3 flex gap-3">
          <Button
            variant="ghost"
            onClick={handleClear}
            className="glass-card flex-1 border border-gray-300/50 bg-gray-100/30 px-3 py-1.5 text-xs text-gray-900 hover:bg-gray-200/50"
          >
            Clear
          </Button>
          <Button
            onClick={handleSaveExpense}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-blue-500 px-3 py-1.5 text-xs font-semibold text-white hover:from-emerald-600 hover:to-blue-600"
          >
            Save Expense
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}