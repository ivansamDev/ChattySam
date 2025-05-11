
"use client";

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontal, Loader2 } from 'lucide-react';
import type { ChatMessage } from "@/hooks/use-chat-store";

interface ChatInputProps {
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ addMessage, disabled }) => {
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false); // Kept for potential future local processing latency

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing || disabled) return;

    const currentMessage = inputValue.trim();
    addMessage({ text: currentMessage, sender: 'user' });
    setInputValue('');
    setIsProcessing(true);

    // Simulate a local agent response (echo)
    // Using a short delay to simulate processing, can be removed if not needed
    await new Promise(resolve => setTimeout(resolve, 300));

    addMessage({ text: `Local Agent: You said: "${currentMessage}"`, sender: 'ai' });

    setIsProcessing(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-3 border-t bg-background">
      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder={disabled ? "Initializing chat..." : "Type a message..."}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isProcessing || disabled}
          className="flex-grow rounded-full px-4 py-2 focus-visible:ring-primary"
          aria-label="Chat message input"
        />
        <Button
          type="button"
          size="icon"
          onClick={handleSendMessage}
          disabled={isProcessing || disabled || !inputValue.trim()}
          className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
          aria-label="Send message"
        >
          {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <SendHorizontal size={20} />}
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;

