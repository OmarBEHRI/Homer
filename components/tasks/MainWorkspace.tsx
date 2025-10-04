"use client";

import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "../ui/button";
import { ListColumn } from "./ListColumn";
import { TaskModal } from "./modals/TaskModal";
import { InspectTaskModal } from "./modals/InspectTaskModal";
import { CreateListModal } from "./modals/CreateListModal";
import { Plus } from "lucide-react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, DragOverEvent, closestCenter, pointerWithin, rectIntersection, closestCorners } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

interface MainWorkspaceProps {
  table: {
    _id: Id<"tables">;
    name: string;
  };
  lists: Array<{
    _id: Id<"lists">;
    name: string;
    order: number;
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
  }>;
}

export function MainWorkspace({ table, lists }: MainWorkspaceProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<Id<"tasks"> | null>(null);
  const [selectedListId, setSelectedListId] = useState<Id<"lists"> | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isInspectModalOpen, setIsInspectModalOpen] = useState(false);
  const [isCreateListModalOpen, setIsCreateListModalOpen] = useState(false);
  const [taskModalMode, setTaskModalMode] = useState<"create" | "edit">("create");
  const [activeTask, setActiveTask] = useState<any>(null);
  const [activeTaskId, setActiveTaskId] = useState<Id<"tasks"> | null>(null);
  const [overTaskId, setOverTaskId] = useState<Id<"tasks"> | null>(null);
  const [overListId, setOverListId] = useState<Id<"lists"> | null>(null);

  const deleteList = useMutation(api.tasks.deleteList);
  const moveTask = useMutation(api.tasks.moveTask);

  const handleEditTask = (taskId: Id<"tasks">) => {
    setSelectedTaskId(taskId);
    setTaskModalMode("edit");
    setIsTaskModalOpen(true);
  };

  const handleInspectTask = (taskId: Id<"tasks">) => {
    setSelectedTaskId(taskId);
    setIsInspectModalOpen(true);
  };

  const handleCreateTask = (listId: Id<"lists">) => {
    setSelectedListId(listId);
    setSelectedTaskId(null);
    setTaskModalMode("create");
    setIsTaskModalOpen(true);
  };

  const handleEditList = (listId: Id<"lists">) => {
    // This could open a separate modal for editing list name
    // For now, we'll use inline editing in ListColumn
  };

  const handleDeleteList = async (listId: Id<"lists">) => {
    await deleteList({ listId });
  };

  const handleMoveTask = async (taskId: Id<"tasks">, newListId: Id<"lists">, newOrder: number) => {
    await moveTask({ taskId, newListId, newOrder });
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setSelectedTaskId(null);
    setSelectedListId(null);
  };

  const handleCloseInspectModal = () => {
    setIsInspectModalOpen(false);
    setSelectedTaskId(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'task') {
      const task = active.data.current.task;
      // Find which list this task belongs to
      const taskList = lists.find(list => 
        list.tasks.some(t => t._id === task._id)
      );
      
      setActiveTask({
        ...task,
        listId: taskList?._id
      });
      setActiveTaskId(active.id as Id<"tasks">);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (over && over.data.current?.type === 'task') {
      setOverTaskId(over.id as Id<"tasks">);
      // Find which list this task belongs to
      const taskList = lists.find(list => 
        list.tasks.some(task => task._id === over.id)
      );
      setOverListId(taskList?._id || null);
    } else if (over && over.data.current?.type === 'list') {
      setOverTaskId(null);
      setOverListId(over.id as Id<"lists">);
    } else {
      setOverTaskId(null);
      setOverListId(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    setActiveTaskId(null);
    setOverTaskId(null);
    setOverListId(null);

    if (!over) {
      // Invalid drop - let the library handle the snap-back
      return;
    }

    const activeTask = active.data.current?.task;
    if (!activeTask) return;

    let isValidMove = false;

    // If dropping on a list
    if (over.data.current?.type === 'list') {
      const newListId = over.id as Id<"lists">;
      const targetList = lists.find(list => list._id === newListId);
      if (targetList && targetList._id !== activeTask.listId) {
        // Move to new list at the end
        await handleMoveTask(activeTask._id, newListId, targetList.tasks.length);
        isValidMove = true;
      }
    }
    // If dropping on another task
    else if (over.data.current?.type === 'task') {
      const overTask = over.data.current.task;
      const overList = lists.find(list => list.tasks.some(task => task._id === overTask._id));
      
      if (overList) {
        const sortedTasks = overList.tasks.sort((a, b) => a.order - b.order);
        const overIndex = sortedTasks.findIndex(task => task._id === overTask._id);
        const activeIndex = sortedTasks.findIndex(task => task._id === activeTask._id);
        
        // Check if this is actually a different position
        if (activeTask.listId !== overList._id || activeIndex !== overIndex) {
          // Determine the correct position based on where we're dropping
          let newOrder = overIndex;
          
          // If moving within the same list, we need to adjust the position
          if (activeTask.listId === overList._id) {
            if (activeIndex < overIndex) {
              newOrder = overIndex; // Moving down, insert after the target
            } else {
              newOrder = overIndex; // Moving up, insert at the target position
            }
          } else {
            newOrder = overIndex; // Moving to different list, insert at target position
          }
          
          await handleMoveTask(activeTask._id, overList._id, newOrder);
          isValidMove = true;
        }
      }
    }

    // If it's not a valid move, let the library handle the snap-back
    if (!isValidMove) {
      return;
    }
  };

  const selectedTask = selectedTaskId 
    ? lists
        .flatMap(list => list.tasks)
        .find(task => task._id === selectedTaskId)
    : null;

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{table.name}</h1>
              <p className="text-gray-600 mt-1">
                {lists.length} list{lists.length !== 1 ? 's' : ''} • {' '}
                {lists.reduce((total, list) => total + list.tasks.length, 0)} task{lists.reduce((total, list) => total + list.tasks.length, 0) !== 1 ? 's' : ''}
              </p>
            </div>
            
            <Button
              onClick={() => setIsCreateListModalOpen(true)}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add List
            </Button>
          </div>
        </div>

        {/* Lists */}
        <div className="flex-1 overflow-x-auto p-4 md:p-6">
          <div className="flex gap-4 md:gap-6 h-full min-w-max">
            {lists
              .sort((a, b) => a.order - b.order)
              .map((list) => (
                <ListColumn
                  key={list._id}
                  list={list}
                  tasks={list.tasks}
                  onEditTask={handleEditTask}
                  onInspectTask={handleInspectTask}
                  onCreateTask={handleCreateTask}
                  onEditList={handleEditList}
                  onDeleteList={handleDeleteList}
                  onMoveTask={handleMoveTask}
                  activeTaskId={activeTaskId}
                  overTaskId={overTaskId}
                  overListId={overListId}
                />
              ))}
            
            {/* Empty state */}
            {lists.length === 0 && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No lists yet</h3>
                  <p className="text-gray-600 mb-4">Create your first list to get started</p>
                  <Button onClick={() => setIsCreateListModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create List
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={handleCloseTaskModal}
          task={selectedTask || undefined}
          listId={selectedListId || undefined}
          mode={taskModalMode}
        />

        <InspectTaskModal
          isOpen={isInspectModalOpen}
          onClose={handleCloseInspectModal}
          task={selectedTask || undefined}
        />

        <CreateListModal
          isOpen={isCreateListModalOpen}
          onClose={() => setIsCreateListModalOpen(false)}
          tableId={table._id}
        />
      </div>

      <DragOverlay>
        {activeTask ? (
          <div 
            className="p-3 bg-white border border-gray-200 rounded-lg shadow-2xl opacity-95 cursor-grabbing"
            style={{
              transform: "rotate(5deg)",
              borderLeftColor: activeTask.color,
              borderLeftWidth: activeTask.color ? "4px" : "0"
            }}
          >
            <h4 className="font-medium text-sm">{activeTask.title}</h4>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
