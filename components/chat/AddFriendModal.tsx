"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, UserPlus, Loader2, AlertCircle, CheckCircle } from "lucide-react";

interface AddFriendModalProps {
  children: React.ReactNode;
}

interface FoundUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  avatarUrl?: string;
  chatId?: string;
}

export function AddFriendModal({ children }: AddFriendModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatId, setChatId] = useState("");
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const getUserByChatId = useQuery(api.chatQueries.getUserByChatId, 
    chatId.trim() ? { chatId: chatId.trim() } : "skip"
  );
  const addFriend = useMutation(api.chatMutations.addFriend);

  // Update foundUser when query result changes
  useEffect(() => {
    if (getUserByChatId) {
      setFoundUser(getUserByChatId);
      setError(null);
    } else if (chatId.trim() && getUserByChatId === null) {
      setError("No user found with this chat ID");
    }
  }, [getUserByChatId, chatId]);

  const handleSearch = () => {
    if (!chatId.trim()) {
      setError("Please enter a chat ID");
      return;
    }

    setError(null);
    setFoundUser(null);
    setSuccess(null);
    // The query will automatically trigger when chatId changes
  };

  const handleAddFriend = async () => {
    if (!foundUser) return;

    setIsAdding(true);
    setError(null);

    try {
      await addFriend({ friendChatId: foundUser.chatId! });
      setSuccess(`Successfully added ${foundUser.fullName || `${foundUser.firstName} ${foundUser.lastName}`} as a friend!`);
      setFoundUser(null);
      setChatId("");
      
      // Close modal after a short delay
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(null);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to add friend. Please try again.");
      console.error("Add friend error:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isSearching) {
      handleSearch();
    }
  };

  const resetModal = () => {
    setChatId("");
    setFoundUser(null);
    setError(null);
    setSuccess(null);
    setIsSearching(false);
    setIsAdding(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        resetModal();
      }
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Friend
          </DialogTitle>
          <DialogDescription>
            Enter your friend's chat ID to add them to your friends list and start chatting.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chatId">Chat ID</Label>
            <div className="flex gap-2">
              <Input
                id="chatId"
                placeholder="Enter chat ID (e.g., ABC123)"
                value={chatId}
                onChange={(e) => setChatId(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                disabled={isSearching || isAdding}
                className="uppercase"
              />
              <Button
                onClick={handleSearch}
                disabled={isSearching || !chatId.trim()}
                size="icon"
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-md">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 rounded-md">
              <CheckCircle className="h-4 w-4" />
              {success}
            </div>
          )}

          {foundUser && (
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                  {foundUser.avatarUrl ? (
                    <img
                      src={foundUser.avatarUrl}
                      alt={foundUser.fullName || "User"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    (foundUser.firstName?.[0] || foundUser.fullName?.[0] || "U").toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {foundUser.fullName || `${foundUser.firstName || ""} ${foundUser.lastName || ""}`.trim()}
                  </p>
                  <p className="text-sm text-gray-500">Chat ID: {foundUser.chatId}</p>
                </div>
                <Button
                  onClick={handleAddFriend}
                  disabled={isAdding}
                  className="flex items-center gap-2"
                >
                  {isAdding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  Add Friend
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
