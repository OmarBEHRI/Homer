"use client";

import SpendingEvolutionChart from "@/components/budget/SpendingEvolutionChart";
import FinancialPulse from "@/components/budget/FinancialPulse";
import SpendPerCategory from "@/components/budget/SpendPerCategory";
import LogSpendingModal from "@/components/budget/LogSpendingModal";

interface Salary {
  monthlySalary: number;
  payDay: number;
}

interface CategorySpending {
  category: string;
  amount: number;
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
  isEditModalOpen,
  setIsEditModalOpen,
  categorySpending,
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
  isEditModalOpen: boolean;
  setIsEditModalOpen: (open: boolean) => void;
  categorySpending: CategorySpending[];
}) {
  return (
    <div className="grid h-[90%] grid-cols-12 gap-3 overflow-hidden bg-transparent">
      <div className="col-span-12 xl:col-span-8 h-full">
        <SpendingEvolutionChart
          chartData={chartData}
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          periodOptions={periodOptions}
          setIsModalOpen={setIsModalOpen}
        />
      </div>

      <div className="col-span-12 xl:col-span-4 flex flex-col gap-3 h-full">
        <div className="flex-1">
          <FinancialPulse
            moneyLeft={moneyLeft}
            daysToPay={daysToPay}
            hoursToPay={hoursToPay}
            salary={salary}
            updateSalary={updateSalary}
            isEditModalOpen={isEditModalOpen}
            setIsEditModalOpen={setIsEditModalOpen}
          />
        </div>
        <div className="flex-1">
          <SpendPerCategory categorySpending={categorySpending} />
        </div>
      </div>

      <LogSpendingModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        newExpense={newExpense}
        setNewExpense={setNewExpense}
        allCategories={allCategories}
        addExpense={addExpense}
        resetExpenseForm={resetExpenseForm}
      />
    </div>
  );
}