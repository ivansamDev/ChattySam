"use client";

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontal, Loader2 } from 'lucide-react';
import type { ChatMessage } from "@/hooks/use-chat-store";

import { httpRequest as executeHttpRequestTool } from '@/ai/flows/http-request';
import { httpRequestFlow } from '@/ai/flows/http-request';
import { storeAction } from '@/ai/flows/store-action';
import { generateGreeting } from '@/ai/flows/generate-greeting';

interface ChatInputProps {
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ addMessage, disabled }) => {
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing || disabled) return;

    const currentMessage = inputValue.trim();
    addMessage({ text: currentMessage, sender: 'user' });
    setInputValue('');
    setIsProcessing(true);

    try {
      if (currentMessage.startsWith('/http ')) {
        const url = currentMessage.substring(6).trim();
        if (url) {
          const result = await executeHttpRequestTool({ url });
          addMessage({ text: `Data from ${url}:\n${result.data}`, sender: 'ai' });
        } else {
          addMessage({ text: "Usage: /http <URL>", sender: 'system' });
        }
      } else if (currentMessage.startsWith('/action ')) {
        const actionText = currentMessage.substring(8).trim();
        if (actionText) {
          const result = await storeAction({ action: actionText });
          addMessage({ text: `Action processed: ${result.storedAction}`, sender: 'ai' });
        } else {
          addMessage({ text: "Usage: /action <description>", sender: 'system' });
        }
      } else {
        let greetingProcessed = false;
        const greetingResult = await generateGreeting({ message: currentMessage });
        if (greetingResult.isGreeting) {
          addMessage({ text: greetingResult.greetingMessage, sender: 'ai' });
          greetingProcessed = true;
        }

        const httpFlowResult = await httpRequestFlow({ question: currentMessage });
        const isMeaningfulAnswer = httpFlowResult.answer && httpFlowResult.answer.toLowerCase() !== 'no answer available.';
        const isNewAnswer = !greetingProcessed || (greetingProcessed && httpFlowResult.answer !== greetingResult.greetingMessage);

        if (isMeaningfulAnswer && isNewAnswer) {
          addMessage({ text: httpFlowResult.answer, sender: 'ai' });
        } else if (!greetingProcessed && !isMeaningfulAnswer) {
          // No specific AI response for this general query
          // You could add a default message here if desired, e.g.,
          // addMessage({ text: "I'm not sure how to respond to that. Try asking about specific data or use a command.", sender: 'ai' });
        }
      }
    } catch (error) {
      console.error("Error processing AI:", error);
      addMessage({ text: "Sorry, I encountered an error while processing your request.", sender: 'system' });
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
