"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface Allocation {
  id: string;
  category: string;
  amount: number;
  description?: string;
}

export default function ManagementTab({
  budgetTotal,
  setBudgetTotal,
  budgetCurrency,
  setBudgetCurrency,
  budgetName,
  setBudgetName,
  totalAllocated,
  allocationStatus,
  allocations,
  allCategories,
  allocationForm,
  setAllocationForm,
  handleAllocationSubmit,
  handleAllocationEdit,
  handleAllocationDelete,
  currencyFormatter,
}: {
  budgetTotal: number;
  setBudgetTotal: (total: number) => void;
  budgetCurrency: string;
  setBudgetCurrency: (currency: string) => void;
  budgetName: string;
  setBudgetName: (name: string) => void;
  totalAllocated: number;
  allocationStatus: { remaining: number; percentage: number };
  allocations: Allocation[];
  allCategories: string[];
  allocationForm: { id: string; category: string; amount: string; description: string; newCategory: string };
  setAllocationForm: React.Dispatch<React.SetStateAction<typeof allocationForm>>;
  handleAllocationSubmit: () => void;
  handleAllocationEdit: (id: string) => void;
  handleAllocationDelete: (id: string) => void;
  currencyFormatter: (currency: string) => Intl.NumberFormat;
}) {
  return (
    <div className="grid h-full grid-cols-12 gap-2 overflow-hidden pb-6 pr-1 auto-rows-auto">
      <BudgetOverview
        budgetTotal={budgetTotal}
        setBudgetTotal={setBudgetTotal}
        budgetCurrency={budgetCurrency}
        setBudgetCurrency={setBudgetCurrency}
        budgetName={budgetName}
        setBudgetName={setBudgetName}
        totalAllocated={totalAllocated}
        allocationStatus={allocationStatus}
        currencyFormatter={currencyFormatter}
      />

      <DistributionTree
        allocations={allocations}
        budgetCurrency={budgetCurrency}
        handleAllocationEdit={handleAllocationEdit}
        handleAllocationDelete={handleAllocationDelete}
        currencyFormatter={currencyFormatter}
      />

      <AllocationFormComponent
        allCategories={allCategories}
        allocationForm={allocationForm}
        setAllocationForm={setAllocationForm}
        handleAllocationSubmit={handleAllocationSubmit}
      />

      <ManagementPlaybook />
    </div>
  );
}

function BudgetOverview({
  budgetTotal,
  setBudgetTotal,
  budgetCurrency,
  setBudgetCurrency,
  budgetName,
  setBudgetName,
  totalAllocated,
  allocationStatus,
  currencyFormatter,
}: {
  budgetTotal: number;
  setBudgetTotal: (total: number) => void;
  budgetCurrency: string;
  setBudgetCurrency: (currency: string) => void;
  budgetName: string;
  setBudgetName: (name: string) => void;
  totalAllocated: number;
  allocationStatus: { remaining: number; percentage: number };
  currencyFormatter: (currency: string) => Intl.NumberFormat;
}) {
  return (
    <Card className="glass-card col-span-12 lg:col-span-5 p-2">
      <CardHeader className="space-y-1 p-2">
        <CardTitle className="glass-text text-lg">Budget Overview</CardTitle>
        <p className="glass-text text-xs text-gray-600">
          Define how much you plan to manage this month, then watch your allocations fill the blueprint.
        </p>
      </CardHeader>
      <CardContent className="space-y-2 p-2">
        <div className="space-y-0.5">
          <Label htmlFor="budget-name" className="glass-text text-xs uppercase tracking-[0.34em] text-gray-600">
            Budget Name
          </Label>
          <Input
            id="budget-name"
            value={budgetName}
            onChange={(event) => setBudgetName(event.target.value)}
            className="glass-card border-gray-300/50 bg-gray-100/30 text-gray-900 placeholder:text-gray-500 h-7 text-xs"
          />
        </div>
        <div className="grid gap-1 sm:grid-cols-2">
          <div className="space-y-0.5">
            <Label htmlFor="budget-total" className="glass-text text-xs uppercase tracking-[0.34em] text-gray-600">
              Total Budget
            </Label>
            <Input
              id="budget-total"
              type="number"
              min={0}
              value={budgetTotal}
              onChange={(event) => setBudgetTotal(parseFloat(event.target.value) || 0)}
              className="glass-card border-gray-300/50 bg-gray-100/30 text-gray-900 placeholder:text-gray-500 h-7 text-xs"
            />
          </div>
          <div className="space-y-0.5">
            <Label className="glass-text text-xs uppercase tracking-[0.34em] text-gray-600">Currency</Label>
            <Select value={budgetCurrency} onValueChange={setBudgetCurrency}>
              <SelectTrigger className="glass-card border-gray-300/50 bg-gray-100/30 text-gray-900 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-50/80 text-gray-900 border-gray-300/50">
                {["USD", "EUR", "GBP", "MAD", "CAD", "AUD"].map((currency) => (
                  <SelectItem key={currency} value={currency} className="text-gray-900">
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="rounded-lg border border-gray-300/30 bg-gray-100/30 p-2">
          <p className="glass-text text-xs uppercase tracking-[0.45em] text-gray-500">Allocation Progress</p>
          <p className="glass-text text-xl font-semibold">
            {currencyFormatter(budgetCurrency).format(totalAllocated)}
            <span className="glass-text text-xs text-gray-500"> / {currencyFormatter(budgetCurrency).format(budgetTotal)}</span>
          </p>
          <div className="mt-1 h-1 overflow-hidden rounded bg-gray-200/50">
            <div
              className="h-full rounded bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400"
              style={{ width: `${allocationStatus.percentage}%` }}
            />
          </div>
          <p className="glass-text mt-1 text-xs text-gray-600">
            Remaining: {currencyFormatter(budgetCurrency).format(allocationStatus.remaining)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function DistributionTree({
  allocations,
  budgetCurrency,
  handleAllocationEdit,
  handleAllocationDelete,
  currencyFormatter,
}: {
  allocations: Allocation[];
  budgetCurrency: string;
  handleAllocationEdit: (id: string) => void;
  handleAllocationDelete: (id: string) => void;
  currencyFormatter: (currency: string) => Intl.NumberFormat;
}) {
  return (
    <Card className="glass-card col-span-12 lg:col-span-7 p-2">
      <CardHeader className="space-y-1 p-2">
        <CardTitle className="glass-text text-lg">Distribution Tree</CardTitle>
        <p className="glass-text text-xs text-gray-600">
          Your allocations flow like branches—grow categories to reflect your priorities and rebalance when needed.
        </p>
      </CardHeader>
      <CardContent className="space-y-1 p-2">
        {allocations.length === 0 && (
          <div className="rounded-lg border border-gray-300/30 bg-gray-100/30 p-2 text-center">
            <p className="glass-text text-xs text-gray-500">
              No allocations yet. Add your first branch to shape the budget tree.
            </p>
          </div>
        )}
        {allocations.map((allocation) => (
          <div key={allocation.id} className="glass-card tree-branch flex flex-col gap-0.5 rounded-lg border border-gray-300/30 bg-gray-100/30 p-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="glass-text text-sm font-semibold">{allocation.category}</p>
                <span className="glass-text text-xs uppercase tracking-[0.4em] text-gray-500">Allocation</span>
              </div>
              <p className="glass-text text-base font-semibold">
                {currencyFormatter(budgetCurrency).format(allocation.amount)}
              </p>
            </div>
            {allocation.description && (
              <p className="glass-text text-xs text-gray-600">{allocation.description}</p>
            )}
            <div className="flex gap-0.5">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAllocationEdit(allocation.id)}
                className="glass-card border border-gray-300/50 bg-gray-100/30 px-2 py-1 text-gray-900 hover:bg-gray-200/50 text-xs"
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAllocationDelete(allocation.id)}
                className="glass-card border border-gray-300/50 bg-red-100/30 px-2 py-1 text-red-600 hover:bg-red-200/50 text-xs"
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function AllocationFormComponent({
  allCategories,
  allocationForm,
  setAllocationForm,
  handleAllocationSubmit,
}: {
  allCategories: string[];
  allocationForm: { id: string; category: string; amount: string; description: string; newCategory: string };
  setAllocationForm: React.Dispatch<React.SetStateAction<typeof allocationForm>>;
  handleAllocationSubmit: () => void;
}) {
  return (
    <Card className="glass-card col-span-12 lg:col-span-6 p-2">
      <CardHeader className="space-y-0.5 p-2">
        <CardTitle className="glass-text text-lg">Add or Edit Allocation</CardTitle>
        <p className="glass-text text-xs text-gray-600">Plan how much should flow into each category of your budget.</p>
      </CardHeader>
      <CardContent className="space-y-2 p-2">
        <div className="grid gap-1 sm:grid-cols-2">
          <div className="space-y-0.5">
            <Label className="glass-text text-xs uppercase tracking-[0.34em] text-gray-600">Category</Label>
            <Select
              value={allocationForm.category}
              onValueChange={(value) => setAllocationForm((prev) => ({ ...prev, category: value }))}
            >
              <SelectTrigger className="glass-card border-gray-300/50 bg-gray-100/30 text-gray-900 h-7 text-xs">
                <SelectValue placeholder="Pick" />
              </SelectTrigger>
              <SelectContent className="bg-gray-50/80 text-gray-900 border-gray-300/50">
                {allCategories.map((category) => (
                  <SelectItem key={category} value={category} className="text-gray-900">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-0.5">
            <Label htmlFor="allocation-new-category" className="glass-text text-xs uppercase tracking-[0.34em] text-gray-600">
              New Category
            </Label>
            <Input
              id="allocation-new-category"
              placeholder="Custom label"
              value={allocationForm.newCategory}
              onChange={(event) =>
                setAllocationForm((prev) => ({ ...prev, newCategory: event.target.value }))
              }
              className="glass-card border-gray-300/50 bg-gray-100/30 text-gray-900 placeholder:text-gray-500 h-7 text-xs"
            />
          </div>
        </div>
        <div className="grid gap-1 sm:grid-cols-2">
          <div className="space-y-0.5">
            <Label htmlFor="allocation-amount" className="glass-text text-xs uppercase tracking-[0.34em] text-gray-600">
              Amount
            </Label>
            <Input
              id="allocation-amount"
              type="number"
              min={0}
              value={allocationForm.amount}
              onChange={(event) =>
                setAllocationForm((prev) => ({ ...prev, amount: event.target.value }))
              }
              className="glass-card border-gray-300/50 bg-gray-100/30 text-gray-900 placeholder:text-gray-500 h-7 text-xs"
            />
          </div>
          <div className="space-y-0.5">
            <Label htmlFor="allocation-description" className="glass-text text-xs uppercase tracking-[0.34em] text-gray-600">
              Notes
            </Label>
            <Input
              id="allocation-description"
              placeholder="Optional"
              value={allocationForm.description}
              onChange={(event) =>
                setAllocationForm((prev) => ({ ...prev, description: event.target.value }))
              }
              className="glass-card border-gray-300/50 bg-gray-100/30 text-gray-900 placeholder:text-gray-500 h-7 text-xs"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1 sm:flex-row">
          <Button
            variant="ghost"
            onClick={() =>
              setAllocationForm({ id: "", category: "", amount: "", description: "", newCategory: "" })
            }
            className="glass-card w-full border border-gray-300/50 bg-gray-100/30 px-3 py-1.5 text-gray-900 hover:bg-gray-200/50 text-xs"
          >
            Reset
          </Button>
          <Button
            onClick={handleAllocationSubmit}
            className="glass-card w-full bg-gradient-to-r from-emerald-400/90 to-blue-500/90 px-3 py-1.5 text-sm font-semibold text-white hover:from-emerald-400 hover:to-blue-500"
          >
            {allocationForm.id ? "Update Allocation" : "Add Allocation"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ManagementPlaybook() {
  const tips = [
    "Schedule a weekly review to check if allocations match reality.",
    "Keep savings, investments, and essentials at the top of your tree.",
    "Adjust categories after major life events or new financial goals.",
    "Use the analytics tab to validate if real spending aligns with your plan.",
  ];

  return (
    <Card className="glass-card col-span-12 lg:col-span-6 p-2">
      <CardHeader className="space-y-1 p-2">
        <CardTitle className="glass-text text-lg">Management Playbook</CardTitle>
        <p className="glass-text text-xs text-gray-600">
          Make the most of your allocations with a routine that keeps spending aligned with priorities.
        </p>
      </CardHeader>
      <CardContent className="space-y-1 p-2">
        {tips.map((tip) => (
          <div key={tip} className="glass-card rounded-lg border border-gray-300/30 bg-gray-100/30 p-2 text-left">
            <p className="glass-text text-xs text-gray-700">{tip}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}