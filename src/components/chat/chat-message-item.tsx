"use client";

import React from 'react';
import type { ChatMessage } from "@/hooks/use-chat-store";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Bot } from 'lucide-react';

interface ChatMessageItemProps {
  message: ChatMessage;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const isAI = message.sender === 'ai';
  const isSystem = message.sender === 'system';

  const timeAgo = format(new Date(message.timestamp), "h:mm aa");

  const messageContainerClasses = cn(
    "flex items-end gap-2 w-full",
    isUser ? "justify-end" : "justify-start"
  );

  const bubbleClasses = cn(
    "max-w-[80%] px-3 py-2 shadow", // Adjusted padding
    "rounded-lg", // Base rounding from --radius (0.75rem)
    isUser ? "bg-primary text-primary-foreground rounded-br-sm" : // User message with pointy bottom-right
    isAI ? "bg-secondary text-secondary-foreground rounded-bl-sm" : // AI message with pointy bottom-left
    "bg-muted text-muted-foreground text-xs italic" // System message
  );

  if (isSystem) {
    return (
      <div className={cn("flex flex-col items-center w-full my-2")}>
        <div className={bubbleClasses}>
          <p className="text-sm break-words whitespace-pre-wrap">{message.text}</p>
        </div>
         <span className={cn("text-xs mt-1.5 text-center", "text-muted-foreground")}>
          {timeAgo}
        </span>
      </div>
    );
  }

  return (
    <div className={messageContainerClasses}>
      {!isUser && isAI && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-muted text-muted-foreground">
            <Bot size={18} />
          </AvatarFallback>
        </Avatar>
      )}
      <div className={cn("flex flex-col", isUser ? "items-end" : "items-start")}>
        <div className={bubbleClasses}>
          <p className="text-sm break-words whitespace-pre-wrap">{message.text}</p>
        </div>
        <span className={cn("text-xs mt-1.5", isUser ? "text-right pr-1" : "text-left pl-1", "text-muted-foreground")}>
          {timeAgo}
        </span>
      </div>
       {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-muted text-muted-foreground">
            <User size={18} />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ChatMessageItem;
