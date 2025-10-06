"use client";

import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import { ConfirmDialog } from "./modals/ConfirmDialog";
import { Plus, Search, MoreHorizontal, Edit2, Trash2, Archive, Settings } from "lucide-react";

interface TableSidebarProps {
  tables: Array<{
    _id: Id<"tables">;
    name: string;
    createdAt: number;
  }>;
  selectedTableId?: Id<"tables">;
  onSelectTable: (tableId: Id<"tables">) => void;
  onCreateTable: () => void;
  onOpenArchivedTables: () => void;
}

export function TableSidebar({ 
  tables, 
  selectedTableId, 
  onSelectTable, 
  onCreateTable,
  onOpenArchivedTables
}: TableSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTableId, setEditingTableId] = useState<Id<"tables"> | null>(null);
  const [editName, setEditName] = useState("");
  const [showActions, setShowActions] = useState<Id<"tables"> | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Id<"tables"> | null>(null);
  
  const updateTable = useMutation(api.tasks.updateTable);
  const deleteTable = useMutation(api.tasks.deleteTable);
  const archiveTable = useMutation(api.tasks.archiveTable);

  const filteredTables = tables.filter(table =>
    table.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartEdit = (table: { _id: Id<"tables">; name: string }) => {
    setEditingTableId(table._id);
    setEditName(table.name);
    setShowActions(null);
  };

  const handleSaveEdit = async (tableId: Id<"tables">) => {
    if (editName.trim()) {
      await updateTable({ tableId, name: editName.trim() });
    }
    setEditingTableId(null);
    setEditName("");
  };

  const handleCancelEdit = () => {
    setEditingTableId(null);
    setEditName("");
  };

  const handleKeyPress = (e: React.KeyboardEvent, tableId: Id<"tables">) => {
    if (e.key === "Enter") {
      handleSaveEdit(tableId);
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleDeleteTable = async (tableId: Id<"tables">) => {
    await deleteTable({ tableId });
    setShowActions(null);
  };

  const handleArchiveTable = async (tableId: Id<"tables">) => {
    await archiveTable({ tableId });
    setShowActions(null);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Tables</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenArchivedTables}
            className="p-2 h-8 w-8"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search tables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Create Table Button */}
        <Button
          onClick={onCreateTable}
          className="w-full"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Table
        </Button>
      </div>

      {/* Tables List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredTables.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            {searchQuery ? "No tables found" : "No tables yet"}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredTables.map((table) => (
              <div key={table._id} className="relative">
                <Card
                  className={`
                    p-3 cursor-pointer transition-colors group
                    ${selectedTableId === table._id 
                      ? "bg-blue-50 border-blue-200" 
                      : "hover:bg-gray-50"
                    }
                  `}
                  onClick={() => onSelectTable(table._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      {editingTableId === table._id ? (
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onBlur={() => handleSaveEdit(table._id)}
                          onKeyDown={(e) => handleKeyPress(e, table._id)}
                          className="h-6 text-sm"
                          autoFocus
                        />
                      ) : (
                        <h3 className="font-medium text-sm truncate">
                          {table.name}
                        </h3>
                      )}
                    </div>

                    {editingTableId !== table._id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowActions(showActions === table._id ? null : table._id);
                        }}
                      >
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </Card>

                {/* Actions Menu */}
                {showActions === table._id && (
                  <div className="absolute right-2 top-12 bg-white border rounded-lg shadow-lg z-10 min-w-32">
                    <button
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(table);
                      }}
                    >
                      <Edit2 className="w-3 h-3" />
                      Rename
                    </button>
                    <button
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleArchiveTable(table._id);
                      }}
                    >
                      <Archive className="w-3 h-3" />
                      Archive
                    </button>
                    <button
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(table._id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <ConfirmDialog
          isOpen={!!showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(null)}
          onConfirm={() => handleDeleteTable(showDeleteConfirm)}
          title="Delete Table"
          description={`Are you sure you want to delete "${tables.find(t => t._id === showDeleteConfirm)?.name}"? This will permanently delete the table and all lists and tasks in it.`}
          confirmText="Delete"
          variant="destructive"
        />
      )}
    </div>
  );
}
