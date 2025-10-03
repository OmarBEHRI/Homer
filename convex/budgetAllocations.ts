import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query to get all budget allocations for the current user
export const getAllocationsForCurrentUser = query({
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

    // Get all allocations for this user
    const allocations = await ctx.db
      .query("budgetAllocations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return allocations;
  },
});

// Mutation to create a new budget allocation
export const createAllocation = mutation({
  args: {
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
    amount: v.number(),
    description: v.optional(v.string()),
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

    // Create the allocation
    const allocationId = await ctx.db.insert("budgetAllocations", {
      userId: user._id,
      category: args.category,
      customCategoryLabel: args.customCategoryLabel,
      amount: args.amount,
      description: args.description,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return allocationId;
  },
});

// Mutation to update an existing budget allocation
export const updateAllocation = mutation({
  args: {
    allocationId: v.id("budgetAllocations"),
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
    amount: v.optional(v.number()),
    description: v.optional(v.string()),
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

    // Get the allocation to verify ownership
    const allocation = await ctx.db.get(args.allocationId);
    if (!allocation) {
      throw new Error("Allocation not found");
    }

    if (allocation.userId !== user._id) {
      throw new Error("Not authorized to update this allocation");
    }

    // Update the allocation
    await ctx.db.patch(args.allocationId, {
      ...(args.category && { category: args.category }),
      ...(args.customCategoryLabel !== undefined && { customCategoryLabel: args.customCategoryLabel }),
      ...(args.amount !== undefined && { amount: args.amount }),
      ...(args.description !== undefined && { description: args.description }),
      updatedAt: Date.now(),
    });

    return args.allocationId;
  },
});

// Mutation to delete a budget allocation
export const deleteAllocation = mutation({
  args: {
    allocationId: v.id("budgetAllocations"),
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

    // Get the allocation to verify ownership
    const allocation = await ctx.db.get(args.allocationId);
    if (!allocation) {
      throw new Error("Allocation not found");
    }

    if (allocation.userId !== user._id) {
      throw new Error("Not authorized to delete this allocation");
    }

    // Delete the allocation
    await ctx.db.delete(args.allocationId);

    return args.allocationId;
  },
});

