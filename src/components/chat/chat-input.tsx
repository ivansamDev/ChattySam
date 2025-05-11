
"use client";

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontal, Loader2 } from 'lucide-react';
import type { ChatMessage } from "@/hooks/use-chat-store";
import { sendLocalChatMessage, type LocalChatResponse } from '@/services/local-chat-service';

interface ChatInputProps {
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ addMessage, disabled }) => {
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing || disabled) return;

    const userMessageText = inputValue.trim();
    addMessage({ text: userMessageText, sender: 'user' });
    setInputValue('');
    setIsProcessing(true);

    try {
      const response: LocalChatResponse = await sendLocalChatMessage(userMessageText);
      addMessage({ text: response.reply, sender: 'ai' });
      // Optionally, you could log or use response.data
      // console.log("Local agent response data:", response.data);
    } catch (error) {
      console.error("Error sending message to local agent:", error);
      addMessage({ text: "Error: Could not get a response from the local agent.", sender: 'system' });
    } finally {
      setIsProcessing(false);
    }
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
