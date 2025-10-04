"use client";

import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Plus } from "lucide-react";

interface MobileTableSelectorProps {
  tables: Array<{
    _id: Id<"tables">;
    name: string;
    createdAt: number;
  }>;
  selectedTableId?: Id<"tables">;
  onSelectTable: (tableId: Id<"tables">) => void;
  onCreateTable: () => void;
}

export function MobileTableSelector({ 
  tables, 
  selectedTableId, 
  onSelectTable, 
  onCreateTable 
}: MobileTableSelectorProps) {
  const selectedTable = tables.find(table => table._id === selectedTableId);

  return (
    <div className="md:hidden p-4 bg-white border-b border-gray-200">
      <div className="flex items-center gap-2">
        <Select
          value={selectedTableId || ""}
          onValueChange={(value) => onSelectTable(value as Id<"tables">)}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select a table">
              {selectedTable?.name || "Select a table"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {tables.map((table) => (
              <SelectItem key={table._id} value={table._id}>
                {table.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button
          onClick={onCreateTable}
          size="sm"
          className="px-3"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
