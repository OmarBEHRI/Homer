"use client";

import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { CopyChatIdButton } from "@/components/chat/CopyChatIdButton";

export default function ChatPage() {
  const [selectedChatId, setSelectedChatId] = useState<Id<"chats"> | undefined>();
  const [selectedMessageId, setSelectedMessageId] = useState<Id<"messages"> | undefined>();

  const handleChatSelect = (chatId: Id<"chats">) => {
    setSelectedChatId(chatId);
    setSelectedMessageId(undefined); // Clear selected message when switching chats
  };

  const handleMessageSelect = (chatId: Id<"chats">, messageId: Id<"messages">) => {
    setSelectedChatId(chatId);
    setSelectedMessageId(messageId);
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0">
        <ChatSidebar
          selectedChatId={selectedChatId}
          onChatSelect={handleChatSelect}
          onMessageSelect={handleMessageSelect}
        />
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header with Copy Chat ID Button */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">Chat</h1>
          <CopyChatIdButton />
        </div>
        
        <ChatInterface
          chatId={selectedChatId}
          onMessageSelect={setSelectedMessageId}
          selectedMessageId={selectedMessageId}
        />
      </div>
    </div>
  );
}