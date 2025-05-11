"use client";

import React, { useEffect, useRef } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatMessageItem from "./chat-message-item";
import type { ChatMessage } from "@/hooks/use-chat-store";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatMessagesProps {
  messages: ChatMessage[];
  isInitialized: boolean;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isInitialized }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isInitialized) {
    return (
      <div className="flex-grow p-4 space-y-3">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-10 w-1/2 ml-auto" />
        <Skeleton className="h-10 w-2/3" />
      </div>
    );
  }

  return (
    <ScrollArea className="flex-grow w-full p-4">
      <div className="space-y-3">
        {messages.map((msg) => (
          <ChatMessageItem key={msg.id} message={msg} />
        ))}
      </div>
      <div ref={messagesEndRef} />
    </ScrollArea>
  );
};

export default ChatMessages;
