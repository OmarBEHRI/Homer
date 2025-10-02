"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";


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


export default function AnalyticsTab({
  chartData,
  selectedPeriod,
  setSelectedPeriod,
  periodOptions,
  moneyLeft,
  daysToPay,
  hoursToPay,
  salary,
  currentMonthSpent,
  updateSalary,
  isModalOpen,
  setIsModalOpen,
  newExpense,
  setNewExpense,
  allCategories,
  addExpense,
  resetExpenseForm,
  recentExpenses,
}: {
  chartData: { date: string; spent: number }[];
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  periodOptions: { key: string; label: string }[];
  moneyLeft: number;
  daysToPay: number;
  hoursToPay: number;
  salary: Salary;
  currentMonthSpent: number;
  updateSalary: (field: "monthlySalary" | "payDay", value: number) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  newExpense: { amount: string; category: string; description: string; newCategory: string };
  setNewExpense: React.Dispatch<React.SetStateAction<typeof newExpense>>;
  allCategories: string[];
  addExpense: () => void;
  resetExpenseForm: () => void;
  recentExpenses: Expense[];
}) {
  return (
    <div className="grid h-full grid-cols-12 gap-5 overflow-y-auto pb-16 pr-2 auto-rows-[minmax(220px,1fr)]">
      <Card className="glass-card col-span-12 xl:col-span-8">
        <CardHeader className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle className="glass-text text-2xl font-semibold">Spending Evolution</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              {periodOptions.map((option) => (
                <Button
                  key={option.key}
                  variant="outline"
                  onClick={() => setSelectedPeriod(option.key)}
                  className={`rounded-full border-white/20 px-4 py-2 text-sm font-semibold uppercase tracking-wide transition ${
                    selectedPeriod === option.key
                      ? "bg-white/30 text-white"
                      : "bg-transparent text-white/70 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
          <p className="glass-text text-sm text-white/70">
            Monitor your daily spending momentum. Toggle time spans to spot trends and anticipate cash flow needs.
          </p>
        </CardHeader>
        <CardContent className="h-full pb-8">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F8FAFC" strokeOpacity={0.2} />
              <XAxis dataKey="date" stroke="#F8FAFC" tick={{ fill: "rgba(255,255,255,0.8)", fontFamily: "Orbitron" }} />
              <YAxis
                stroke="#F8FAFC"
                tick={{ fill: "rgba(255,255,255,0.8)", fontFamily: "Orbitron" }}
                tickFormatter={(value: number) => `$${value.toFixed(0)}`}
              />
              <Tooltip
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Spent"]}
                contentStyle={{
                  background: "rgba(15, 23, 42, 0.82)",
                  borderRadius: 18,
                  border: "1px solid rgba(148, 163, 184, 0.38)",
                  backdropFilter: "blur(14px)",
                  color: "#fff",
                }}
              />
              <Line type="monotone" dataKey="spent" stroke="#A855F7" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <FinancialPulse
        moneyLeft={moneyLeft}
        daysToPay={daysToPay}
        hoursToPay={hoursToPay}
        salary={salary}
        currentMonthSpent={currentMonthSpent}
        updateSalary={updateSalary}
      />

      <LogSpendingModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        newExpense={newExpense}
        setNewExpense={setNewExpense}
        allCategories={allCategories}
        addExpense={addExpense}
        resetExpenseForm={resetExpenseForm}
      />

      <RecentExpenses recentExpenses={recentExpenses} />
    </div>
  );
}

function FinancialPulse({
  moneyLeft,
  daysToPay,
  hoursToPay,
  salary,
  currentMonthSpent,
  updateSalary,
}: {
  moneyLeft: number;
  daysToPay: number;
  hoursToPay: number;
  salary: Salary;
  currentMonthSpent: number;
  updateSalary: (field: "monthlySalary" | "payDay", value: number) => void;
}) {
  return (
    <Card className="glass-card col-span-12 xl:col-span-4">
      <CardHeader className="space-y-4">
        <CardTitle className="glass-text text-2xl">Financial Pulse</CardTitle>
        <div className="grid grid-cols-1 gap-4 text-left sm:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
            <p className="glass-text text-xs uppercase tracking-[0.4em] text-white/70">Money Left</p>
            <p className="glass-text text-3xl font-bold">${Math.max(moneyLeft, 0).toFixed(2)}</p>
            <span className="glass-text text-xs text-white/60">Projection for current month</span>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
            <p className="glass-text text-xs uppercase tracking-[0.4em] text-white/70">Countdown</p>
            <p className="glass-text text-3xl font-bold">{daysToPay}d {hoursToPay}h</p>
            <span className="glass-text text-xs text-white/60">Until next payday</span>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 sm:col-span-2 xl:col-span-1">
            <p className="glass-text text-xs uppercase tracking-[0.4em] text-white/70">Monthly Income</p>
            <p className="glass-text text-3xl font-bold">${salary.monthlySalary.toFixed(2)}</p>
            <span className="glass-text text-xs text-white/60">Adjust to reflect your MRR</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="monthly-income" className="glass-text text-xs uppercase tracking-[0.42em] text-white/80">
              Monthly Income
            </Label>
            <Input
              id="monthly-income"
              type="number"
              min={0}
              value={salary.monthlySalary}
              onChange={(event) => updateSalary("monthlySalary", parseFloat(event.target.value))}
              className="glass-card border-white/20 bg-white/10 text-white placeholder:text-white/60"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pay-day" className="glass-text text-xs uppercase tracking-[0.42em] text-white/80">
              Pay Day
            </Label>
            <Input
              id="pay-day"
              type="number"
              min={1}
              max={31}
              value={salary.payDay}
              onChange={(event) => updateSalary("payDay", parseFloat(event.target.value))}
              className="glass-card border-white/20 bg-white/10 text-white placeholder:text-white/60"
            />
          </div>
        </div>
        <div className="rounded-2xl border border-white/20 bg-white/10 p-3">
          <p className="glass-text text-xs uppercase tracking-[0.45em] text-white/60">Current Month Spend</p>
          <p className="glass-text text-2xl font-semibold">${currentMonthSpent.toFixed(2)}</p>
        </div>
      </CardContent>
    </Card>
  );
}


function LogSpendingModal({
  isModalOpen,
  setIsModalOpen,
  newExpense,
  setNewExpense,
  allCategories,
  addExpense,
  resetExpenseForm,
}: {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  newExpense: { amount: string; category: string; description: string; newCategory: string };
  setNewExpense: React.Dispatch<React.SetStateAction<typeof newExpense>>;
  allCategories: string[];
  addExpense: () => void;
  resetExpenseForm: () => void;
}) {
  return (
    <Card className="glass-card col-span-12 md:col-span-6">
      <CardHeader className="flex flex-col gap-2">
        <CardTitle className="glass-text text-2xl">Log Today's Spending</CardTitle>
        <p className="glass-text text-sm text-white/70">Capture today's outflow to keep insights razor sharp and accurate.</p>
      </CardHeader>
      <CardContent>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="glass-card glass-text flex w-full items-center justify-center rounded-2xl px-6 py-4 text-lg font-semibold">
              Log Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card max-w-lg border-white/30 bg-slate-900/60 p-8">
            <DialogHeader>
              <DialogTitle className="glass-text text-2xl">Add Expense</DialogTitle>
              <DialogDescription className="text-white/70">
                Provide the essentials of today's purchase. You can manage details later from the management tab.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="expense-amount" className="glass-text text-xs uppercase tracking-[0.34em] text-white/70">
                  Amount
                </Label>
                <Input
                  id="expense-amount"
                  type="number"
                  min={0}
                  placeholder="e.g. 42.75"
                  value={newExpense.amount}
                  onChange={(event) => setNewExpense((prev) => ({ ...prev, amount: event.target.value }))}
                  className="glass-card border-white/30 bg-white/10 text-white placeholder:text-white/60"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="glass-text text-xs uppercase tracking-[0.34em] text-white/70">Category</Label>
                  <Select
                    value={newExpense.category}
                    onValueChange={(value) => setNewExpense((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="glass-card border-white/30 bg-white/10 text-left text-white">
                      <SelectValue placeholder="Pick a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900/80 backdrop-blur">
                      {allCategories.map((category) => (
                        <SelectItem key={category} value={category} className="text-white">
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expense-new-category" className="glass-text text-xs uppercase tracking-[0.34em] text-white/70">
                    Or New Category
                  </Label>
                  <Input
                    id="expense-new-category"
                    placeholder="Create new"
                    value={newExpense.newCategory}
                    onChange={(event) =>
                      setNewExpense((prev) => ({ ...prev, newCategory: event.target.value }))
                    }
                    className="glass-card border-white/30 bg-white/10 text-white placeholder:text-white/60"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-description" className="glass-text text-xs uppercase tracking-[0.34em] text-white/70">
                  Description (optional)
                </Label>
                <Input
                  id="expense-description"
                  placeholder="Short memo"
                  value={newExpense.description}
                  onChange={(event) => setNewExpense((prev) => ({ ...prev, description: event.target.value }))}
                  className="glass-card border-white/30 bg-white/10 text-white placeholder:text-white/60"
                />
              </div>
            </div>
            <DialogFooter className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                variant="ghost"
                onClick={resetExpenseForm}
                className="glass-card w-full border border-white/20 bg-white/10 px-6 py-3 text-white hover:bg-white/20"
              >
                Clear
              </Button>
              <Button
                onClick={addExpense}
                className="glass-card w-full bg-gradient-to-r from-purple-500/90 to-indigo-500/90 px-6 py-3 text-lg font-semibold text-white hover:from-purple-500 hover:to-indigo-500"
              >
                Save Expense
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function RecentExpenses({ recentExpenses }: { recentExpenses: Expense[] }) {
  return (
    <Card className="glass-card col-span-12 md:col-span-6">
      <CardHeader className="flex flex-col gap-2">
        <CardTitle className="glass-text text-2xl">Recent Activity</CardTitle>
        <p className="glass-text text-sm text-white/70">Latest transactions keep you aware of spending patterns.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentExpenses.length === 0 && (
          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-center">
            <p className="glass-text text-sm text-white/60">No expenses logged yet. Start by adding today's spending.</p>
          </div>
        )}
        {recentExpenses.map((expense) => (
          <div key={expense.id} className="glass-card flex items-center justify-between rounded-2xl border border-white/20 bg-white/10 px-4 py-3">
            <div>
              <p className="glass-text text-sm font-semibold">{expense.category}</p>
              <span className="glass-text text-xs text-white/60">
                {format(new Date(expense.date), "MMM dd, yyyy")} • {expense.description || "No memo"}
              </span>
            </div>
            <p className="glass-text text-lg font-bold">-${expense.amount.toFixed(2)}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}