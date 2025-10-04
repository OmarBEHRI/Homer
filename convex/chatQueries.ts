import { v } from "convex/values";
import { query } from "./_generated/server";

// Query to find user by their chatId
export const getUserByChatId = query({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .unique();
    
    if (!user) {
      return null;
    }

    // Return only public information (no sensitive data)
    return {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      chatId: user.chatId,
    };
  },
});

// Query to get all chats for current user
export const getChats = query({
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

    // Get all chats where user is a participant
    const allChats = await ctx.db
      .query("chats")
      .collect();
    
    const chats = allChats.filter(chat => 
      chat.participants.some(id => id === user._id)
    ).sort((a, b) => (b.lastMessageAt || b.createdAt) - (a.lastMessageAt || a.createdAt));

    // For each chat, get the other participant and last message
    const chatsWithDetails = await Promise.all(
      chats.map(async (chat) => {
        // Find the other participant (not the current user)
        const otherParticipantId = chat.participants.find(
          (id) => id !== user._id
        );
        
        if (!otherParticipantId) {
          return null; // Skip if no other participant found
        }

        const otherParticipant = await ctx.db.get(otherParticipantId);
        if (!otherParticipant) {
          return null;
        }

        // Get the last message in this chat
        const lastMessage = await ctx.db
          .query("messages")
          .withIndex("by_chat_createdAt", (q) => q.eq("chatId", chat._id))
          .order("desc")
          .first();

        // Count unseen messages for current user
        const allMessages = await ctx.db
          .query("messages")
          .withIndex("by_chat", (q) => q.eq("chatId", chat._id))
          .collect();
        
        const unseenCount = allMessages.filter(m => 
          m.senderId !== user._id && m.seen === false
        ).length;

        return {
          _id: chat._id,
          otherParticipant: {
            _id: otherParticipant._id,
            firstName: otherParticipant.firstName,
            lastName: otherParticipant.lastName,
            fullName: otherParticipant.fullName,
            avatarUrl: otherParticipant.avatarUrl,
            chatId: otherParticipant.chatId,
          },
          lastMessage: lastMessage ? {
            _id: lastMessage._id,
            content: lastMessage.content,
            createdAt: lastMessage.createdAt,
            senderId: lastMessage.senderId,
          } : null,
          lastMessageAt: chat.lastMessageAt,
          createdAt: chat.createdAt,
          unseenCount,
        };
      })
    );

    // Filter out null results and sort by lastMessageAt
    return chatsWithDetails
      .filter((chat) => chat !== null)
      .sort((a, b) => {
        const aTime = a!.lastMessageAt || a!.createdAt;
        const bTime = b!.lastMessageAt || b!.createdAt;
        return bTime - aTime;
      });
  },
});

// Query to get paginated messages for a chat
export const getMessages = query({
  args: { 
    chatId: v.id("chats"),
    cursor: v.optional(v.string()),
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

    // Get messages with pagination
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat_createdAt", (q) => q.eq("chatId", args.chatId))
      .order("desc")
      .paginate({
        cursor: args.cursor || null,
        numItems: 30,
      });

    // Get sender information for each message
    const messagesWithSenders = await Promise.all(
      messages.page.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        return {
          ...message,
          sender: sender ? {
            _id: sender._id,
            firstName: sender.firstName,
            lastName: sender.lastName,
            fullName: sender.fullName,
            avatarUrl: sender.avatarUrl,
          } : null,
        };
      })
    );

    return {
      messages: messagesWithSenders.reverse(), // Reverse to show oldest first
      continueCursor: messages.continueCursor,
      isDone: messages.isDone,
    };
  },
});

// Query to count unseen messages for user across all chats
export const getUnseenMessageCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      return 0;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (!user) {
      return 0;
    }

    // Get all chats where user is a participant
    const allChats = await ctx.db
      .query("chats")
      .collect();
    
    const chats = allChats.filter(chat => 
      chat.participants.some(id => id === user._id)
    );

    // Count unseen messages across all chats
    let totalUnseen = 0;
    for (const chat of chats) {
      const allMessages = await ctx.db
        .query("messages")
        .withIndex("by_chat", (q) => q.eq("chatId", chat._id))
        .collect();
      
      const unseenMessages = allMessages.filter(m => 
        m.senderId !== user._id && m.seen === false
      );
      
      totalUnseen += unseenMessages.length;
    }

    return totalUnseen;
  },
});

// Query to search chats and messages
export const searchChatsAndMessages = query({
  args: { searchTerm: v.string() },
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

    const searchTerm = args.searchTerm.toLowerCase();

    // Search for users by name or chatId
    const allUsers = await ctx.db
      .query("users")
      .collect();
    
    const filteredUsers = allUsers.filter(u => u._id !== user._id);
    
    const userMatches = filteredUsers.filter(u => {
      const firstName = u.firstName?.toLowerCase() || "";
      const lastName = u.lastName?.toLowerCase() || "";
      const fullName = u.fullName?.toLowerCase() || "";
      const chatId = u.chatId || "";
      
      return firstName.includes(searchTerm) ||
             lastName.includes(searchTerm) ||
             fullName.includes(searchTerm) ||
             chatId === args.searchTerm;
    }).slice(0, 10);

    // Search messages in user's chats
    const allChats = await ctx.db
      .query("chats")
      .collect();
    
    const userChats = allChats.filter(chat => 
      chat.participants.some(id => id === user._id)
    );

    const messageMatches = [];
    for (const chat of userChats) {
      const allMessages = await ctx.db
        .query("messages")
        .withIndex("by_chat", (q) => q.eq("chatId", chat._id))
        .order("desc")
        .collect();
      
      const messages = allMessages
        .filter(m => m.content.toLowerCase().includes(searchTerm))
        .slice(0, 5);

      for (const message of messages) {
        const sender = await ctx.db.get(message.senderId);
        const otherParticipantId = chat.participants.find(id => id !== user._id);
        const otherParticipant = otherParticipantId ? await ctx.db.get(otherParticipantId) : null;

        messageMatches.push({
          message: {
            _id: message._id,
            content: message.content,
            createdAt: message.createdAt,
          },
          sender: sender ? {
            _id: sender._id,
            firstName: sender.firstName,
            lastName: sender.lastName,
            fullName: sender.fullName,
          } : null,
          chat: {
            _id: chat._id,
            otherParticipant: otherParticipant ? {
              _id: otherParticipant._id,
              firstName: otherParticipant.firstName,
              lastName: otherParticipant.lastName,
              fullName: otherParticipant.fullName,
            } : null,
          },
        });
      }
    }

    return {
      users: userMatches.map(u => ({
        _id: u._id,
        firstName: u.firstName,
        lastName: u.lastName,
        fullName: u.fullName,
        avatarUrl: u.avatarUrl,
        chatId: u.chatId,
      })),
      messages: messageMatches.sort((a, b) => b.message.createdAt - a.message.createdAt),
    };
  },
});
