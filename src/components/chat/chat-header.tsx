
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Trash2, X } from 'lucide-react';

interface ChatHeaderProps {
  onClearChat: () => void;
  onCloseChat: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onClearChat, onCloseChat }) => {
  return (
    <div className="bg-background text-foreground p-3 flex items-center justify-between rounded-t-lg border-b border-border">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">AI Assistant</h2>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClearChat}
          className="text-muted-foreground hover:text-foreground hover:bg-muted/50"
          aria-label="Clear chat"
        >
          <Trash2 size={20} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCloseChat}
          className="text-muted-foreground hover:text-foreground hover:bg-muted/50"
          aria-label="Close chat"
        >
          <X size={20} />
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
