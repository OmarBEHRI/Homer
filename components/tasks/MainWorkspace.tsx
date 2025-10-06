"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Id } from "../../convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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
  
  // Table name editing state
  const [isEditingTableName, setIsEditingTableName] = useState(false);
  const [tableName, setTableName] = useState(table.name);
  
  // Optimistic updates state - store the entire optimistic state
  const [optimisticLists, setOptimisticLists] = useState<typeof lists | null>(null);
  const lastListsRef = useRef<typeof lists>(lists);

  const deleteList = useMutation(api.tasks.deleteList);
  const moveTask = useMutation(api.tasks.moveTask);
  const updateTable = useMutation(api.tasks.updateTable);

  // Use optimistic lists if available, otherwise use real lists
  const displayLists = optimisticLists || lists;

  // Clear optimistic updates when real data changes
  useEffect(() => {
    if (optimisticLists) {
      // Check if the real data has changed since we applied optimistic updates
      const realDataChanged = JSON.stringify(lists) !== JSON.stringify(lastListsRef.current);
      
      if (realDataChanged) {
        // Real data has updated, clear optimistic state
        setOptimisticLists(null);
        lastListsRef.current = lists;
      }
    } else {
      // Update ref when not using optimistic state
      lastListsRef.current = lists;
    }
  }, [lists, optimisticLists]);

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

  const handleSaveTableName = async () => {
    if (tableName.trim() && tableName !== table.name) {
      await updateTable({ tableId: table._id, name: tableName.trim() });
    }
    setIsEditingTableName(false);
  };

  const handleCancelTableNameEdit = () => {
    setTableName(table.name);
    setIsEditingTableName(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveTableName();
    } else if (e.key === "Escape") {
      handleCancelTableNameEdit();
    }
  };

  const handleMoveTask = async (taskId: Id<"tasks">, newListId: Id<"lists">, newOrder: number) => {
    // Apply optimistic update immediately by restructuring the lists
    const currentLists = optimisticLists || lists;
    
    // Find the task and its current list
    let taskToMove: any = null;
    let sourceListIndex = -1;
    
    for (let i = 0; i < currentLists.length; i++) {
      const task = currentLists[i].tasks.find(t => t._id === taskId);
      if (task) {
        taskToMove = task;
        sourceListIndex = i;
        break;
      }
    }
    
    if (!taskToMove) return;
    
    // Create optimistic lists with the task moved
    const newOptimisticLists = currentLists.map((list, listIndex) => {
      if (list._id === newListId) {
        // This is the target list (could be same as source)
        if (list._id === taskToMove.listId) {
          // Moving within the same list - reorder tasks
          const sortedTasks = [...list.tasks].sort((a, b) => a.order - b.order);
          const currentIndex = sortedTasks.findIndex(t => t._id === taskId);
          
          if (currentIndex !== -1) {
            // Remove task from current position and insert at new position
            const reorderedTasks = [...sortedTasks];
            const [movedTask] = reorderedTasks.splice(currentIndex, 1);
            reorderedTasks.splice(newOrder, 0, movedTask);
            
            // Update order for all tasks
            const finalTasks = reorderedTasks.map((task, index) => ({
              ...task,
              order: index
            }));
            
            return {
              ...list,
              tasks: finalTasks
            };
          }
        } else {
          // Moving to a different list
          const newTasks = [...list.tasks];
          const updatedTask = { ...taskToMove, listId: newListId, order: newOrder };
          newTasks.splice(newOrder, 0, updatedTask);
          
          // Update order for all tasks in the target list
          const reorderedTasks = newTasks.map((task, index) => ({
            ...task,
            order: index
          }));
          
          return {
            ...list,
            tasks: reorderedTasks
          };
        }
      } else if (list._id === taskToMove.listId && list._id !== newListId) {
        // Remove task from source list (only if moving to different list)
        return {
          ...list,
          tasks: list.tasks.filter(t => t._id !== taskId)
        };
      }
      return list;
    });
    
    // Apply optimistic update
    setOptimisticLists(newOptimisticLists);

    try {
      await moveTask({ taskId, newListId, newOrder });
    } catch (error) {
      // If the mutation fails, revert optimistic update
      setOptimisticLists(null);
      console.error('Failed to move task:', error);
    }
    // Note: Optimistic state will be cleared by useEffect when real data updates
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
      const taskList = displayLists.find(list => 
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
      const taskList = displayLists.find(list => 
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

    // If dropping on a list or add-task area
    if (over.data.current?.type === 'list') {
      let newListId: Id<"lists">;
      
      // Handle both regular list drops and add-task area drops
      if (typeof over.id === 'string' && over.id.startsWith('add-task-')) {
        newListId = over.id.replace('add-task-', '') as Id<"lists">;
      } else {
        newListId = over.id as Id<"lists">;
      }
      
      const targetList = displayLists.find(list => list._id === newListId);
      if (targetList) {
        // If moving to a different list, add at the end
        if (targetList._id !== activeTask.listId) {
          await handleMoveTask(activeTask._id, newListId, targetList.tasks.length);
          isValidMove = true;
        }
        // If dropping on the same list but it's empty or we're dropping in empty space
        else if (targetList.tasks.length === 0 || !overTaskId) {
          // Already in the right place, no need to move
          isValidMove = true;
        }
      }
    }
    // If dropping on another task
    else if (over.data.current?.type === 'task') {
      const overTask = over.data.current.task;
      const overList = displayLists.find(list => list.tasks.some(task => task._id === overTask._id));
      
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
    // If dropping on empty space within a list (like the add task button area)
    else if (overListId && !overTaskId) {
      const targetList = displayLists.find(list => list._id === overListId);
      if (targetList && targetList._id !== activeTask.listId) {
        // Move to the end of the target list
        await handleMoveTask(activeTask._id, overListId, targetList.tasks.length);
        isValidMove = true;
      }
    }

    // If it's not a valid move, let the library handle the snap-back
    if (!isValidMove) {
      return;
    }
  };

  const selectedTask = selectedTaskId 
    ? displayLists
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
          <div>
            {isEditingTableName ? (
              <Input
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                onBlur={handleSaveTableName}
                onKeyDown={handleKeyPress}
                className="text-2xl font-bold text-gray-900 h-10 px-3 py-2 max-w-[30%] border-2 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
                autoFocus
              />
            ) : (
              <h1 
                className="text-2xl font-bold text-gray-900 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                onDoubleClick={() => setIsEditingTableName(true)}
              >
                {table.name}
              </h1>
            )}
            <p className="text-gray-600 mt-1">
              {displayLists.length} list{displayLists.length !== 1 ? 's' : ''} • {' '}
              {displayLists.reduce((total, list) => total + list.tasks.length, 0)} task{displayLists.reduce((total, list) => total + list.tasks.length, 0) !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Lists */}
        <div className="flex-1 overflow-x-auto p-4 md:p-6">
          <div className="flex gap-4 md:gap-6 h-full min-w-max">
            {displayLists
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
            
            {/* Add List Button - positioned after all lists */}
            <div className="flex-shrink-0 w-72 md:w-80">
              <Button
                onClick={() => setIsCreateListModalOpen(true)}
                className="w-full h-32 border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-600 hover:text-gray-700 flex flex-col items-center justify-center gap-2"
                variant="ghost"
              >
                <Plus className="w-6 h-6" />
                <span className="font-medium">Add List</span>
              </Button>
            </div>
            
            {/* Empty state */}
            {displayLists.length === 0 && (
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
