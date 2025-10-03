"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

import { addDays, endOfMonth, format, isAfter, parse, startOfMonth } from "date-fns";

type TabKey = "analytics" | "management" | "investments";

import AnalyticsTab from "./components/AnalyticsTab";
import ManagementTab from "./components/ManagementTab";
import BudgetTabs from "./components/BudgetTabs";
import InvestmentsTab from "./components/InvestmentsTab";

interface Expense {
  id: string;
  date: string;
  amount: number;
  category: string;
  description?: string;
}

interface Salary {
  monthlySalary: number;
  payDay: number;
}

interface Allocation {
  id: string;
  category: string;
  amount: number;
  description?: string;
}

interface CategorySpending {
  category: string;
  amount: number;
}

const periodOptions = [
  { key: "30", label: "30 Days" },
  { key: "90", label: "3 Months" },
  { key: "180", label: "6 Months" },
  { key: "365", label: "1 Year" },
  { key: "all", label: "All Time" }
];

const predefinedCategories = [
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
];

const makeLocalId = (prefix: string) => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const currencyFormatter = (currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  });

export default function BudgetPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("analytics");
  const [categories, setCategories] = useState<string[]>([...predefinedCategories]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({ amount: "", category: "", description: "", newCategory: "" });
  const [selectedPeriod, setSelectedPeriod] = useState<string>("30");
  const [budgetCurrency, setBudgetCurrency] = useState<string>("USD");

  // Convex queries and mutations (will return null/undefined if not authenticated)
  const convexAllocations = useQuery(api.budgetAllocations.getAllocationsForCurrentUser);
  const currentUser = useQuery(api.users.getCurrentUser);
  const convexExpenses = useQuery(api.expenses.getExpensesForCurrentUser);
  const categorySpendingData = useQuery(api.expenses.getTopCategoriesForCurrentMonth);
  const createAllocation = useMutation(api.budgetAllocations.createAllocation);
  const updateAllocation = useMutation(api.budgetAllocations.updateAllocation);
  const deleteAllocation = useMutation(api.budgetAllocations.deleteAllocation);
  const updateMrr = useMutation(api.users.updateMrr);
  const updateSalaryInfo = useMutation(api.users.updateSalaryInfo);
  const createExpense = useMutation(api.expenses.createExpense);

  // Transform Convex data to component format
  const allocations: Allocation[] = useMemo(() => {
    if (!convexAllocations) return [];
    return convexAllocations.map((allocation) => ({
      id: allocation._id,
      category: allocation.customCategoryLabel || allocation.category,
      amount: allocation.amount,
      description: allocation.description,
    }));
  }, [convexAllocations]);

  // Transform expenses from Convex
  const expenses: Expense[] = useMemo(() => {
    if (!convexExpenses) return [];
    return convexExpenses.map((expense) => ({
      id: expense._id,
      date: expense.date,
      amount: expense.amount,
      category: expense.customCategoryLabel || expense.category,
      description: expense.description,
    }));
  }, [convexExpenses]);

  // Transform category spending data from Convex
  const categorySpending: CategorySpending[] = useMemo(() => {
    if (!categorySpendingData) return [];
    return categorySpendingData;
  }, [categorySpendingData]);

  // Get salary info from user data
  const salary: Salary = useMemo(() => ({
    monthlySalary: currentUser?.mrr || 3200,
    payDay: currentUser?.payDay || 1,
  }), [currentUser?.mrr, currentUser?.payDay]);

  // Get monthly salary from user data
  const monthlySalary = currentUser?.mrr;

  const now = new Date();
  const nowTimestamp = now.getTime();

  const allCategories = useMemo(
    () =>
      Array.from(new Set([...categories, ...allocations.map((allocation) => allocation.category)])).sort((a, b) =>
        a.localeCompare(b),
      ),
    [categories, allocations],
  );

  const nextPayDate = useMemo(() => {
    const base = new Date(nowTimestamp);
    let candidate = parse(
      `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}-${String(salary.payDay).padStart(2, "0")}`,
      "yyyy-MM-dd",
      base,
    );

    if (isAfter(base, candidate) || candidate.getDate() !== salary.payDay) {
      candidate = parse(format(addDays(candidate, 32), "yyyy-MM-dd"), "yyyy-MM-dd", base);
    }

    return candidate;
  }, [nowTimestamp, salary.payDay]);

  const payDiffMs = Math.max(0, nextPayDate.getTime() - nowTimestamp);
  const totalHoursToPay = Math.floor(payDiffMs / (1000 * 60 * 60));
  const daysToPay = Math.floor(totalHoursToPay / 24);
  const hoursToPay = totalHoursToPay % 24;

  const currentMonthSpent = useMemo(() => {
    const start = startOfMonth(new Date(nowTimestamp));
    const end = endOfMonth(new Date(nowTimestamp));

    return expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= start && expenseDate <= end;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses, nowTimestamp]);

  const moneyLeft = useMemo(() => salary.monthlySalary - currentMonthSpent, [salary.monthlySalary, currentMonthSpent]);

  const chartData = useMemo(() => {
    const reference = new Date(nowTimestamp);

    if (!expenses.length && selectedPeriod === "all") {
      return Array.from({ length: 30 }, (_, index) => ({
        date: format(addDays(reference, -index), "MMM dd"),
        spent: Math.round(Math.random() * 150),
      })).reverse();
    }

    if (selectedPeriod === "all") {
      const byDay = new Map<string, number>();

      expenses.forEach((expense) => {
        const key = format(new Date(expense.date), "yyyy-MM-dd");
        byDay.set(key, (byDay.get(key) ?? 0) + expense.amount);
      });

      return Array.from(byDay.entries())
        .sort((a, b) => (a[0] < b[0] ? -1 : 1))
        .map(([dateKey, amount]) => ({
          date: format(new Date(dateKey), "MMM dd"),
          spent: amount,
        }));
    }

    const numericPeriod = parseInt(selectedPeriod, 10);
    const startDate = addDays(reference, -numericPeriod + 1);
    const data: { date: string; spent: number }[] = [];

    for (let offset = 0; offset < numericPeriod; offset += 1) {
      const iterDate = addDays(startDate, offset);
      const daySpent = expenses
        .filter((expense) => new Date(expense.date).toDateString() === iterDate.toDateString())
        .reduce((sum, expense) => sum + expense.amount, 0);

      data.push({
        date: format(iterDate, numericPeriod > 180 ? "MMM" : "MMM dd"),
        spent: daySpent,
      });
    }

    return data;
  }, [expenses, selectedPeriod, nowTimestamp]);

  const totalAllocated = useMemo(
    () => allocations.reduce((sum, allocation) => sum + allocation.amount, 0),
    [allocations],
  );

  const resetExpenseForm = () => setNewExpense({ amount: "", category: "", description: "", newCategory: "" });

  const addExpense = async () => {
    if (!newExpense.amount || (!newExpense.category && !newExpense.newCategory.trim())) {
      return;
    }

    const parsedAmount = parseFloat(newExpense.amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    const categoryLabel = newExpense.newCategory.trim() || newExpense.category;
    
    // Determine the category enum value
    let categoryEnum: any = categoryLabel;
    if (newExpense.newCategory.trim()) {
      categoryEnum = "Custom";
    }

    try {
      await createExpense({
        amount: parsedAmount,
        category: categoryEnum,
        customCategoryLabel: newExpense.newCategory.trim() || undefined,
        description: newExpense.description.trim() || undefined,
        date: new Date(nowTimestamp).toISOString().split('T')[0], // YYYY-MM-DD format
      });

      if (newExpense.newCategory.trim() && !categories.includes(categoryLabel)) {
        setCategories((previous) => [...previous, categoryLabel]);
      }

      setNewExpense({ amount: "", category: "", description: "", newCategory: "" });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating expense:", error);
      alert("Failed to create expense. Please try again.");
    }
  };

  const updateSalary = async (field: "monthlySalary" | "payDay", value: number) => {
    if (field === "payDay" && (Number.isNaN(value) || value < 1 || value > 31)) {
      return;
    }

    if (Number.isNaN(value)) {
      return;
    }

    try {
      if (field === "monthlySalary") {
        await updateSalaryInfo({ mrr: value });
      } else if (field === "payDay") {
        await updateSalaryInfo({ payDay: value });
      }
    } catch (error) {
      console.error("Error updating salary info:", error);
      alert("Failed to update salary info. Please try again.");
    }
  };

  const handleAllocationSubmit = async (allocation: {
    category: string;
    amount: number;
    description?: string;
    customCategoryLabel?: string;
  }) => {
    try {
      await createAllocation({
        category: allocation.category as any, // Type assertion for the enum
        amount: allocation.amount,
        description: allocation.description,
        customCategoryLabel: allocation.customCategoryLabel,
      });
    } catch (error) {
      console.error("Error creating allocation:", error);
      alert("Failed to create allocation. Please try again.");
    }
  };

  const handleUpdateMonthlySalary = async (amount: number) => {
    try {
      await updateMrr({ mrr: amount });
    } catch (error) {
      console.error("Error updating monthly salary:", error);
      alert("Failed to update monthly salary. Please try again.");
    }
  };

  // Define the CSS styles as a string
  const glassStyles = `
    @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

    .glass-card {
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.8);
      border-radius: 16px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      backdrop-filter: blur(8px);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .glass-card:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    .glass-text {
      font-family: 'Inter', sans-serif;
      color: rgba(17, 24, 39, 0.95);
      letter-spacing: 0.01em;
    }

    .tree-branch {
      position: relative;
      padding-left: 1.25rem;
    }

    .tree-branch::before {
      content: '';
      position: absolute;
      top: 0.8rem;
      left: 0.25rem;
      width: 1rem;
      height: 1px;
      background: rgba(156, 163, 175, 0.5);
    }

    .tree-branch::after {
      content: '';
      position: absolute;
      top: 0.8rem;
      left: 0.25rem;
      width: 1px;
      height: calc(100% - 0.8rem);
      background: linear-gradient(180deg, rgba(156, 163, 175, 0.4) 0%, rgba(156, 163, 175, 0.1) 100%);
    }
  `;

  return (
    <div className="relative min-h-screen px-4 pb-[120px] pt-6">
      <style>{glassStyles}</style>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 bg-transparent">
        <BudgetTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="h-[calc(100vh-190px)] overflow-hidden bg-transparent">
          {activeTab === "analytics" && (
            <AnalyticsTab
              chartData={chartData}
              selectedPeriod={selectedPeriod}
              setSelectedPeriod={setSelectedPeriod}
              periodOptions={periodOptions}
              moneyLeft={moneyLeft}
              daysToPay={daysToPay}
              hoursToPay={hoursToPay}
              salary={salary}
              currentMonthSpent={currentMonthSpent}
              updateSalary={updateSalary}
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
              newExpense={newExpense}
              setNewExpense={setNewExpense}
              allCategories={allCategories}
              addExpense={addExpense}
              resetExpenseForm={resetExpenseForm}
              isEditModalOpen={isEditModalOpen}
              setIsEditModalOpen={setIsEditModalOpen}
              categorySpending={categorySpending}
            />
          )}
          {activeTab === "management" && (
            <ManagementTab
              allocations={allocations}
              budgetCurrency={budgetCurrency}
              handleAllocationSubmit={handleAllocationSubmit}
              handleUpdateAllocation={async (params) => {
                await updateAllocation({
                  allocationId: params.allocationId as any,
                  amount: params.amount,
                  description: params.description,
                });
              }}
              handleDeleteAllocation={async (params) => {
                await deleteAllocation({
                  allocationId: params.allocationId as any,
                });
              }}
              currencyFormatter={currencyFormatter}
              monthlySalary={monthlySalary}
              onUpdateMonthlySalary={handleUpdateMonthlySalary}
            />
          )}
          {activeTab === "investments" && <InvestmentsTab />}
        </div>
      </div>
    </div>
  );
}