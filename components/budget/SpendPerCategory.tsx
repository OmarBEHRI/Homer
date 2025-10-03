"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CategorySpending {
  category: string;
  amount: number;
}

interface SpendPerCategoryProps {
  categorySpending: CategorySpending[];
}

export default function SpendPerCategory({ categorySpending }: SpendPerCategoryProps) {
  return (
    <Card className="glass-card flex flex-col overflow-hidden h-full rounded-xl bg-white">
      <CardHeader className="flex-shrink-0 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="glass-text text-lg font-semibold">Spend Per Category (This Month)</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-2 pb-3">
        {categorySpending.length > 0 ? (
          categorySpending.map((item, index) => (
            <div key={index} className="flex justify-between items-center py-1">
              <span className="glass-text text-sm font-medium">{item.category}</span>
              <span className="glass-text text-sm font-bold">${item.amount.toFixed(2)}</span>
            </div>
          ))
        ) : (
          <p className="glass-text text-sm text-gray-500">No spending data available</p>
        )}
      </CardContent>
    </Card>
  );
}