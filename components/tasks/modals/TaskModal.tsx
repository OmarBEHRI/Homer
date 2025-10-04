"use client";

import { useState, useEffect } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { PrioritySelector } from "../forms/PrioritySelector";
import { ColorSelector } from "../forms/ColorSelector";
import { DeadlinePicker } from "../forms/DeadlinePicker";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: {
    _id: Id<"tasks">;
    title: string;
    description?: string;
    deadline?: number;
    priority: "low" | "medium" | "high";
    color?: string;
    isCompleted: boolean;
    order?: number;
  } | null;
  listId?: Id<"lists"> | null;
  mode: "create" | "edit";
}

const predefinedColors = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#6b7280", // gray
];

export function TaskModal({ isOpen, onClose, task, listId, mode }: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [color, setColor] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const createTask = useMutation(api.tasks.createTask);
  const updateTask = useMutation(api.tasks.updateTask);

  useEffect(() => {
    if (mode === "edit" && task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setDeadline(task.deadline ? new Date(task.deadline) : undefined);
      setPriority(task.priority);
      setColor(task.color || "");
    } else {
      // Reset form for create mode
      setTitle("");
      setDescription("");
      setDeadline(undefined);
      setPriority("medium");
      setColor("");
    }
  }, [mode, task, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      if (mode === "create" && listId) {
        await createTask({
          listId,
          title: title.trim(),
          description: description.trim() || undefined,
          deadline: deadline?.getTime(),
          priority,
          color: color || undefined,
        });
      } else if (mode === "edit" && task) {
        await updateTask({
          taskId: task._id,
          title: title.trim(),
          description: description.trim() || undefined,
          deadline: deadline?.getTime(),
          priority,
          color: color || undefined,
        });
      }
      onClose();
    } catch (error) {
      console.error("Error saving task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Task" : "Edit Task"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <PrioritySelector
              value={priority}
              onChange={setPriority}
            />
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label>Deadline</Label>
            <DeadlinePicker
              value={deadline}
              onChange={setDeadline}
            />
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Color Tag</Label>
            <ColorSelector
              value={color}
              onChange={setColor}
              colors={predefinedColors}
            />
          </div>

          {/* Actions */}
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
              disabled={isLoading || !title.trim()}
            >
              {isLoading ? "Saving..." : mode === "create" ? "Create" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
