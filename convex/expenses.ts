import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query to get all expenses for the current user
export const getExpensesForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      return []; // Return empty array instead of throwing when not authenticated
    }

    // Find the user in the database
    const user = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (!user) {
      return []; // Return empty array if user not found
    }

    // Get all expenses for this user, ordered by date descending
    const expenses = await ctx.db
      .query("spend")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Sort by date descending (most recent first)
    return expenses.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
  },
});

// Query to get expenses for a specific date range
export const getExpensesByDateRange = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    const expenses = await ctx.db
      .query("spend")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Filter by date range
    return expenses.filter((expense) => {
      const expenseDate = expense.date;
      return expenseDate >= args.startDate && expenseDate <= args.endDate;
    });
  },
});

// Query to get category spending for current month
export const getCategorySpendingForCurrentMonth = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    // Get current date and calculate start/end of month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const startDateStr = startOfMonth.toISOString().split('T')[0];
    const endDateStr = endOfMonth.toISOString().split('T')[0];

    // Get expenses for current month
    const expenses = await ctx.db
      .query("spend")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Filter by current month
    const currentMonthExpenses = expenses.filter((expense) => {
      return expense.date >= startDateStr && expense.date <= endDateStr;
    });

    // Group by category and sum amounts
    const categorySpending: Record<string, number> = {};
    
    currentMonthExpenses.forEach((expense) => {
      const category = expense.customCategoryLabel || expense.category;
      categorySpending[category] = (categorySpending[category] || 0) + expense.amount;
    });

    // Convert to array and sort by amount descending
    return Object.entries(categorySpending)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  },
});

// Query to get top categories by spending for current month (top 3)
export const getTopCategoriesForCurrentMonth = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    // Get current date and calculate start/end of month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const startDateStr = startOfMonth.toISOString().split('T')[0];
    const endDateStr = endOfMonth.toISOString().split('T')[0];

    // Get expenses for current month
    const expenses = await ctx.db
      .query("spend")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Filter by current month
    const currentMonthExpenses = expenses.filter((expense) => {
      return expense.date >= startDateStr && expense.date <= endDateStr;
    });

    // Group by category and sum amounts
    const categorySpending: Record<string, number> = {};
    
    currentMonthExpenses.forEach((expense) => {
      const category = expense.customCategoryLabel || expense.category;
      categorySpending[category] = (categorySpending[category] || 0) + expense.amount;
    });

    // Convert to array, sort by amount descending, and take top 3
    return Object.entries(categorySpending)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
  },
});

// Mutation to create a new expense
export const createExpense = mutation({
  args: {
    amount: v.number(),
    category: v.union(
      v.literal("Rent"),
      v.literal("Internet"),
      v.literal("Mobile Internet"),
      v.literal("Groceries"),
      v.literal("Eating Out"),
      v.literal("Shopping"),
      v.literal("Car Mortgage"),
      v.literal("House Mortgage"),
      v.literal("Other Mortgages or Debts"),
      v.literal("Transportation"),
      v.literal("Subscriptions"),
      v.literal("Utilities"),
      v.literal("Healthcare"),
      v.literal("Savings"),
      v.literal("Investments"),
      v.literal("Entertainment"),
      v.literal("Insurance"),
      v.literal("Education"),
      v.literal("Miscellaneous"),
      v.literal("Custom"),
    ),
    customCategoryLabel: v.optional(v.string()),
    description: v.optional(v.string()),
    date: v.string(), // ISO date string
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    // Find the user in the database
    const user = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Validate amount
    if (args.amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    // Create the expense
    const expenseId = await ctx.db.insert("spend", {
      userId: user._id,
      amount: args.amount,
      category: args.category,
      customCategoryLabel: args.customCategoryLabel,
      description: args.description,
      date: args.date,
      createdAt: Date.now(),
    });

    return expenseId;
  },
});

// Mutation to update an existing expense
export const updateExpense = mutation({
  args: {
    expenseId: v.id("spend"),
    amount: v.optional(v.number()),
    category: v.optional(
      v.union(
        v.literal("Rent"),
        v.literal("Internet"),
        v.literal("Mobile Internet"),
        v.literal("Groceries"),
        v.literal("Eating Out"),
        v.literal("Shopping"),
        v.literal("Car Mortgage"),
        v.literal("House Mortgage"),
        v.literal("Other Mortgages or Debts"),
        v.literal("Transportation"),
        v.literal("Subscriptions"),
        v.literal("Utilities"),
        v.literal("Healthcare"),
        v.literal("Savings"),
        v.literal("Investments"),
        v.literal("Entertainment"),
        v.literal("Insurance"),
        v.literal("Education"),
        v.literal("Miscellaneous"),
        v.literal("Custom"),
      )
    ),
    customCategoryLabel: v.optional(v.string()),
    description: v.optional(v.string()),
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    // Find the user in the database
    const user = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Get the expense to verify ownership
    const expense = await ctx.db.get(args.expenseId);
    if (!expense) {
      throw new Error("Expense not found");
    }

    if (expense.userId !== user._id) {
      throw new Error("Not authorized to update this expense");
    }

    // Validate amount if provided
    if (args.amount !== undefined && args.amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    // Update the expense
    await ctx.db.patch(args.expenseId, {
      ...(args.amount !== undefined && { amount: args.amount }),
      ...(args.category && { category: args.category }),
      ...(args.customCategoryLabel !== undefined && { customCategoryLabel: args.customCategoryLabel }),
      ...(args.description !== undefined && { description: args.description }),
      ...(args.date && { date: args.date }),
    });

    return args.expenseId;
  },
});

// Mutation to delete an expense
export const deleteExpense = mutation({
  args: {
    expenseId: v.id("spend"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    // Find the user in the database
    const user = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Get the expense to verify ownership
    const expense = await ctx.db.get(args.expenseId);
    if (!expense) {
      throw new Error("Expense not found");
    }

    if (expense.userId !== user._id) {
      throw new Error("Not authorized to delete this expense");
    }

    // Delete the expense
    await ctx.db.delete(args.expenseId);

    return args.expenseId;
  },
});
