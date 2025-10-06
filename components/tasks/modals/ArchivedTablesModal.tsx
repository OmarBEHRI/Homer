"use client";

import { useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Archive, RotateCcw, Trash2 } from "lucide-react";
import { ConfirmDialog } from "./ConfirmDialog";

interface ArchivedTablesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ArchivedTablesModal({ isOpen, onClose }: ArchivedTablesModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Id<"tables"> | null>(null);
  
  const archivedTables = useQuery(api.tasks.getArchivedTables);
  const unarchiveTable = useMutation(api.tasks.unarchiveTable);
  const deleteTable = useMutation(api.tasks.deleteTable);

  const handleUnarchive = async (tableId: Id<"tables">) => {
    await unarchiveTable({ tableId });
  };

  const handleDelete = async (tableId: Id<"tables">) => {
    await deleteTable({ tableId });
    setShowDeleteConfirm(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Archive className="w-5 h-5" />
              Archived Tables
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {archivedTables === undefined ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading archived tables...</p>
              </div>
            ) : archivedTables.length === 0 ? (
              <div className="text-center py-8">
                <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No archived tables</h3>
                <p className="text-gray-600">Tables you archive will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {archivedTables.map((table) => (
                  <Card key={table._id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{table.name}</h3>
                        <p className="text-sm text-gray-500">
                          Archived on {new Date(table.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnarchive(table._id)}
                          className="flex items-center gap-2"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Restore
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowDeleteConfirm(table._id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <ConfirmDialog
          isOpen={!!showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(null)}
          onConfirm={() => handleDelete(showDeleteConfirm)}
          title="Delete Table"
          description={`Are you sure you want to permanently delete "${archivedTables?.find(t => t._id === showDeleteConfirm)?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="destructive"
        />
      )}
    </>
  );
}

