"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";

interface CreateTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTableCreated?: (tableId: string) => void;
}

export function CreateTableModal({ isOpen, onClose, onTableCreated }: CreateTableModalProps) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const createTable = useMutation(api.tasks.createTable);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      const tableId = await createTable({ name: name.trim() });
      setName("");
      onClose();
      onTableCreated?.(tableId);
    } catch (error) {
      console.error("Error creating table:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setName("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Table</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="tableName">Table Name *</Label>
            <Input
              id="tableName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter table name..."
              required
              autoFocus
            />
          </div>

          <div className="text-sm text-gray-600">
            A new table will be created with three default lists: To Do, In Progress, and Done.
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? "Creating..." : "Create Table"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
