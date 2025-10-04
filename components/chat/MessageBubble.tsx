"use client";

import { Check, CheckCheck } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface MessageBubbleProps {
  message: {
    _id: Id<"messages">;
    content: string;
    createdAt: number;
    senderId: Id<"users">;
    seen: boolean;
    seenAt?: number;
  };
  sender: {
    _id: Id<"users">;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    avatarUrl?: string;
  } | null;
  isOwnMessage: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
}

export function MessageBubble({ 
  message, 
  sender, 
  isOwnMessage, 
  showAvatar = true, 
  showTimestamp = true 
}: MessageBubbleProps) {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const displayName = sender?.fullName || 
    `${sender?.firstName || ""} ${sender?.lastName || ""}`.trim() || 
    "Unknown User";

  return (
    <div className={`flex gap-2 ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      {showAvatar && !isOwnMessage && (
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
          {sender?.avatarUrl ? (
            <img
              src={sender.avatarUrl}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            displayName[0].toUpperCase()
          )}
        </div>
      )}

      {/* Message Content */}
      <div className={`flex flex-col max-w-[70%] ${isOwnMessage ? "items-end" : "items-start"}`}>
        {/* Sender Name (only for received messages) */}
        {!isOwnMessage && showAvatar && (
          <span className="text-xs text-gray-500 mb-1 px-2">
            {displayName}
          </span>
        )}

        {/* Message Bubble */}
        <div
          className={`px-3 py-2 rounded-2xl ${
            isOwnMessage
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-900"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>

        {/* Timestamp and Status */}
        <div className={`flex items-center gap-1 mt-1 ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}>
          {showTimestamp && (
            <span className="text-xs text-gray-500">
              {formatTime(message.createdAt)}
            </span>
          )}
          
          {/* Read Receipt (only for own messages) */}
          {isOwnMessage && (
            <div className="flex items-center">
              {message.seen ? (
                <CheckCheck className="h-3 w-3 text-blue-500" />
              ) : (
                <Check className="h-3 w-3 text-gray-400" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Spacer for own messages */}
      {showAvatar && isOwnMessage && <div className="w-8" />}
    </div>
  );
}
