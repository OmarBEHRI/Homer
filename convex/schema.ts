    import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const spendCategoryEnum = v.union(
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
);

export default defineSchema({
  users: defineTable({
    externalId: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),
    phoneNumber: v.optional(v.string()),
    phoneNumberVerified: v.optional(v.boolean()),
    fullName: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    username: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    pricingPlan: v.union(
      v.literal("free"),
      v.literal("pro"),
      v.literal("enterprise"),
    ),
    roles: v.optional(v.array(v.string())),
    createdAt: v.number(),
    lastActiveAt: v.optional(v.number()),
    updatedAt: v.optional(v.string()),
    lastSyncedAt: v.optional(v.number()),
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
    mrr: v.optional(v.number()),
    payDay: v.optional(v.number()),
    chatId: v.optional(v.string()), // Unique identifier for chat functionality
  })
    .index("by_externalId", ["externalId"])
    .index("by_email", ["email"])
    .index("by_username", ["username"])
    .index("by_phoneNumber", ["phoneNumber"])
    .index("by_chatId", ["chatId"]),
  spend: defineTable({
    userId: v.id("users"),
    amount: v.number(),
    category: spendCategoryEnum,
    customCategoryLabel: v.optional(v.string()),
    description: v.optional(v.string()),
    date: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "date"]),
  budgetPlans: defineTable({
    userId: v.id("users"),
    name: v.string(),
    currency: v.string(),
    total: v.number(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_createdAt", ["userId", "createdAt"]),
  budgetAllocations: defineTable({
    userId: v.id("users"),
    planId: v.optional(v.id("budgetPlans")),
    category: spendCategoryEnum,
    customCategoryLabel: v.optional(v.string()),
    amount: v.number(),
    description: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_plan", ["planId"]),
  
  // Chat-related tables
  chats: defineTable({
    participants: v.array(v.id("users")),
    lastMessageAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_participants", ["participants"])
    .index("by_lastMessageAt", ["lastMessageAt"]),
  
  messages: defineTable({
    chatId: v.id("chats"),
    senderId: v.id("users"),
    content: v.string(),
    seen: v.boolean(),
    seenAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_chat", ["chatId"])
    .index("by_chat_createdAt", ["chatId", "createdAt"])
    .index("by_sender", ["senderId"]),
  
  friendships: defineTable({
    userId: v.id("users"),
    friendId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("blocked")
    ),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_friend", ["friendId"])
    .index("by_user_friend", ["userId", "friendId"]),

  // Task management tables
  tables: defineTable({
    userId: v.id("users"),
    name: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_createdAt", ["userId", "createdAt"]),

  lists: defineTable({
    tableId: v.id("tables"),
    name: v.string(),
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_table", ["tableId"])
    .index("by_table_order", ["tableId", "order"]),

  tasks: defineTable({
    listId: v.id("lists"),
    title: v.string(),
    description: v.optional(v.string()),
    deadline: v.optional(v.number()), // Unix timestamp
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high")
    ),
    color: v.optional(v.string()), // Hex color code
    isCompleted: v.boolean(),
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_list", ["listId"])
    .index("by_list_order", ["listId", "order"])
    .index("by_list_completed", ["listId", "isCompleted"]),
});

