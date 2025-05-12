"use client";

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontal, Loader2 } from 'lucide-react';
import { useChatStore } from "@/hooks/use-chat-store";

interface ChatInputProps {
  // addMessage is now handled by submitUserMessage from the store
  disabled?: boolean; // This can now be derived from isProcessingMessage from the store
}

const ChatInput: React.FC<ChatInputProps> = ({ disabled: propDisabled }) => {
  const [inputValue, setInputValue] = useState('');
  const { submitUserMessage, isProcessingMessage, isInitialized } = useChatStore();

  const effectiveDisabled = propDisabled || !isInitialized || isProcessingMessage;

  const handleSendMessage = async () => {
    if (!inputValue.trim() || effectiveDisabled) return;
    
    const messageToSend = inputValue.trim();
    setInputValue(''); // Clear input immediately
    await submitUserMessage(messageToSend);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-3 border-t border-border bg-background">
      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder={!isInitialized ? "Initializing chat..." : "Type a message..."}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={effectiveDisabled}
          className="flex-grow rounded-lg px-4 py-2 bg-input border-border focus-visible:ring-primary placeholder:text-muted-foreground"
          aria-label="Chat message input"
        />
        <Button
          type="button"
          size="icon"
          onClick={handleSendMessage}
          disabled={effectiveDisabled || !inputValue.trim()}
          className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground w-10 h-10 flex-shrink-0" 
          aria-label="Send message"
        >
          {isProcessingMessage ? <Loader2 className="h-5 w-5 animate-spin" /> : <SendHorizontal size={20} />}
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
