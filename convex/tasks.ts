import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

// Helper function to get user ID from auth context
async function getUserId(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    throw new Error("Not authenticated");
  }
  
  // Get the user record from the database
  const user = await ctx.db
    .query("users")
    .withIndex("by_externalId", (q: any) => q.eq("externalId", identity.subject))
    .unique();
    
  if (!user) {
    throw new Error("User not found");
  }
  
  return user._id;
}

// ===== QUERIES =====

export const getUserTables = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);

    return await ctx.db
      .query("tables")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getTableWithLists = query({
  args: { tableId: v.id("tables") },
  handler: async (ctx, { tableId }) => {
    const userId = await getUserId(ctx);

    const table = await ctx.db.get(tableId);
    if (!table || table.userId !== userId) {
      throw new Error("Table not found or access denied");
    }

    const lists = await ctx.db
      .query("lists")
      .withIndex("by_table", (q) => q.eq("tableId", tableId))
      .order("asc")
      .collect();

    return { table, lists };
  },
});

export const getListWithTasks = query({
  args: { listId: v.id("lists") },
  handler: async (ctx, { listId }) => {
    const userId = await getUserId(ctx);

    const list = await ctx.db.get(listId);
    if (!list) {
      throw new Error("List not found");
    }

    // Verify user has access to this list through the table
    const table = await ctx.db.get(list.tableId);
    if (!table || table.userId !== userId) {
      throw new Error("Access denied");
    }

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_list", (q) => q.eq("listId", listId))
      .order("asc")
      .collect();

    return { list, tasks };
  },
});

export const getTableData = query({
  args: { tableId: v.id("tables") },
  handler: async (ctx, { tableId }) => {
    const userId = await getUserId(ctx);

    const table = await ctx.db.get(tableId);
    if (!table || table.userId !== userId) {
      throw new Error("Table not found or access denied");
    }

    const lists = await ctx.db
      .query("lists")
      .withIndex("by_table", (q) => q.eq("tableId", tableId))
      .order("asc")
      .collect();

    // Get tasks for each list
    const listsWithTasks = await Promise.all(
      lists.map(async (list) => {
        const tasks = await ctx.db
          .query("tasks")
          .withIndex("by_list", (q) => q.eq("listId", list._id))
          .order("asc")
          .collect();
        return { ...list, tasks };
      })
    );

    return { table, lists: listsWithTasks };
  },
});

// ===== MUTATIONS =====

export const createTable = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const userId = await getUserId(ctx);

    const now = Date.now();
    const tableId = await ctx.db.insert("tables", {
      userId,
      name,
      createdAt: now,
      updatedAt: now,
    });

    // Create default lists
    const defaultLists = ["To Do", "In Progress", "Done"];
    for (let i = 0; i < defaultLists.length; i++) {
      await ctx.db.insert("lists", {
        tableId,
        name: defaultLists[i],
        order: i,
        createdAt: now,
        updatedAt: now,
      });
    }

    return tableId;
  },
});

export const updateTable = mutation({
  args: { 
    tableId: v.id("tables"), 
    name: v.string() 
  },
  handler: async (ctx, { tableId, name }) => {
    const userId = await getUserId(ctx);

    const table = await ctx.db.get(tableId);
    if (!table || table.userId !== userId) {
      throw new Error("Table not found or access denied");
    }

    await ctx.db.patch(tableId, {
      name,
      updatedAt: Date.now(),
    });
  },
});

export const deleteTable = mutation({
  args: { tableId: v.id("tables") },
  handler: async (ctx, { tableId }) => {
    const userId = await getUserId(ctx);

    const table = await ctx.db.get(tableId);
    if (!table || table.userId !== userId) {
      throw new Error("Table not found or access denied");
    }

    // Get all lists in this table
    const lists = await ctx.db
      .query("lists")
      .withIndex("by_table", (q) => q.eq("tableId", tableId))
      .collect();

    // Delete all tasks in all lists
    for (const list of lists) {
      const tasks = await ctx.db
        .query("tasks")
        .withIndex("by_list", (q) => q.eq("listId", list._id))
        .collect();
      
      for (const task of tasks) {
        await ctx.db.delete(task._id);
      }
    }

    // Delete all lists
    for (const list of lists) {
      await ctx.db.delete(list._id);
    }

    // Delete the table
    await ctx.db.delete(tableId);
  },
});

export const createList = mutation({
  args: { 
    tableId: v.id("tables"), 
    name: v.string() 
  },
  handler: async (ctx, { tableId, name }) => {
    const userId = await getUserId(ctx);

    const table = await ctx.db.get(tableId);
    if (!table || table.userId !== userId) {
      throw new Error("Table not found or access denied");
    }

    // Get the highest order number
    const lists = await ctx.db
      .query("lists")
      .withIndex("by_table", (q) => q.eq("tableId", tableId))
      .collect();

    const maxOrder = lists.reduce((max, list) => Math.max(max, list.order), -1);

    const now = Date.now();
    return await ctx.db.insert("lists", {
      tableId,
      name,
      order: maxOrder + 1,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateList = mutation({
  args: { 
    listId: v.id("lists"), 
    name: v.string() 
  },
  handler: async (ctx, { listId, name }) => {
    const userId = await getUserId(ctx);

    const list = await ctx.db.get(listId);
    if (!list) {
      throw new Error("List not found");
    }

    // Verify user has access to this list through the table
    const table = await ctx.db.get(list.tableId);
    if (!table || table.userId !== userId) {
      throw new Error("Access denied");
    }

    await ctx.db.patch(listId, {
      name,
      updatedAt: Date.now(),
    });
  },
});

export const deleteList = mutation({
  args: { listId: v.id("lists") },
  handler: async (ctx, { listId }) => {
    const userId = await getUserId(ctx);

    const list = await ctx.db.get(listId);
    if (!list) {
      throw new Error("List not found");
    }

    // Verify user has access to this list through the table
    const table = await ctx.db.get(list.tableId);
    if (!table || table.userId !== userId) {
      throw new Error("Access denied");
    }

    // Delete all tasks in this list
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_list", (q) => q.eq("listId", listId))
      .collect();

    for (const task of tasks) {
      await ctx.db.delete(task._id);
    }

    // Delete the list
    await ctx.db.delete(listId);
  },
});

export const createTask = mutation({
  args: { 
    listId: v.id("lists"), 
    title: v.string(),
    description: v.optional(v.string()),
    deadline: v.optional(v.number()),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high")
    ),
    color: v.optional(v.string()),
  },
  handler: async (ctx, { listId, title, description, deadline, priority, color }) => {
    const userId = await getUserId(ctx);

    const list = await ctx.db.get(listId);
    if (!list) {
      throw new Error("List not found");
    }

    // Verify user has access to this list through the table
    const table = await ctx.db.get(list.tableId);
    if (!table || table.userId !== userId) {
      throw new Error("Access denied");
    }

    // Get the highest order number in this list
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_list", (q) => q.eq("listId", listId))
      .collect();

    const maxOrder = tasks.reduce((max, task) => Math.max(max, task.order), -1);

    const now = Date.now();
    return await ctx.db.insert("tasks", {
      listId,
      title,
      description,
      deadline,
      priority,
      color,
      isCompleted: false,
      order: maxOrder + 1,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateTask = mutation({
  args: { 
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    deadline: v.optional(v.number()),
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high")
    )),
    color: v.optional(v.string()),
  },
  handler: async (ctx, { taskId, title, description, deadline, priority, color }) => {
    const userId = await getUserId(ctx);

    const task = await ctx.db.get(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    // Verify user has access to this task through the list and table
    const list = await ctx.db.get(task.listId);
    if (!list) {
      throw new Error("List not found");
    }

    const table = await ctx.db.get(list.tableId);
    if (!table || table.userId !== userId) {
      throw new Error("Access denied");
    }

    const updates: any = { updatedAt: Date.now() };
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (deadline !== undefined) updates.deadline = deadline;
    if (priority !== undefined) updates.priority = priority;
    if (color !== undefined) updates.color = color;

    await ctx.db.patch(taskId, updates);
  },
});

export const deleteTask = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, { taskId }) => {
    const userId = await getUserId(ctx);

    const task = await ctx.db.get(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    // Verify user has access to this task through the list and table
    const list = await ctx.db.get(task.listId);
    if (!list) {
      throw new Error("List not found");
    }

    const table = await ctx.db.get(list.tableId);
    if (!table || table.userId !== userId) {
      throw new Error("Access denied");
    }

    await ctx.db.delete(taskId);
  },
});

export const moveTask = mutation({
  args: { 
    taskId: v.id("tasks"), 
    newListId: v.id("lists"),
    newOrder: v.optional(v.number()),
  },
  handler: async (ctx, { taskId, newListId, newOrder }) => {
    const userId = await getUserId(ctx);

    const task = await ctx.db.get(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    // Verify user has access to both the old and new lists
    const oldList = await ctx.db.get(task.listId);
    const newList = await ctx.db.get(newListId);
    
    if (!oldList || !newList) {
      throw new Error("List not found");
    }

    const oldTable = await ctx.db.get(oldList.tableId);
    const newTable = await ctx.db.get(newList.tableId);
    
    if (!oldTable || !newTable || oldTable.userId !== userId || newTable.userId !== userId) {
      throw new Error("Access denied");
    }

    // Get all tasks in the new list
    const tasksInNewList = await ctx.db
      .query("tasks")
      .withIndex("by_list", (q) => q.eq("listId", newListId))
      .collect();

    // If moving within the same list
    if (task.listId === newListId) {
      const sortedTasks = tasksInNewList.sort((a, b) => a.order - b.order);
      const currentIndex = sortedTasks.findIndex(t => t._id === taskId);
      
      if (currentIndex === -1) return;

      let targetIndex = newOrder !== undefined ? newOrder : sortedTasks.length - 1;
      targetIndex = Math.max(0, Math.min(targetIndex, sortedTasks.length - 1));

      if (currentIndex === targetIndex) return;

      // Remove the task from its current position
      const reorderedTasks = sortedTasks.filter(t => t._id !== taskId);
      
      // Insert at new position
      reorderedTasks.splice(targetIndex, 0, task);

      // Update orders for all affected tasks
      for (let i = 0; i < reorderedTasks.length; i++) {
        await ctx.db.patch(reorderedTasks[i]._id, {
          order: i,
          updatedAt: Date.now(),
        });
      }
    } else {
      // Moving to a different list
      const sortedNewListTasks = tasksInNewList.sort((a, b) => a.order - b.order);
      let targetIndex = newOrder !== undefined ? newOrder : sortedNewListTasks.length;
      targetIndex = Math.max(0, Math.min(targetIndex, sortedNewListTasks.length));

      // Update orders for tasks in the new list that come after the insertion point
      for (let i = targetIndex; i < sortedNewListTasks.length; i++) {
        await ctx.db.patch(sortedNewListTasks[i]._id, {
          order: i + 1,
          updatedAt: Date.now(),
        });
      }

      // Update orders for tasks in the old list that come after the removed task
      const sortedOldListTasks = await ctx.db
        .query("tasks")
        .withIndex("by_list", (q) => q.eq("listId", task.listId))
        .collect();
      
      const oldListSorted = sortedOldListTasks.sort((a, b) => a.order - b.order);
      const oldIndex = oldListSorted.findIndex(t => t._id === taskId);
      
      for (let i = oldIndex + 1; i < oldListSorted.length; i++) {
        await ctx.db.patch(oldListSorted[i]._id, {
          order: i - 1,
          updatedAt: Date.now(),
        });
      }

      // Move the task to the new list and position
      await ctx.db.patch(taskId, {
        listId: newListId,
        order: targetIndex,
        updatedAt: Date.now(),
      });
    }
  },
});

export const toggleTaskCompletion = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, { taskId }) => {
    const userId = await getUserId(ctx);

    const task = await ctx.db.get(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    // Verify user has access to this task through the list and table
    const list = await ctx.db.get(task.listId);
    if (!list) {
      throw new Error("List not found");
    }

    const table = await ctx.db.get(list.tableId);
    if (!table || table.userId !== userId) {
      throw new Error("Access denied");
    }

    await ctx.db.patch(taskId, {
      isCompleted: !task.isCompleted,
      updatedAt: Date.now(),
    });
  },
});
