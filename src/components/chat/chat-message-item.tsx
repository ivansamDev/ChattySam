"use client";

import React from 'react';
import type { ChatMessage } from "@/hooks/use-chat-store";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';

interface ChatMessageItemProps {
  message: ChatMessage;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';

  const timeAgo = formatDistanceToNow(new Date(message.timestamp), { addSuffix: true });

  return (
    <div className={cn("flex flex-col", isUser ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[75%] p-3 rounded-lg shadow",
          isUser ? "bg-secondary text-secondary-foreground rounded-br-none" : 
          isSystem ? "bg-muted text-muted-foreground rounded-bl-none text-xs italic" :
          "bg-accent text-accent-foreground rounded-bl-none" 
        )}
      >
        <p className="text-sm break-words whitespace-pre-wrap">{message.text}</p>
      </div>
      <span className={cn("text-xs mt-1", isUser ? "text-right" : "text-left", "text-muted-foreground opacity-80")}>
        {timeAgo}
      </span>
    </div>
  );
};

export default ChatMessageItem;
