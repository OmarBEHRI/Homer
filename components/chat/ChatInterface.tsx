"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { Loader2, MessageCircle } from "lucide-react";

interface ChatInterfaceProps {
  chatId?: Id<"chats">;
  onMessageSelect?: (messageId: Id<"messages">) => void;
  selectedMessageId?: Id<"messages">;
}

export function ChatInterface({ chatId, onMessageSelect, selectedMessageId }: ChatInterfaceProps) {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Get current user
  const currentUser = useQuery(api.users.getCurrentUser);

  // Get messages for the selected chat
  const messagesData = useQuery(
    api.chatQueries.getMessages,
    chatId ? { chatId, cursor } : "skip"
  );

  const markMessagesAsSeen = useMutation(api.chatMutations.markMessagesAsSeen);

  // Mark messages as seen when chat is opened
  useEffect(() => {
    if (chatId && currentUser) {
      markMessagesAsSeen({ chatId }).catch(console.error);
    }
  }, [chatId, currentUser, markMessagesAsSeen]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesData?.messages]);

  // Scroll to selected message
  useEffect(() => {
    if (selectedMessageId && messagesContainerRef.current) {
      const messageElement = document.getElementById(`message-${selectedMessageId}`);
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
        // Highlight the selected message temporarily
        messageElement.classList.add("bg-yellow-100");
        setTimeout(() => {
          messageElement.classList.remove("bg-yellow-100");
        }, 2000);
      }
    }
  }, [selectedMessageId]);

  const loadMoreMessages = async () => {
    if (!messagesData?.continueCursor || isLoadingMore) return;

    setIsLoadingMore(true);
    setCursor(messagesData.continueCursor);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    if (scrollTop === 0 && hasMoreMessages && !isLoadingMore) {
      loadMoreMessages();
    }
  };

  // Update hasMoreMessages when messagesData changes
  useEffect(() => {
    if (messagesData) {
      setHasMoreMessages(!messagesData.isDone);
      setIsLoadingMore(false);
    }
  }, [messagesData]);

  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a chat</h3>
          <p className="text-gray-500">Choose a conversation from the sidebar to start chatting</p>
        </div>
      </div>
    );
  }

  if (!messagesData) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const { messages } = messagesData;

  return (
    <div className="flex flex-col flex-1 bg-gray-50">
      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 pt-4 pb-2 space-y-4 max-h-[calc(100vh-16rem)]"
        onScroll={handleScroll}
      >
        {/* Load More Button */}
        {hasMoreMessages && (
          <div className="flex justify-center">
            <button
              onClick={loadMoreMessages}
              disabled={isLoadingMore}
              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              {isLoadingMore ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              ) : (
                "Load older messages"
              )}
            </button>
          </div>
        )}

        {/* Messages */}
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">No messages yet</p>
              <p className="text-sm text-gray-400">Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwnMessage = message.senderId === currentUser?._id;
            const prevMessage = messages[index - 1];
            const nextMessage = messages[index + 1];
            
            // Show avatar if this is the first message from this sender in a group
            const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId;
            
            // Show timestamp if there's a significant time gap or it's the last message
            const showTimestamp = 
              !nextMessage || 
              nextMessage.senderId !== message.senderId ||
              (nextMessage.createdAt - message.createdAt) > 300000; // 5 minutes

            return (
              <div
                key={message._id}
                id={`message-${message._id}`}
                className={`${selectedMessageId === message._id ? "bg-yellow-50 rounded-lg p-2 -m-2" : ""}`}
              >
                <MessageBubble
                  message={message}
                  sender={message.sender}
                  isOwnMessage={isOwnMessage}
                  showAvatar={showAvatar}
                  showTimestamp={showTimestamp}
                />
              </div>
            );
          })
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput 
        chatId={chatId} 
        onMessageSent={() => {
          // Scroll to bottom after sending
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }}
      />
    </div>
  );
}
