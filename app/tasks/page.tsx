"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { TableSidebar } from "../../components/tasks/TableSidebar";
import { MainWorkspace } from "../../components/tasks/MainWorkspace";
import { MobileTableSelector } from "../../components/tasks/MobileTableSelector";
import { CreateTableModal } from "../../components/tasks/modals/CreateTableModal";
import { ArchivedTablesModal } from "../../components/tasks/modals/ArchivedTablesModal";
import { Settings } from "lucide-react";
import { Button } from "../../components/ui/button";

export default function TasksPage() {
  const [selectedTableId, setSelectedTableId] = useState<Id<"tables"> | undefined>(undefined);
  const [isCreateTableModalOpen, setIsCreateTableModalOpen] = useState(false);
  const [isArchivedTablesModalOpen, setIsArchivedTablesModalOpen] = useState(false);

  const tables = useQuery(api.tasks.getUserTables);
  const tableData = useQuery(
    api.tasks.getTableData,
    selectedTableId ? { tableId: selectedTableId } : "skip"
  );
  const updateTableLastSeen = useMutation(api.tasks.updateTableLastSeen);

  const handleSelectTable = (tableId: Id<"tables">) => {
    setSelectedTableId(tableId);
    // Update lastSeenAt when table is selected
    updateTableLastSeen({ tableId });
  };

  const handleCreateTable = () => {
    setIsCreateTableModalOpen(true);
  };

  const handleTableCreated = (tableId: string) => {
    const id = tableId as Id<"tables">;
    setSelectedTableId(id);
    // Update lastSeenAt for newly created table
    updateTableLastSeen({ tableId: id });
  };

  // Show loading state
  if (tables === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex pb-20">
      {/* Sidebar */}
      <div className="hidden md:block">
        <TableSidebar
          tables={tables}
          selectedTableId={selectedTableId}
          onSelectTable={handleSelectTable}
          onCreateTable={handleCreateTable}
          onOpenArchivedTables={() => setIsArchivedTablesModalOpen(true)}
        />
      </div>

      {/* Mobile Table Selector */}
      <MobileTableSelector
        tables={tables}
        selectedTableId={selectedTableId}
        onSelectTable={handleSelectTable}
        onCreateTable={handleCreateTable}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedTableId && tableData ? (
          <MainWorkspace
            table={tableData.table}
            lists={tableData.lists}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Welcome to Tasks
              </h2>
              <p className="text-gray-600 mb-6">
                Create your first table to start organizing your tasks and projects
              </p>
              <button
                onClick={handleCreateTable}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create Your First Table
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Table Modal */}
      <CreateTableModal
        isOpen={isCreateTableModalOpen}
        onClose={() => setIsCreateTableModalOpen(false)}
        onTableCreated={handleTableCreated}
      />

      {/* Archived Tables Modal */}
      <ArchivedTablesModal
        isOpen={isArchivedTablesModalOpen}
        onClose={() => setIsArchivedTablesModalOpen(false)}
      />
    </div>
  );
}
