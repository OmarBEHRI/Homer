import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Mutation to add friend and create empty chat
export const addFriend = mutation({
  args: { 
    friendChatId: v.string(),
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

    // Find the friend by chatId
    const friend = await ctx.db
      .query("users")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.friendChatId))
      .unique();

    if (!friend) {
      throw new Error("User with this chatId not found");
    }

    if (friend._id === user._id) {
      throw new Error("Cannot add yourself as a friend");
    }

    // Check if friendship already exists
    const existingFriendship = await ctx.db
      .query("friendships")
      .withIndex("by_user_friend", (q) => 
        q.eq("userId", user._id).eq("friendId", friend._id)
      )
      .unique();

    if (existingFriendship) {
      throw new Error("Friendship already exists");
    }

    // Create friendship
    await ctx.db.insert("friendships", {
      userId: user._id,
      friendId: friend._id,
      status: "accepted",
      createdAt: Date.now(),
    });

    // Create reverse friendship
    await ctx.db.insert("friendships", {
      userId: friend._id,
      friendId: user._id,
      status: "accepted",
      createdAt: Date.now(),
    });

    // Create empty chat
    const chatId = await ctx.db.insert("chats", {
      participants: [user._id, friend._id],
      createdAt: Date.now(),
    });

    return {
      chatId,
      friend: {
        _id: friend._id,
        firstName: friend.firstName,
        lastName: friend.lastName,
        fullName: friend.fullName,
        avatarUrl: friend.avatarUrl,
        chatId: friend.chatId,
      },
    };
  },
});

// Mutation to send a new message
export const sendMessage = mutation({
  args: {
    chatId: v.id("chats"),
    content: v.string(),
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

    // Verify user is a participant in this chat
    const chat = await ctx.db.get(args.chatId);
    if (!chat || !chat.participants.some(id => id === user._id)) {
      throw new Error("Chat not found or access denied");
    }

    // Validate message content
    if (!args.content.trim()) {
      throw new Error("Message content cannot be empty");
    }

    // Create the message
    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      senderId: user._id,
      content: args.content.trim(),
      seen: false,
      createdAt: Date.now(),
    });

    // Update chat's lastMessageAt
    await ctx.db.patch(args.chatId, {
      lastMessageAt: Date.now(),
    });

    // Get the created message with sender info
    const message = await ctx.db.get(messageId);
    if (!message) {
      throw new Error("Failed to create message");
    }

    return {
      _id: message._id,
      chatId: message.chatId,
      senderId: message.senderId,
      content: message.content,
      seen: message.seen,
      createdAt: message.createdAt,
    };
  },
});

// Mutation to mark messages as seen when chat is opened
export const markMessagesAsSeen = mutation({
  args: {
    chatId: v.id("chats"),
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

    // Verify user is a participant in this chat
    const chat = await ctx.db.get(args.chatId);
    if (!chat || !chat.participants.some(id => id === user._id)) {
      throw new Error("Chat not found or access denied");
    }

    // Get all unseen messages in this chat that are not sent by the current user
    const allMessages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect();
    
    const unseenMessages = allMessages.filter(m => 
      m.senderId !== user._id && m.seen === false
    );

    // Mark all unseen messages as seen
    const now = Date.now();
    for (const message of unseenMessages) {
      await ctx.db.patch(message._id, {
        seen: true,
        seenAt: now,
      });
    }

    return {
      markedCount: unseenMessages.length,
    };
  },
});

// Mutation to create a new chat between users
export const createChat = mutation({
  args: {
    participantIds: v.array(v.id("users")),
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

    // Ensure current user is included in participants
    const participantSet = new Set([user._id, ...args.participantIds]);
    const allParticipants = Array.from(participantSet);

    // Validate that all participants exist
    for (const participantId of allParticipants) {
      const participant = await ctx.db.get(participantId);
      if (!participant) {
        throw new Error(`Participant with ID ${participantId} not found`);
      }
    }

    // Check if a chat already exists with these exact participants
    const allChats = await ctx.db
      .query("chats")
      .collect();
    
    const existingChats = allChats.filter(chat => {
      if (chat.participants.length !== allParticipants.length) return false;
      return allParticipants.every(id => chat.participants.includes(id));
    });

    if (existingChats.length > 0) {
      return existingChats[0]._id;
    }

    // Create new chat
    const chatId = await ctx.db.insert("chats", {
      participants: allParticipants,
      createdAt: Date.now(),
    });

    return chatId;
  },
});

// Mutation to generate a unique chatId for a user
export const generateChatId = mutation({
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
