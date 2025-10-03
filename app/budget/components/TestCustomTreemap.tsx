"use client";

import { useState } from "react";
import CustomTreemap from "@/components/budget/CustomTreemap";

const TestCustomTreemap = () => {
  const [data] = useState([
    { name: "Housing", size: 1500, isUnallocated: false, allocation: { id: "1", category: "Housing", amount: 1500 } },
    { name: "Food", size: 600, isUnallocated: false, allocation: { id: "2", category: "Food", amount: 600 } },
    { name: "Transport", size: 300, isUnallocated: false, allocation: { id: "3", category: "Transport", amount: 300 } },
    { name: "Entertainment", size: 200, isUnallocated: false, allocation: { id: "4", category: "Entertainment", amount: 200 } },
    { name: "Coffee", size: 50, isUnallocated: false, allocation: { id: "5", category: "Coffee", amount: 50 } },
    { name: "Snacks", size: 30, isUnallocated: false, allocation: { id: "6", category: "Snacks", amount: 30 } },
    { name: "Unallocated", size: 1320, isUnallocated: true, allocation: null },
  ]);

  const currencyFormatter = (currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    });
  };

  const handleAllocationClick = (allocation: any) => {
    console.log("Edit allocation:", allocation);
    alert(`Editing allocation: ${allocation?.category || "Unallocated"}`);
  };

  const handleDeleteClick = (allocation: any) => {
    console.log("Delete allocation:", allocation);
    alert(`Deleting allocation: ${allocation?.category || "Unallocated"}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Custom Treemap Test</h1>
      <p className="mb-4 text-gray-600">Large allocations show text directly. Small allocations like "Coffee" and "Snacks" show tooltips on hover.</p>
      <div className="w-full h-96 border rounded-lg overflow-hidden">
        <CustomTreemap
          data={data}
          currencyFormatter={currencyFormatter}
          budgetCurrency="USD"
          onAllocationClick={handleAllocationClick}
          onDeleteClick={handleDeleteClick}
        />
      </div>
    </div>
  );
};

export default TestCustomTreemap;