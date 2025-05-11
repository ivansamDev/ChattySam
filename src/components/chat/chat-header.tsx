"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Trash2, MessageCircle } from 'lucide-react'; // Using MessageCircle as a logo icon

interface ChatHeaderProps {
  onClearChat: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onClearChat }) => {
  return (
    <div className="bg-primary text-primary-foreground p-3 flex items-center justify-between rounded-t-md">
      <div className="flex items-center gap-2">
        <MessageCircle size={24} />
        <h2 className="text-lg font-semibold">ChattySam</h2>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClearChat}
        className="text-primary-foreground hover:bg-primary/80"
        aria-label="Clear chat"
      >
        <Trash2 size={20} />
      </Button>
    </div>
  );
};

export default ChatHeader;
