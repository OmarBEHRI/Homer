"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Copy, Check, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CopyChatIdButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const currentUser = useQuery(api.users.getCurrentUser);
  const ensureChatId = useMutation(api.users.ensureChatId);

  const handleGenerateChatId = useCallback(async () => {
    setIsGenerating(true);
    try {
      await ensureChatId();
      // The query will automatically refetch and update the UI
    } catch (error) {
      console.error("Failed to generate chat ID:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [ensureChatId]);

  // Automatically generate chatId when modal opens if user doesn't have one
  useEffect(() => {
    if (isOpen && currentUser && !currentUser.chatId && !isGenerating) {
      handleGenerateChatId();
    }
  }, [isOpen, currentUser?.chatId, isGenerating, handleGenerateChatId]);

  const handleCopyChatId = async () => {
    if (currentUser?.chatId) {
      try {
        await navigator.clipboard.writeText(currentUser.chatId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy chat ID:", err);
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = currentUser.chatId;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  // Show loading state while user data is being fetched
  if (currentUser === undefined) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        disabled
      >
        <User className="h-4 w-4" />
        Loading...
      </Button>
    );
  }

  // Show button even if no chatId - user can still see the modal
  // This helps with debugging and user experience

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <User className="h-4 w-4" />
          My Chat ID
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Your Chat ID
          </DialogTitle>
          <DialogDescription>
            Share this ID with others so they can add you as a friend and start chatting.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {currentUser?.chatId ? (
            <>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Your Chat ID:</p>
                    <p className="text-lg font-mono font-bold text-gray-900 mt-1">
                      {currentUser.chatId}
                    </p>
                  </div>
                  <Button
                    onClick={handleCopyChatId}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p className="font-medium mb-2">How to share:</p>
                <ul className="space-y-1 text-sm">
                  <li>• Copy your Chat ID using the button above</li>
                  <li>• Share it with friends via text, email, or social media</li>
                  <li>• They can use "Add Friend" to find you and start chatting</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-center">
                <p className="text-sm font-medium text-blue-800 mb-2">
                  Generate Your Chat ID
                </p>
                <p className="text-sm text-blue-700 mb-4">
                  You need a chat ID to share with others so they can add you as a friend.
                </p>
                <Button
                  onClick={handleGenerateChatId}
                  disabled={isGenerating}
                  className="flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4" />
                      Generate Chat ID
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
