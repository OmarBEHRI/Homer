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
import { Check, Clock, AlertCircle, Circle, Edit2, Save, X } from "lucide-react";

interface InspectTaskModalProps {
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

const priorityIcons = {
  low: Circle,
  medium: Clock,
  high: AlertCircle,
};

const priorityColors = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-red-100 text-red-800 border-red-200",
};

export function InspectTaskModal({ isOpen, onClose, task }: InspectTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [color, setColor] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Editing states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingPriority, setIsEditingPriority] = useState(false);
  const [isEditingDeadline, setIsEditingDeadline] = useState(false);
  const [isEditingColor, setIsEditingColor] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const updateTask = useMutation(api.tasks.updateTask);
  const toggleCompletion = useMutation(api.tasks.toggleTaskCompletion);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setDeadline(task.deadline ? new Date(task.deadline) : undefined);
      setPriority(task.priority);
      setColor(task.color || "");
      setHasChanges(false);
      // Reset editing states
      setIsEditingTitle(false);
      setIsEditingDescription(false);
      setIsEditingPriority(false);
      setIsEditingDeadline(false);
      setIsEditingColor(false);
    }
  }, [task, isOpen]);

  const handleSave = async () => {
    if (!task || !hasChanges) return;

    setIsLoading(true);
    try {
      await updateTask({
        taskId: task._id,
        title: title.trim(),
        description: description.trim() || undefined,
        deadline: deadline?.getTime(),
        priority,
        color: color || undefined,
      });
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCompletion = async () => {
    if (!task) return;
    await toggleCompletion({ taskId: task._id });
  };

  const handleFieldChange = (field: string, value: any) => {
    setHasChanges(true);
    switch (field) {
      case 'title':
        setTitle(value);
        break;
      case 'description':
        setDescription(value);
        break;
      case 'priority':
        setPriority(value);
        break;
      case 'deadline':
        setDeadline(value);
        break;
      case 'color':
        setColor(value);
        break;
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const PriorityIcon = task ? priorityIcons[task.priority] : Circle;
  const deadlineStatus = task?.deadline ? getDeadlineStatus(task.deadline) : null;

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Task Details</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleCompletion}
              className="ml-auto"
            >
              {task.isCompleted ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Circle className="w-4 h-4 text-gray-400" />
              )}
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Title</Label>
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <Input
                  value={title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="flex-1"
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={() => setIsEditingTitle(false)}
                >
                  <Save className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setTitle(task.title);
                    setIsEditingTitle(false);
                    setHasChanges(false);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div 
                className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setIsEditingTitle(true)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">{title}</h3>
                  <Edit2 className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Description</Label>
            {isEditingDescription ? (
              <div className="space-y-2">
                <textarea
                  value={description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  placeholder="Enter task description..."
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => setIsEditingDescription(false)}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setDescription(task.description || "");
                      setIsEditingDescription(false);
                      setHasChanges(false);
                    }}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors min-h-[60px]"
                onClick={() => setIsEditingDescription(true)}
              >
                <div className="flex items-start justify-between">
                  <p className="text-gray-700 flex-1">
                    {description || "Click to add description..."}
                  </p>
                  <Edit2 className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
                </div>
              </div>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Priority</Label>
            {isEditingPriority ? (
              <div className="flex items-center gap-2">
                <PrioritySelector
                  value={priority}
                  onChange={(value) => handleFieldChange('priority', value)}
                />
                <Button
                  size="sm"
                  onClick={() => setIsEditingPriority(false)}
                >
                  <Save className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setPriority(task.priority);
                    setIsEditingPriority(false);
                    setHasChanges(false);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div 
                className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setIsEditingPriority(true)}
              >
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm border ${priorityColors[priority]}`}>
                    <PriorityIcon className="w-4 h-4" />
                    {priority}
                  </span>
                  <Edit2 className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            )}
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Deadline</Label>
            {isEditingDeadline ? (
              <div className="space-y-2">
                <DeadlinePicker
                  value={deadline}
                  onChange={(value) => handleFieldChange('deadline', value)}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => setIsEditingDeadline(false)}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setDeadline(task.deadline ? new Date(task.deadline) : undefined);
                      setIsEditingDeadline(false);
                      setHasChanges(false);
                    }}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setIsEditingDeadline(true)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    {deadline ? (
                      <div>
                        <p className="text-gray-900 font-medium">
                          {deadline.toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {deadline.toLocaleTimeString()}
                        </p>
                        {deadlineStatus && (
                          <p className={`text-xs mt-1 ${
                            deadlineStatus.status === "overdue" ? "text-red-600 font-medium" : ""
                          } ${deadlineStatus.status === "due-soon" ? "text-yellow-600 font-medium" : ""}
                          ${deadlineStatus.status === "normal" ? "text-gray-500" : ""}`}>
                            {deadlineStatus.message}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500">Click to set deadline...</p>
                    )}
                  </div>
                  <Edit2 className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            )}
          </div>

          {/* Color Tag */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Color Tag</Label>
            {isEditingColor ? (
              <div className="space-y-2">
                <ColorSelector
                  value={color}
                  onChange={(value) => handleFieldChange('color', value)}
                  colors={predefinedColors}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => setIsEditingColor(false)}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setColor(task.color || "");
                      setIsEditingColor(false);
                      setHasChanges(false);
                    }}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setIsEditingColor(true)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {color ? (
                      <>
                        <div 
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-gray-700">Color tag set</span>
                      </>
                    ) : (
                      <span className="text-gray-500">Click to set color tag...</span>
                    )}
                  </div>
                  <Edit2 className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            )}
          </div>

          {/* Save Changes Button */}
          {hasChanges && (
            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper function for deadline status
function getDeadlineStatus(deadline: number) {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffInHours = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 0) {
    return { status: "overdue", message: "Overdue" };
  } else if (diffInHours < 24) {
    return { status: "due-soon", message: "Due soon" };
  } else {
    return { status: "normal", message: "On time" };
  }
}
