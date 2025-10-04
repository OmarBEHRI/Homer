"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddFriendModal } from "./AddFriendModal";
import { FriendSuggestion } from "./FriendSuggestion";
import { Search, MessageCircle, UserPlus, Loader2 } from "lucide-react";

interface ChatSidebarProps {
  selectedChatId?: Id<"chats">;
  onChatSelect: (chatId: Id<"chats">) => void;
  onMessageSelect?: (chatId: Id<"chats">, messageId: Id<"messages">) => void;
}

interface ChatWithDetails {
  _id: Id<"chats">;
  otherParticipant: {
    _id: Id<"users">;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    avatarUrl?: string;
    chatId?: string;
  };
  lastMessage: {
    _id: Id<"messages">;
    content: string;
    createdAt: number;
    senderId: Id<"users">;
  } | null;
  lastMessageAt?: number;
  createdAt: number;
  unseenCount: number;
}

export function ChatSidebar({ selectedChatId, onChatSelect, onMessageSelect }: ChatSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingFriend, setIsAddingFriend] = useState<string | null>(null);

  // Get all chats for the current user
  const chats = useQuery(api.chatQueries.getChats) as ChatWithDetails[] | undefined;
  
  // Search functionality
  const searchResults = useQuery(
    api.chatQueries.searchChatsAndMessages,
    searchTerm.trim() ? { searchTerm: searchTerm.trim() } : "skip"
  );

  const addFriend = useMutation(api.chatMutations.addFriend);

  // Filter chats based on search term
  const filteredChats = useMemo(() => {
    if (!chats) return [];
    if (!searchTerm.trim()) return chats;

    const term = searchTerm.toLowerCase();
    return chats.filter(chat => 
      chat.otherParticipant.fullName?.toLowerCase().includes(term) ||
      chat.otherParticipant.firstName?.toLowerCase().includes(term) ||
      chat.otherParticipant.lastName?.toLowerCase().includes(term) ||
      chat.lastMessage?.content.toLowerCase().includes(term)
    );
  }, [chats, searchTerm]);

  const handleAddFriend = async (chatId: string) => {
    setIsAddingFriend(chatId);
    try {
      await addFriend({ friendChatId: chatId });
    } catch (error) {
      console.error("Failed to add friend:", error);
    } finally {
      setIsAddingFriend(null);
    }
  };

  const handleMessageClick = (chatId: Id<"chats">, messageId: Id<"messages">) => {
    onChatSelect(chatId);
    if (onMessageSelect) {
      onMessageSelect(chatId, messageId);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const truncateMessage = (content: string, maxLength: number = 50) => {
    return content.length > maxLength ? content.substring(0, maxLength) + "..." : content;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Chats</h2>
          <AddFriendModal>
            <Button size="sm" variant="outline" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add Friend
            </Button>
          </AddFriendModal>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search chats and messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {searchTerm.trim() && searchResults ? (
          /* Search Results */
          <div className="p-4 space-y-4">
            {searchResults.users.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">People</h3>
                <div className="space-y-2">
                  {searchResults.users.map((user) => {
                    // Find the existing chat with this user
                    const existingChat = chats?.find(chat => 
                      chat.otherParticipant._id === user._id
                    );
                    
                    if (existingChat) {
                      // Show as existing chat
                      return (
                        <div
                          key={user._id}
                          onClick={() => onChatSelect(existingChat._id)}
                          className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors bg-white"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium flex-shrink-0">
                              {user.avatarUrl ? (
                                <img
                                  src={user.avatarUrl}
                                  alt={user.fullName || "User"}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                (user.firstName?.[0] || user.fullName?.[0] || "U").toUpperCase()
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown User"}
                              </p>
                              {existingChat.lastMessage && (
                                <p className="text-sm text-gray-600 truncate">
                                  {truncateMessage(existingChat.lastMessage.content)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      // Show as friend suggestion for users not yet added
                      return (
                        <FriendSuggestion
                          key={user._id}
                          user={user}
                          onAddFriend={handleAddFriend}
                          isAdding={isAddingFriend === user.chatId}
                        />
                      );
                    }
                  })}
                </div>
              </div>
            )}

            {searchResults.messages.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Messages</h3>
                <div className="space-y-2">
                  {searchResults.messages.map((result) => (
                    <div
                      key={result.message._id}
                      onClick={() => handleMessageClick(result.chat._id, result.message._id)}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors bg-white"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                          {result.chat.otherParticipant?.firstName?.[0] || "U"}
                        </div>
                        <span className="text-sm font-medium">
                          {result.chat.otherParticipant?.fullName || "Unknown"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {truncateMessage(result.message.content)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTime(result.message.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchResults.users.length === 0 && searchResults.messages.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No results found</p>
              </div>
            )}
          </div>
        ) : (
          /* Chat List */
          <div className="p-2">
            {chats === undefined ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="mb-2">No chats yet</p>
                <p className="text-sm">Add a friend to start chatting!</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredChats.map((chat) => (
                  <div
                    key={chat._id}
                    onClick={() => onChatSelect(chat._id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors bg-white ${
                      selectedChatId === chat._id
                        ? "bg-blue-50 border border-blue-200"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                          {chat.otherParticipant.avatarUrl ? (
                            <img
                              src={chat.otherParticipant.avatarUrl}
                              alt={chat.otherParticipant.fullName || "User"}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            (chat.otherParticipant.firstName?.[0] || 
                             chat.otherParticipant.fullName?.[0] || 
                             "U").toUpperCase()
                          )}
                        </div>
                        {chat.unseenCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {chat.unseenCount > 9 ? "9+" : chat.unseenCount}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900 truncate">
                            {chat.otherParticipant.fullName || 
                             `${chat.otherParticipant.firstName || ""} ${chat.otherParticipant.lastName || ""}`.trim() ||
                             "Unknown User"}
                          </p>
                          {chat.lastMessage && (
                            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                              {formatTime(chat.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        {chat.lastMessage && (
                          <p className="text-sm text-gray-600 truncate">
                            {truncateMessage(chat.lastMessage.content)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
