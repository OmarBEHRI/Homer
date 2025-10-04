"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, DollarSign, Trash2 } from "lucide-react";
import CustomTreemap from "@/components/budget/CustomTreemap";

interface Allocation {
  id: string;
  category: string;
  amount: number;
  description?: string;
}

const allCategories = [
  "Rent",
  "Internet",
  "Mobile Internet",
  "Groceries",
  "Eating Out",
  "Shopping",
  "Car Mortgage",
  "House Mortgage",
  "Other Mortgages or Debts",
  "Transportation",
  "Subscriptions",
  "Utilities",
  "Healthcare",
  "Savings",
  "Investments",
  "Entertainment",
  "Insurance",
  "Education",
  "Miscellaneous",
  "Custom",
];

export default function ManagementTab({
  allocations,
  budgetCurrency,
  handleAllocationSubmit,
  handleUpdateAllocation,
  handleDeleteAllocation,
  currencyFormatter,
  monthlySalary,
  onUpdateMonthlySalary,
}: {
  allocations: Allocation[];
  budgetCurrency: string;
  handleAllocationSubmit: (allocation: { category: string; amount: number; description?: string; customCategoryLabel?: string }) => void;
  handleUpdateAllocation: (params: { allocationId: string; amount?: number; description?: string }) => Promise<void>;
  handleDeleteAllocation: (params: { allocationId: string }) => Promise<void>;
  currencyFormatter: (currency: string) => Intl.NumberFormat;
  monthlySalary: number | null | undefined;
  onUpdateMonthlySalary: (amount: number) => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null);
  const [salaryInput, setSalaryInput] = useState("");
  const [allocationForm, setAllocationForm] = useState({
    category: "",
    amount: "",
    description: "",
    customCategoryLabel: "",
  });
  const [editForm, setEditForm] = useState({
    amount: "",
    description: "",
  });

  const handleSubmit = useCallback(() => {
    const finalCategory = allocationForm.customCategoryLabel ? "Custom" : allocationForm.category;
    const amount = parseFloat(allocationForm.amount);

    if (!finalCategory || isNaN(amount) || amount <= 0) {
      alert("Please enter a valid category and amount");
      return;
    }

    handleAllocationSubmit({
      category: finalCategory,
      amount,
      description: allocationForm.description || undefined,
      customCategoryLabel: allocationForm.customCategoryLabel || undefined,
    });

    setAllocationForm({ category: "", amount: "", description: "", customCategoryLabel: "" });
    setIsModalOpen(false);
  }, [allocationForm, handleAllocationSubmit]);

  const handleSalarySubmit = useCallback(() => {
    const amount = parseFloat(salaryInput);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid salary amount");
      return;
    }

    onUpdateMonthlySalary(amount);
    setSalaryInput("");
    setIsSalaryModalOpen(false);
  }, [salaryInput, onUpdateMonthlySalary]);

  const handleEditSubmit = useCallback(async () => {
    if (!selectedAllocation) return;

    const amount = parseFloat(editForm.amount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      await handleUpdateAllocation({
        allocationId: selectedAllocation.id,
        amount,
        description: editForm.description || undefined,
      });
      setIsEditModalOpen(false);
      setSelectedAllocation(null);
      setEditForm({ amount: "", description: "" });
    } catch (error) {
      console.error("Error updating allocation:", error);
      alert("Failed to update allocation. Please try again.");
    }
  }, [selectedAllocation, editForm, handleUpdateAllocation]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedAllocation) return;

    try {
      await handleDeleteAllocation({
        allocationId: selectedAllocation.id,
      });
      setIsDeleteModalOpen(false);
      setSelectedAllocation(null);
    } catch (error) {
      console.error("Error deleting allocation:", error);
      alert("Failed to delete allocation. Please try again.");
    }
  }, [selectedAllocation, handleDeleteAllocation]);

  const handleAllocationClick = useCallback((allocation: Allocation) => {
    setSelectedAllocation(allocation);
    setEditForm({
      amount: String(allocation.amount),
      description: allocation.description || "",
    });
    setIsEditModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((allocation: Allocation) => {
    setSelectedAllocation(allocation);
    setIsDeleteModalOpen(true);
  }, []);

  const totalAllocated = useMemo(() => {
    return allocations.reduce((sum, allocation) => sum + allocation.amount, 0);
  }, [allocations]);

  const unallocatedAmount = useMemo(() => {
    if (!monthlySalary || monthlySalary <= 0) return 0;
    return Math.max(0, monthlySalary - totalAllocated);
  }, [monthlySalary, totalAllocated]);

  const transformedData = useMemo(() => {
    const data: Array<{
      name: string;
      size: number;
      description?: string;
      isUnallocated: boolean;
      allocation?: Allocation;
    }> = allocations.map((allocation) => ({
      name: allocation.category,
      size: allocation.amount,
      description: allocation.description,
      isUnallocated: false,
      allocation: allocation,
    }));

    if (unallocatedAmount > 0) {
      data.push({
        name: "Unallocated",
        size: unallocatedAmount,
        description: "Remaining salary not yet allocated to any category",
        isUnallocated: true,
        allocation: undefined,
      });
    }

    return data;
  }, [allocations, unallocatedAmount]);

  const showSalaryPrompt = !monthlySalary || monthlySalary <= 0;

  return (
    <div className="h-full w-full overflow-hidden">
      <Card className="glass-card h-full flex flex-col overflow-hidden">
        <CardHeader className="flex-shrink-0 pb-4 relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="glass-text text-lg">Distribution Tree</CardTitle>
                <p className="glass-text text-sm text-gray-600 mt-1">
                  Manage your monthly salary by creating allocations. Click the &quot;+&quot; icon to create new allocations and the &quot;$&quot; icon to modify your monthly salary. Click on any allocation to edit it.
                </p>
            </div>
            <div className="flex gap-2">
              <Dialog open={isSalaryModalOpen} onOpenChange={setIsSalaryModalOpen}>
                <DialogTrigger asChild>
                  <button
                    className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 transition-colors flex items-center justify-center shadow-lg"
                    aria-label="Set monthly salary"
                  >
                    <DollarSign className="w-6 h-6 text-white" />
                  </button>
                </DialogTrigger>
                <DialogContent className="glass-card bg-white/95 border-gray-300/50 sm:max-w-[400px]">
                  <DialogHeader>
                    <DialogTitle className="glass-text text-xl">
                      {monthlySalary && monthlySalary > 0 ? "Update Monthly Salary" : "Set Monthly Salary"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="salary" className="glass-text text-xs uppercase tracking-wide text-gray-600">
                        Monthly Salary ({budgetCurrency})
                      </Label>
                      <Input
                        id="salary"
                        type="number"
                        min={0}
                        placeholder={monthlySalary ? String(monthlySalary) : "Enter your monthly salary"}
                        value={salaryInput}
                        onChange={(e) => setSalaryInput(e.target.value)}
                        className="glass-card border-gray-300/50 bg-gray-100/30 text-gray-900 placeholder:text-gray-500"
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setSalaryInput("");
                          setIsSalaryModalOpen(false);
                        }}
                        className="glass-card flex-1 border border-gray-300/50 bg-gray-100/30 text-gray-900 hover:bg-gray-200/50"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSalarySubmit}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-blue-500 text-white hover:from-emerald-600 hover:to-blue-600 border-0"
                      >
                        {monthlySalary && monthlySalary > 0 ? "Update" : "Set Salary"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <button
                    className="flex-shrink-0 w-12 h-12 rounded-full bg-black hover:bg-gray-800 transition-colors flex items-center justify-center shadow-lg"
                    aria-label="Add allocation"
                    disabled={showSalaryPrompt}
                  >
                    <Plus className="w-6 h-6 text-white" />
                  </button>
                </DialogTrigger>
                <DialogContent className="glass-card bg-white/95 border-gray-300/50 sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="glass-text text-xl">Add New Allocation</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="glass-text text-xs uppercase tracking-wide text-gray-600">Category</Label>
                        <Select
                          value={allocationForm.category}
                          onValueChange={(value) => setAllocationForm((prev) => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger className="glass-card border-gray-300/50 bg-gray-100/30 text-gray-900">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="bg-white/98 text-gray-900 border-gray-300/50">
                            {allCategories.map((category) => (
                              <SelectItem key={category} value={category} className="text-gray-900">
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="custom-category" className="glass-text text-xs uppercase tracking-wide text-gray-600">
                          Custom Label (Optional)
                        </Label>
                        <Input
                          id="custom-category"
                          placeholder="e.g., Travel Fund"
                          value={allocationForm.customCategoryLabel}
                          onChange={(e) => setAllocationForm((prev) => ({ ...prev, customCategoryLabel: e.target.value }))}
                          className="glass-card border-gray-300/50 bg-gray-100/30 text-gray-900 placeholder:text-gray-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount" className="glass-text text-xs uppercase tracking-wide text-gray-600">
                        Amount
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        min={0}
                        placeholder="Enter amount"
                        value={allocationForm.amount}
                        onChange={(e) => setAllocationForm((prev) => ({ ...prev, amount: e.target.value }))}
                        className="glass-card border-gray-300/50 bg-gray-100/30 text-gray-900 placeholder:text-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="glass-text text-xs uppercase tracking-wide text-gray-600">
                        Description (Optional)
                      </Label>
                      <Input
                        id="description"
                        placeholder="Add notes about this allocation"
                        value={allocationForm.description}
                        onChange={(e) => setAllocationForm((prev) => ({ ...prev, description: e.target.value }))}
                        className="glass-card border-gray-300/50 bg-gray-100/30 text-gray-900 placeholder:text-gray-500"
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setAllocationForm({ category: "", amount: "", description: "", customCategoryLabel: "" });
                          setIsModalOpen(false);
                        }}
                        className="glass-card flex-1 border border-gray-300/50 bg-gray-100/30 text-gray-900 hover:bg-gray-200/50"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-blue-500 text-white hover:from-emerald-600 hover:to-blue-600 border-0"
                      >
                        Add Allocation
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-4">
          {showSalaryPrompt ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="glass-card inline-flex p-4 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 border border-gray-300/50">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <p className="glass-text text-sm font-semibold text-gray-700 max-w-xs mx-auto">
                  Welcome! Let&apos;s set up your budget.
                </p>
                <p className="glass-text text-xs text-gray-500 max-w-xs mx-auto">
                  Click the $ button above to set your monthly salary and start allocating your budget.
                </p>
              </div>
            </div>
          ) : transformedData.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="glass-card inline-flex p-4 rounded-full bg-gray-100/50 border border-gray-300/50">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <p className="glass-text text-sm text-gray-500 max-w-xs mx-auto">
                  No allocations yet. Click the + button to add your first budget allocation and visualize your spending.
                </p>
              </div>
            </div>
          ) : (
            <CustomTreemap
              data={transformedData}
              currencyFormatter={currencyFormatter}
              budgetCurrency={budgetCurrency}
              onAllocationClick={handleAllocationClick}
            />
          )}
        </CardContent>
      </Card>

      {/* Edit Allocation Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="glass-card bg-white/95 border-gray-300/50 sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="glass-text text-xl">Edit Allocation: {selectedAllocation?.category}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-amount" className="glass-text text-xs uppercase tracking-wide text-gray-600">
                Amount ({budgetCurrency})
              </Label>
              <Input
                id="edit-amount"
                type="number"
                min={0}
                placeholder="Enter amount"
                value={editForm.amount}
                onChange={(e) => setEditForm((prev) => ({ ...prev, amount: e.target.value }))}
                className="glass-card border-gray-300/50 bg-gray-100/30 text-gray-900 placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description" className="glass-text text-xs uppercase tracking-wide text-gray-600">
                Description (Optional)
              </Label>
              <Input
                id="edit-description"
                placeholder="Add notes about this allocation"
                value={editForm.description}
                onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                className="glass-card border-gray-300/50 bg-gray-100/30 text-gray-900 placeholder:text-gray-500"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedAllocation(null);
                  setEditForm({ amount: "", description: "" });
                }}
                className="glass-card flex-1 border border-gray-300/50 bg-gray-100/30 text-gray-900 hover:bg-gray-200/50"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setIsEditModalOpen(false);
                  if (selectedAllocation) {
                    handleDeleteClick(selectedAllocation);
                  }
                }}
                className="flex-shrink-0 bg-red-500 text-white hover:bg-red-600 border-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleEditSubmit}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-blue-500 text-white hover:from-emerald-600 hover:to-blue-600 border-0"
              >
                Update
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="glass-card bg-white/95 border-gray-300/50 sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="glass-text text-xl">Delete Allocation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="glass-text text-sm text-gray-700">
              Are you sure you want to delete the allocation for{" "}
              <span className="font-semibold">{selectedAllocation?.category}</span> (
              {selectedAllocation && currencyFormatter(budgetCurrency).format(selectedAllocation.amount)})?
            </p>
            <p className="glass-text text-xs text-gray-500">This action cannot be undone.</p>
            <div className="flex gap-3 pt-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedAllocation(null);
                }}
                className="glass-card flex-1 border border-gray-300/50 bg-gray-100/30 text-gray-900 hover:bg-gray-200/50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-500 text-white hover:bg-red-600 border-0"
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
