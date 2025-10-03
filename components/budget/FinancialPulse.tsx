"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EditSalaryModal from "@/components/budget/EditSalaryModal";

interface Salary {
  monthlySalary: number;
  payDay: number;
}

interface FinancialPulseProps {
  moneyLeft: number;
  daysToPay: number;
  hoursToPay: number;
  salary: Salary;
  updateSalary: (field: "monthlySalary" | "payDay", value: number) => void;
  isEditModalOpen: boolean;
  setIsEditModalOpen: (open: boolean) => void;
}

export default function FinancialPulse({
  moneyLeft,
  daysToPay,
  hoursToPay,
  salary,
  updateSalary,
  isEditModalOpen,
  setIsEditModalOpen,
}: FinancialPulseProps) {
  return (
    <>
      <Card className="glass-card flex flex-col overflow-hidden h-full rounded-xl bg-white">
        <CardHeader className="flex-shrink-0 pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="glass-text text-lg font-semibold">Financial Pulse</CardTitle>
            {/* Edit button for salary info */}
            <Button 
              onClick={() => setIsEditModalOpen(true)}
              className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center p-0 text-lg leading-none"
            >
              <span className="flex items-center justify-center w-full h-full">✎</span>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-1.5 text-left sm:grid-cols-2 xl:grid-cols-1 mt-2">
            <div className="rounded-lg border border-gray-300/50 bg-gray-100/50 p-2">
              <p className="glass-text text-[9px] uppercase tracking-wide text-gray-500">Money Left</p>
              <p className="glass-text text-xl font-bold">${Math.max(moneyLeft, 0).toFixed(2)}</p>
              <span className="glass-text text-[9px] text-gray-500">This month</span>
            </div>
            <div className="rounded-lg border border-gray-300/50 bg-gray-100/50 p-2">
              <p className="glass-text text-[9px] uppercase tracking-wide text-gray-500">Countdown</p>
              <p className="glass-text text-xl font-bold">{daysToPay}d {hoursToPay}h</p>
              <span className="glass-text text-[9px] text-gray-500">Until payday</span>
            </div>
            <div className="rounded-lg border border-gray-300/50 bg-gray-100/50 p-2 sm:col-span-2 xl:col-span-1">
              <p className="glass-text text-[9px] uppercase tracking-wide text-gray-500">Monthly Income</p>
              <p className="glass-text text-xl font-bold">${salary.monthlySalary.toFixed(2)}</p>
              <span className="glass-text text-[9px] text-gray-500">Pay Day: {salary.payDay}</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      <EditSalaryModal
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        salary={salary}
        updateSalary={updateSalary}
      />
    </>
  );
}