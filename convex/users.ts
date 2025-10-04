import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Mutation to initialize or sync user from Clerk
export const initializeUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      return null;
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (existingUser) {
      // Update lastActiveAt
      await ctx.db.patch(existingUser._id, {
        lastActiveAt: Date.now(),
      });
      return existingUser._id;
    }

    // Generate a unique chatId
    let chatId: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      // Generate a random 6-character alphanumeric string
      chatId = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Check if this chatId is already taken
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_chatId", (q) => q.eq("chatId", chatId))
        .unique();
      
      if (!existingUser) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      throw new Error("Failed to generate unique chatId");
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      externalId: identity.subject,
      email: identity.email,
      emailVerified: identity.emailVerified,
      fullName: identity.name,
      firstName: identity.givenName,
      lastName: identity.familyName,
      username: identity.nickname,
      avatarUrl: identity.pictureUrl,
      pricingPlan: "free",
      chatId: chatId!,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      lastSyncedAt: Date.now(),
    });

    return userId;
  },
});

// Query to get current user's information including mrr
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      return null; // Return null instead of throwing error when not authenticated
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    return user;
  },
});

// Mutation to update user's monthly recurring revenue (mrr)
export const updateMrr = mutation({
  args: {
    mrr: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      mrr: args.mrr,
    });

    return user._id;
  },
});

// Mutation to update user's pay day
export const updatePayDay = mutation({
  args: {
    payDay: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Validate payDay is between 1 and 31
    if (args.payDay < 1 || args.payDay > 31) {
      throw new Error("Pay day must be between 1 and 31");
    }

    await ctx.db.patch(user._id, {
      payDay: args.payDay,
    });

    return user._id;
  },
});

// Mutation to update both mrr and payDay at once
export const updateSalaryInfo = mutation({
  args: {
    mrr: v.optional(v.number()),
    payDay: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Validate payDay if provided
    if (args.payDay !== undefined && (args.payDay < 1 || args.payDay > 31)) {
      throw new Error("Pay day must be between 1 and 31");
    }

    const updates: Record<string, number> = {};
    if (args.mrr !== undefined) {
      updates.mrr = args.mrr;
    }
    if (args.payDay !== undefined) {
      updates.payDay = args.payDay;
    }

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(user._id, updates);
    }

    return user._id;
  },
});

// Mutation to generate a chatId for existing users who don't have one
export const ensureChatId = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // If user already has a chatId, return it
    if (user.chatId) {
      return user.chatId;
    }

    // Generate a unique chatId
    let chatId: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      // Generate a random 6-character alphanumeric string
      chatId = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Check if this chatId is already taken
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_chatId", (q) => q.eq("chatId", chatId))
        .unique();
      
      if (!existingUser) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      throw new Error("Failed to generate unique chatId");
    }

    // Update user with the new chatId
    await ctx.db.patch(user._id, {
      chatId: chatId!,
    });

    return chatId!;
  },
});