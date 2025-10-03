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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SpendingEvolutionChartProps {
  chartData: { date: string; spent: number }[];
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  periodOptions: { key: string; label: string }[];
  setIsModalOpen: (open: boolean) => void;
}

export default function SpendingEvolutionChart({
  chartData,
  selectedPeriod,
  setSelectedPeriod,
  periodOptions,
  setIsModalOpen,
}: SpendingEvolutionChartProps) {
  return (
    <Card className="glass-card flex flex-col overflow-hidden h-full rounded-xl bg-white">
      <CardHeader className="flex-shrink-0 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="glass-text text-lg font-semibold">Spending Evolution</CardTitle>
          <div className="flex flex-wrap items-center gap-1">
            {periodOptions.map((option) => (
              <Button
                key={option.key}
                variant="outline"
                size="sm"
                onClick={() => setSelectedPeriod(option.key)}
                className={`rounded-full border-gray-300 px-2.5 py-0.5 text-[11px] font-medium transition ${
                  selectedPeriod === option.key
                    ? "bg-gray-200 text-gray-900"
                    : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {option.label}
              </Button>
            ))}
            {/* Plus button for adding expenses */}
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="ml-2 h-8 w-8 rounded-full bg-black text-white flex items-center justify-center p-0 text-lg leading-none"
            >
              <span className="flex items-center justify-center w-full h-full">+</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden pb-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.5} />
            <XAxis dataKey="date" stroke="#6B7280" tick={{ fill: "#6B7280", fontSize: 10 }} />
            <YAxis
              stroke="#6B7280"
              tick={{ fill: "#6B7280", fontSize: 10 }}
              tickFormatter={(value: number) => `$${value.toFixed(0)}`}
            />
            <Tooltip
              formatter={(value: number) => [`$${value.toFixed(2)}`, "Spent"]}
              contentStyle={{
                background: "rgba(255, 255, 255, 0.98)",
                borderRadius: 12,
                border: "1px solid rgba(229, 231, 235, 0.8)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                color: "#111827",
                fontSize: "11px",
              }}
            />
            <Line type="monotone" dataKey="spent" stroke="#8B5CF6" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}