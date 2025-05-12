"use client";

import React from 'react';
import type { ChatMessage, ActionItem } from "@/hooks/use-chat-store";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Bot } from 'lucide-react';

interface ChatMessageItemProps {
  message: ChatMessage;
  onActionClick: (action: string, actionName: string) => void;
  isProcessingAction: boolean;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, onActionClick, isProcessingAction }) => {
  const isUser = message.sender === 'user';
  const isAI = message.sender === 'ai';
  const isSystem = message.sender === 'system';

  const timeAgo = format(new Date(message.timestamp), "h:mm aa");

  const messageContainerClasses = cn(
    "flex items-end gap-2 w-full",
    isUser ? "justify-end" : "justify-start"
  );

  const bubbleClasses = cn(
    "max-w-[100%] px-3 py-2 shadow",
    "rounded-lg",
    isUser ? "bg-primary text-primary-foreground rounded-br-sm" :
    isAI ? "bg-secondary text-secondary-foreground rounded-bl-sm" :
    "bg-muted text-muted-foreground text-xs italic" 
  );
  
  const systemBubbleClasses = cn(
    "max-w-[100%] px-3 py-2 shadow",
    "rounded-lg",
    "bg-card text-card-foreground" // System messages with actions use card background
  );


  if (isSystem) {
    return (
      <div className={cn("flex flex-col items-center w-full my-2")}>
        <div className={message.actions && message.actions.length > 0 ? systemBubbleClasses : bubbleClasses}>
          <p className={cn("whitespace-pre-wrap", message.actions && message.actions.length > 0 ? "text-sm" : "text-xs italic")}>{message.text}</p>
          {message.actions && message.actions.length > 0 && (
            <div className="mt-2.5 space-y-1.5 flex flex-col items-stretch">
              {message.actions.map((action: ActionItem) => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start h-auto py-1.5 px-2.5 text-left text-sm"
                  onClick={() => onActionClick(action.action, action.name)}
                  disabled={isProcessingAction}
                >
                  {action.name}
                </Button>
              ))}
            </div>
          )}
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
            {message.actions && message.actions.length > 0 && isAI && ( // AI can also return actions
            <div className="mt-2.5 space-y-1.5 flex flex-col items-stretch">
              {message.actions.map((action: ActionItem) => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start h-auto py-1.5 px-2.5 text-left text-sm bg-secondary hover:bg-secondary/80 border-primary/30 hover:border-primary/50"
                  onClick={() => onActionClick(action.action, action.name)}
                  disabled={isProcessingAction}
                >
                  {action.name}
                </Button>
              ))}
            </div>
          )}
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
