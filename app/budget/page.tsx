"use client";

import { useEffect, useMemo, useState } from "react";

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

const periodOptions = [
  { key: "30", label: "30 Days" },
  { key: "90", label: "3 Months" },
  { key: "180", label: "6 Months" },
  { key: "365", label: "1 Year" },
  { key: "all", label: "All Time" },
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
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [salary, setSalary] = useState<Salary>({ monthlySalary: 3200, payDay: 1 });
  const [categories, setCategories] = useState<string[]>([...predefinedCategories]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({ amount: "", category: "", description: "", newCategory: "" });
  const [selectedPeriod, setSelectedPeriod] = useState<string>("30");
  const [imageHref, setImageHref] = useState<string>("");
  const [budgetTotal, setBudgetTotal] = useState<number>(4500);
  const [budgetCurrency, setBudgetCurrency] = useState<string>("USD");
  const [budgetName, setBudgetName] = useState<string>("Household Control Center");
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [allocationForm, setAllocationForm] = useState({ id: "", category: "", amount: "", description: "", newCategory: "" });

  useEffect(() => {
    fetch("https://essykings.github.io/JavaScript/map.png")
      .then((response) => response.blob())
      .then((blob) => {
        const objURL = URL.createObjectURL(blob);
        setImageHref(objURL);
      })
      .catch(() => {
        // Background map is optional; swallow network errors silently.
      });
  }, []);

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

  const allocationStatus = useMemo(() => {
    const remaining = budgetTotal - totalAllocated;
    const fill = budgetTotal === 0 ? 0 : Math.min(100, Math.max(0, (totalAllocated / budgetTotal) * 100));

    return {
      remaining,
      percentage: fill,
    };
  }, [budgetTotal, totalAllocated]);

  const recentExpenses = useMemo(() => [...expenses].sort((a, b) => (a.date > b.date ? -1 : 1)).slice(0, 5), [expenses]);

  const resetExpenseForm = () => setNewExpense({ amount: "", category: "", description: "", newCategory: "" });

  const addExpense = () => {
    if (!newExpense.amount || (!newExpense.category && !newExpense.newCategory.trim())) {
      return;
    }

    const parsedAmount = parseFloat(newExpense.amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    const categoryLabel = newExpense.newCategory.trim() || newExpense.category;
    const expense: Expense = {
      id: makeLocalId("expense"),
      date: new Date(nowTimestamp).toISOString(),
      amount: parsedAmount,
      category: categoryLabel,
      description: newExpense.description.trim() || undefined,
    };

    setExpenses((previous) => [...previous, expense]);

    if (newExpense.newCategory.trim() && !categories.includes(categoryLabel)) {
      setCategories((previous) => [...previous, categoryLabel]);
    }

    setNewExpense({ amount: "", category: "", description: "", newCategory: "" });
    setIsModalOpen(false);
  };

  const updateSalary = (field: "monthlySalary" | "payDay", value: number) => {
    if (field === "payDay" && (Number.isNaN(value) || value < 1 || value > 31)) {
      return;
    }

    setSalary((previous) => ({ ...previous, [field]: Number.isNaN(value) ? previous[field] : value }));
  };

  const handleAllocationSubmit = () => {
    if (!allocationForm.amount || (!allocationForm.category && !allocationForm.newCategory.trim())) {
      return;
    }

    const parsedAmount = parseFloat(allocationForm.amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    const label = allocationForm.newCategory.trim() || allocationForm.category;
    const payload: Allocation = {
      id: allocationForm.id || makeLocalId("allocation"),
      category: label,
      amount: parsedAmount,
      description: allocationForm.description.trim() || undefined,
    };

    setAllocations((previous) => {
      if (allocationForm.id) {
        return previous.map((entry) => (entry.id === allocationForm.id ? payload : entry));
      }
      return [...previous, payload];
    });

    if (allocationForm.newCategory.trim() && !categories.includes(label)) {
      setCategories((prev) => [...prev, label]);
    }

    setAllocationForm({ id: "", category: "", amount: "", description: "", newCategory: "" });
  };

  const handleAllocationEdit = (id: string) => {
    const match = allocations.find((entry) => entry.id === id);
    if (!match) {
      return;
    }

    setAllocationForm({
      id: match.id,
      category: match.category,
      amount: String(match.amount),
      description: match.description ?? "",
      newCategory: "",
    });
  };

  const handleAllocationDelete = (id: string) => {
    setAllocations((previous) => previous.filter((entry) => entry.id !== id));
  };

  return (
    <div
      className="relative min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4 pb-[120px] pt-6"
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1683657535824-5b570c7a1749?q=80&w=1200&auto=format&fit=cover&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
        backgroundSize: "cover",
        animation: "floatBG 18s ease-in-out infinite",
      }}
    >
      <style>{`
        @keyframes floatBG {
          0%, 100% { background-position: center center; }
          25% { background-position: 28% 68%; }
          50% { background-position: 70% 32%; }
          75% { background-position: 40% 60%; }
        }

        @import url("https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700&display=swap");

        .glass-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 255, 255, 0.14) 45%, rgba(255, 255, 255, 0.06) 100%);
          border: 1px solid rgba(255, 255, 255, 0.38);
          border-radius: 22px;
          box-shadow: 0 18px 38px rgba(15, 23, 42, 0.28);
          backdrop-filter: blur(16px);
          transition: transform 0.3s ease, border-color 0.3s ease;
        }

        .glass-card:hover {
          transform: translateY(-4px);
          border-color: rgba(180, 198, 255, 0.65);
        }

        .glass-text {
          font-family: 'Orbitron', monospace;
          color: rgba(255, 255, 255, 0.94);
          text-shadow: 0 10px 18px rgba(15, 15, 45, 0.38);
          letter-spacing: 0.02em;
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
          background: rgba(255, 255, 255, 0.35);
        }

        .tree-branch::after {
          content: '';
          position: absolute;
          top: 0.8rem;
          left: 0.25rem;
          width: 1px;
          height: calc(100% - 0.8rem);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.32) 0%, rgba(255, 255, 255, 0.05) 100%);
        }
      `}</style>

      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <filter id="glass" x="-50%" y="-50%" width="200%" height="200%" primitiveUnits="objectBoundingBox">
          {imageHref && <feImage href={imageHref} x="-50%" y="-50%" width="200%" height="200%" result="map" />}
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.02" result="blur" />
          <feDisplacementMap in="blur" in2={imageHref ? "map" : "SourceGraphic"} scale="0.85" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <BudgetTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="h-[calc(100vh-190px)] overflow-hidden">
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
              recentExpenses={recentExpenses}
            />
          )}
          {activeTab === "management" && (
            <ManagementTab
              budgetTotal={budgetTotal}
              setBudgetTotal={setBudgetTotal}
              budgetCurrency={budgetCurrency}
              setBudgetCurrency={setBudgetCurrency}
              budgetName={budgetName}
              setBudgetName={setBudgetName}
              totalAllocated={totalAllocated}
              allocationStatus={allocationStatus}
              allocations={allocations}
              allCategories={allCategories}
              allocationForm={allocationForm}
              setAllocationForm={setAllocationForm}
              handleAllocationSubmit={handleAllocationSubmit}
              handleAllocationEdit={handleAllocationEdit}
              handleAllocationDelete={handleAllocationDelete}
              currencyFormatter={currencyFormatter}
            />
          )}
          {activeTab === "investments" && <InvestmentsTab />}
        </div>
      </div>
    </div>
  );
}
