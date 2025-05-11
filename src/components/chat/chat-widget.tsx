
"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import ChatHeader from "./chat-header";
import ChatMessages from "./chat-messages";
import ChatInput from "./chat-input";
import { useChatStore } from "@/hooks/use-chat-store";

interface ChatWidgetProps {
  onCloseRequested: () => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ onCloseRequested }) => {
  const { messages, addMessage, clearChat, isInitialized } = useChatStore();

  return (
    <Card className="fixed bottom-5 right-5 w-[380px] h-[550px] shadow-2xl rounded-lg flex flex-col overflow-hidden z-50 border-2 border-primary/20">
      <ChatHeader onClearChat={clearChat} onCloseChat={onCloseRequested} />
      <CardContent className="flex-grow flex flex-col p-0 overflow-hidden">
        <ChatMessages messages={messages} isInitialized={isInitialized} />
        <ChatInput addMessage={addMessage} disabled={!isInitialized} />
      </CardContent>
    </Card>
  );
};

export default ChatWidget;

