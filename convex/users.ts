import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getUserFromAuth = async (ctx: any) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const existing = await ctx.db
    .query("users")
    .withIndex("by_externalId", (q: any) => q.eq("externalId", identity.subject))
    .unique();

  if (!existing) {
    throw new Error("User not found. Please refresh the page to create your account.");
  }

  return existing._id;
};

export const getOrCreateUserFromAuth = async (ctx: any) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const existing = await ctx.db
    .query("users")
    .withIndex("by_externalId", (q: any) => q.eq("externalId", identity.subject))
    .unique();

  if (existing) {
    await updateProfileFromIdentity(ctx, existing._id, identity);
    return existing._id;
  }

  const userId = await ctx.db.insert("users", buildUserFromIdentity(identity));
  return userId;
};

const buildUserFromIdentity = (identity: any) => {
  const displayName =
    identity.name ||
    identity.given_name ||
    identity.nickname ||
    identity.email?.split("@")[0] ||
    "User";

  return {
    externalId: identity.subject,
    email: identity.email,
    emailVerified: identity.email_verified ?? undefined,
    phoneNumber: identity.phone_number ?? undefined,
    phoneNumberVerified: identity.phone_number_verified ?? undefined,
    fullName: identity.name ?? undefined,
    firstName: identity.given_name ?? undefined,
    lastName: identity.family_name ?? undefined,
    username: identity.nickname ?? undefined,
    avatarUrl: identity.picture ?? undefined,
    pricingPlan: "free" as const,
    roles: identity.roles ?? undefined,
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
    updatedAt: identity.updated_at ?? undefined,
    lastSyncedAt: Date.now(),
    dashboardConfig: undefined,
    taskPreferences: undefined,
    budgetPreferences: undefined,
    resourcePreferences: undefined,
  };
};

const updateProfileFromIdentity = async (ctx: any, userId: any, identity: any) => {
  const patch: Record<string, unknown> = {
    email: identity.email ?? undefined,
    emailVerified: identity.email_verified ?? undefined,
    phoneNumber: identity.phone_number ?? undefined,
    phoneNumberVerified: identity.phone_number_verified ?? undefined,
    fullName: identity.name ?? undefined,
    firstName: identity.given_name ?? undefined,
    lastName: identity.family_name ?? undefined,
    username: identity.nickname ?? undefined,
    avatarUrl: identity.picture ?? undefined,
    updatedAt: identity.updated_at ?? undefined,
    lastActiveAt: Date.now(),
    lastSyncedAt: Date.now(),
  };

  await ctx.db.patch(userId, patch);
};

export const initializeUser = mutation({
  args: {},
  returns: v.object({ userId: v.id("users") }),
  handler: async (ctx, args) => {
    const userId = await getOrCreateUserFromAuth(ctx);
    return { userId };
  },
});

export const getCurrentUser = query({
  args: {},
  returns: v.union(
    v.object({
      userId: v.id("users"),
      email: v.optional(v.string()),
      displayName: v.optional(v.string()),
      avatarUrl: v.optional(v.string()),
      roles: v.optional(v.array(v.string())),
      dashboardConfig: v.optional(
        v.array(
          v.object({
            widgetId: v.string(),
            enabled: v.boolean(),
            order: v.number(),
            size: v.optional(
              v.union(
                v.literal("sm"),
                v.literal("md"),
                v.literal("lg"),
                v.literal("xl"),
              ),
            ),
          }),
        ),
      ),
      taskPreferences: v.optional(
        v.object({
          defaultView: v.optional(v.union(v.literal("list"), v.literal("board"))),
          autoArchiveCompleted: v.optional(v.boolean()),
          notifyDailySummary: v.optional(v.boolean()),
        }),
      ),
      budgetPreferences: v.optional(
        v.object({
          defaultCurrency: v.optional(v.string()),
          monthlyLimit: v.optional(v.number()),
          rolloverEnabled: v.optional(v.boolean()),
        }),
      ),
      resourcePreferences: v.optional(
        v.object({
          defaultCategory: v.optional(
            v.union(
              v.literal("Wealth"),
              v.literal("Knowledge"),
              v.literal("Recreation"),
            ),
          ),
          notifyOnNew: v.optional(v.boolean()),
          sortOrder: v.optional(v.union(v.literal("recent"), v.literal("popular"))),
        }),
      ),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q: any) => q.eq("externalId", identity.subject))
      .unique();

    if (!user) {
      return null;
    }

    return {
      userId: user._id,
      email: user.email,
      displayName: user.fullName ?? user.firstName ?? user.username ?? undefined,
      avatarUrl: user.avatarUrl,
      roles: user.roles,
      dashboardConfig: user.dashboardConfig,
      taskPreferences: user.taskPreferences,
      budgetPreferences: user.budgetPreferences,
      resourcePreferences: user.resourcePreferences,
    };
  },
});

export const upsertDashboardConfig = mutation({
  args: {
    widgets: v.array(
      v.object({
        widgetId: v.string(),
        enabled: v.boolean(),
        order: v.number(),
        size: v.optional(
          v.union(v.literal("sm"), v.literal("md"), v.literal("lg"), v.literal("xl")),
        ),
      }),
    ),
  },
  returns: v.object({ userId: v.id("users") }),
  handler: async (ctx, args) => {
    const userId = await getOrCreateUserFromAuth(ctx);

    await ctx.db.patch(userId, {
      dashboardConfig: args.widgets,
      lastActiveAt: Date.now(),
      lastSyncedAt: Date.now(),
    });

    return { userId };
  },
});

export const updatePreferences = mutation({
  args: {
    taskPreferences: v.optional(
      v.object({
        defaultView: v.optional(v.union(v.literal("list"), v.literal("board"))),
        autoArchiveCompleted: v.optional(v.boolean()),
        notifyDailySummary: v.optional(v.boolean()),
      }),
    ),
    budgetPreferences: v.optional(
      v.object({
        defaultCurrency: v.optional(v.string()),
        monthlyLimit: v.optional(v.number()),
        rolloverEnabled: v.optional(v.boolean()),
      }),
    ),
    resourcePreferences: v.optional(
      v.object({
        defaultCategory: v.optional(
          v.union(v.literal("Wealth"), v.literal("Knowledge"), v.literal("Recreation")),
        ),
        notifyOnNew: v.optional(v.boolean()),
        sortOrder: v.optional(v.union(v.literal("recent"), v.literal("popular"))),
      }),
    ),
  },
  returns: v.object({ userId: v.id("users") }),
  handler: async (ctx, args) => {
    const userId = await getOrCreateUserFromAuth(ctx);

    await ctx.db.patch(userId, {
      taskPreferences: args.taskPreferences,
      budgetPreferences: args.budgetPreferences,
      resourcePreferences: args.resourcePreferences,
      lastActiveAt: Date.now(),
      lastSyncedAt: Date.now(),
    });

    return { userId };
  },
});

export const recordActivity = mutation({
  args: {
    lastActiveAt: v.optional(v.number()),
  },
  returns: v.object({ userId: v.id("users") }),
  handler: async (ctx, args) => {
    const userId = await getOrCreateUserFromAuth(ctx);

    await ctx.db.patch(userId, {
      lastActiveAt: args.lastActiveAt ?? Date.now(),
      lastSyncedAt: Date.now(),
    });

    return { userId };
  },
});

export const lookupUserByEmail = query({
  args: { email: v.string() },
  returns: v.union(
    v.object({
      userId: v.id("users"),
      email: v.optional(v.string()),
      displayName: v.optional(v.string()),
      avatarUrl: v.optional(v.string()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", args.email))
      .unique();

    if (!user) {
      return null;
    }

    return {
      userId: user._id,
      email: user.email,
      displayName: user.fullName ?? user.firstName ?? user.username ?? undefined,
      avatarUrl: user.avatarUrl,
    };
  },
});

export const lookupUserByExternalId = query({
  args: { externalId: v.string() },
  returns: v.union(
    v.object({
      userId: v.id("users"),
      email: v.optional(v.string()),
      displayName: v.optional(v.string()),
      avatarUrl: v.optional(v.string()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q: any) => q.eq("externalId", args.externalId))
      .unique();

    if (!user) {
      return null;
    }

    return {
      userId: user._id,
      email: user.email,
      displayName: user.fullName ?? user.firstName ?? user.username ?? undefined,
      avatarUrl: user.avatarUrl,
    };
  },
});

