
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Trash2, MessageCircle, X } from 'lucide-react'; // Using MessageCircle as a logo icon

interface ChatHeaderProps {
  onClearChat: () => void;
  onCloseChat: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onClearChat, onCloseChat }) => {
  return (
    <div className="bg-primary text-primary-foreground p-3 flex items-center justify-between rounded-t-md">
      <div className="flex items-center gap-2">
        <MessageCircle size={24} />
        <h2 className="text-lg font-semibold">ChattySam</h2>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClearChat}
          className="text-primary-foreground hover:bg-primary/80"
          aria-label="Clear chat"
        >
          <Trash2 size={20} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCloseChat}
          className="text-primary-foreground hover:bg-primary/80"
          aria-label="Close chat"
        >
          <X size={20} />
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;

