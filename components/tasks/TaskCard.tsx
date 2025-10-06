"use client";

import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Check, Clock, AlertCircle, Circle, GripVertical } from "lucide-react";
import { getDeadlineStatus } from "./utils/dateUtils";
import { useDraggable } from "@dnd-kit/core";

interface TaskCardProps {
  task: {
    _id: Id<"tasks">;
    title: string;
    description?: string;
    deadline?: number;
    priority: "low" | "medium" | "high";
    color?: string;
    isCompleted: boolean;
  };
  onEdit: (taskId: Id<"tasks">) => void;
  onInspect: (taskId: Id<"tasks">) => void;
}

const priorityColors = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-red-100 text-red-800 border-red-200",
};

const priorityIcons = {
  low: Circle,
  medium: Clock,
  high: AlertCircle,
};

export function TaskCard({ task, onEdit, onInspect }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const toggleCompletion = useMutation(api.tasks.toggleTaskCompletion);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task._id,
    data: {
      type: 'task',
      task,
    },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const handleToggleCompletion = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleCompletion({ taskId: task._id });
  };

  const handleCardClick = () => {
    onInspect(task._id);
  };

  const PriorityIcon = priorityIcons[task.priority];
  const deadlineStatus = task.deadline ? getDeadlineStatus(task.deadline) : null;

  return (
    <Card
      ref={setNodeRef}
      style={{ 
        ...style,
        borderLeftColor: task.color, 
        borderLeftWidth: task.color ? "4px" : "0" 
      }}
      className={`
        p-3 cursor-pointer transition-all duration-200 hover:shadow-md
        ${task.isCompleted ? "opacity-60" : ""}
        ${deadlineStatus?.status === "overdue" && !task.isCompleted ? "border-red-300 bg-red-50" : ""}
        ${deadlineStatus?.status === "due-soon" && !task.isCompleted ? "border-yellow-300 bg-yellow-50" : ""}
        ${isDragging ? "opacity-50 shadow-lg" : ""}
      `}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium text-sm ${task.isCompleted ? "line-through" : ""}`}>
            {task.title}
          </h4>

          <div className="flex items-center gap-2 mt-2">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${priorityColors[task.priority]}`}>
              <PriorityIcon className="w-3 h-3" />
              {task.priority}
            </span>
            
            {deadlineStatus && (
              <span className={`
                text-xs 
                ${deadlineStatus.status === "overdue" ? "text-red-600 font-medium" : ""}
                ${deadlineStatus.status === "due-soon" ? "text-yellow-600 font-medium" : ""}
                ${deadlineStatus.status === "normal" ? "text-gray-500" : ""}
              `}>
                {deadlineStatus.message}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-6 w-6 hover:bg-gray-100"
            onClick={handleToggleCompletion}
          >
            {task.isCompleted ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Circle className="w-4 h-4 text-gray-400" />
            )}
          </Button>
          
          <div
            {...attributes}
            {...listeners}
            className="p-1 h-6 w-6 hover:bg-gray-100 cursor-grab active:cursor-grabbing flex items-center justify-center"
          >
            <GripVertical className="w-3 h-3 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Hover tooltip for deadline info */}
      {isHovered && task.deadline && (
        <div className="absolute bottom-full left-0 mb-2 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
          <div className="font-medium">Deadline</div>
          <div>{new Date(task.deadline).toLocaleString()}</div>
          {deadlineStatus && (
            <div className="mt-1">{deadlineStatus.message}</div>
          )}
        </div>
      )}
    </Card>
  );
}
