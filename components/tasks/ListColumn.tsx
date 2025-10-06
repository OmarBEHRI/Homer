"use client";

import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { SortableTaskCard } from "./SortableTaskCard";
import { DropIndicator } from "./DropIndicator";
import { ConfirmDialog } from "./modals/ConfirmDialog";
import { Plus, MoreHorizontal, Edit2, Trash2 } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

interface ListColumnProps {
  list: {
    _id: Id<"lists">;
    name: string;
    order: number;
  };
  tasks: Array<{
    _id: Id<"tasks">;
    title: string;
    description?: string;
    deadline?: number;
    priority: "low" | "medium" | "high";
    color?: string;
    isCompleted: boolean;
    order: number;
  }>;
  onEditTask: (taskId: Id<"tasks">) => void;
  onInspectTask: (taskId: Id<"tasks">) => void;
  onCreateTask: (listId: Id<"lists">) => void;
  onEditList: (listId: Id<"lists">) => void;
  onDeleteList: (listId: Id<"lists">) => void;
  onMoveTask: (taskId: Id<"tasks">, newListId: Id<"lists">, newOrder: number) => void;
  activeTaskId?: Id<"tasks"> | null;
  overTaskId?: Id<"tasks"> | null;
  overListId?: Id<"lists"> | null;
}

export function ListColumn({ 
  list, 
  tasks, 
  onEditTask, 
  onInspectTask,
  onCreateTask, 
  onEditList, 
  onDeleteList,
  onMoveTask,
  activeTaskId,
  overTaskId,
  overListId
}: ListColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(list.name);
  const [showActions, setShowActions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const updateList = useMutation(api.tasks.updateList);

  const { setNodeRef, isOver } = useDroppable({
    id: list._id,
    data: {
      type: 'list',
      list,
    },
  });

  // Make the add task button area droppable too
  const { setNodeRef: setAddTaskNodeRef, isOver: isOverAddTask } = useDroppable({
    id: `add-task-${list._id}`,
    data: {
      type: 'list',
      list,
    },
  });

  const handleSaveEdit = async () => {
    if (editName.trim() && editName !== list.name) {
      await updateList({ listId: list._id, name: editName.trim() });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(list.name);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const completedTasks = tasks.filter(task => task.isCompleted).length;
  const totalTasks = tasks.length;

  return (
    <div 
      ref={setNodeRef}
      className={`flex flex-col w-72 md:w-80 bg-white rounded-lg border border-gray-200 shadow-sm flex-shrink-0 transition-colors ${
        isOver ? 'border-blue-300 bg-blue-50' : ''
      }`}
    >
      {/* List Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex-1">
          {isEditing ? (
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={handleKeyPress}
              className="h-8 text-sm font-medium"
              autoFocus
            />
          ) : (
            <h3 
              className="font-medium text-gray-900 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
              onClick={() => setIsEditing(true)}
            >
              {list.name}
            </h3>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Pie Chart for completion ratio - only show if there are tasks */}
          {totalTasks > 0 && (
            <div className="flex items-center gap-1">
              <div className="relative w-6 h-6">
                <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeDasharray={`${(completedTasks / totalTasks) * 62.83} 62.83`}
                    className="transition-all duration-300"
                  />
                </svg>
              </div>
              <span className="text-xs text-gray-500 font-medium">
                {completedTasks}/{totalTasks}
              </span>
            </div>
          )}

          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-6 w-6"
              onClick={() => setShowActions(!showActions)}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>

            {showActions && (
              <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg z-10 min-w-32">
                <button
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                  onClick={() => {
                    setIsEditing(true);
                    setShowActions(false);
                  }}
                >
                  <Edit2 className="w-3 h-3" />
                  Rename
                </button>
                <button
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
                  onClick={() => {
                    setShowDeleteConfirm(true);
                    setShowActions(false);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tasks Container */}
      <div className="flex-1 p-4 space-y-3 min-h-0">
        <SortableContext 
          items={tasks.map(task => task._id)} 
          strategy={verticalListSortingStrategy}
        >
          {tasks
            .sort((a, b) => a.order - b.order)
            .map((task, index) => {
              const isActive = activeTaskId === task._id;
              const isOver = overTaskId === task._id;
              const isOverThisList = overListId === list._id;
              const showDropIndicator = isOver && !isActive && isOverThisList;
              
              return (
                <div key={task._id} className="relative">
                  <DropIndicator 
                    isVisible={showDropIndicator && index === 0} 
                    position="top" 
                  />
                  <SortableTaskCard
                    task={{...task, listId: list._id}}
                    onEdit={onEditTask}
                    onInspect={onInspectTask}
                  />
                  <DropIndicator 
                    isVisible={showDropIndicator} 
                    position="bottom" 
                  />
                </div>
              );
            })}
        </SortableContext>
        
        {/* Drop indicator at the end of the list */}
        {overListId === list._id && overTaskId && !tasks.some(task => task._id === overTaskId) && (
          <DropIndicator isVisible={true} position="bottom" />
        )}
        
        {/* Drop indicator for empty list or when hovering over add task area */}
        {overListId === list._id && !overTaskId && (
          <DropIndicator isVisible={true} position="bottom" />
        )}
        
        {/* Add Task Button - positioned after tasks */}
        <div ref={setAddTaskNodeRef}>
          <Button
            variant="ghost"
            className={`w-full h-10 border-2 border-dashed text-gray-600 hover:text-gray-700 ${
              isOverAddTask 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
            onClick={() => onCreateTask(list._id)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add a task
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => onDeleteList(list._id)}
        title="Delete List"
        description={`Are you sure you want to delete "${list.name}"? This will permanently delete the list and all tasks in it.`}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
