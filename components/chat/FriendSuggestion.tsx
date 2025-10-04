"use client";

import { Button } from "@/components/ui/button";
import { UserPlus, Loader2, CheckCircle } from "lucide-react";

interface FriendSuggestionProps {
  user: {
    _id: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    avatarUrl?: string;
    chatId?: string;
  };
  onAddFriend: (chatId: string) => Promise<void>;
  isAdding?: boolean;
  isAdded?: boolean;
}

export function FriendSuggestion({ user, onAddFriend, isAdding = false, isAdded = false }: FriendSuggestionProps) {
  const displayName = user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown User";

  const handleAddFriend = async () => {
    if (user.chatId) {
      await onAddFriend(user.chatId);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors bg-white">
      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium flex-shrink-0">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={displayName}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          displayName[0].toUpperCase()
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">
          {displayName}
        </p>
        <p className="text-sm text-gray-500 truncate">
          Chat ID: {user.chatId}
        </p>
      </div>
      
      <div className="flex-shrink-0">
        {isAdded ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Added</span>
          </div>
        ) : (
          <Button
            onClick={handleAddFriend}
            disabled={isAdding}
            size="sm"
            className="flex items-center gap-2"
          >
            {isAdding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            Add
          </Button>
        )}
      </div>
    </div>
  );
}
