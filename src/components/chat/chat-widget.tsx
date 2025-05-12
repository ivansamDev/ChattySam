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
  // useChatStore is now the source of truth for messages, actions, and processing state
  const { clearChat, isInitialized } = useChatStore();

  return (
    <Card className="fixed bottom-5 right-5 w-[380px] h-[550px] shadow-2xl rounded-lg flex flex-col overflow-hidden z-50 border border-border">
      <ChatHeader onClearChat={clearChat} onCloseChat={onCloseRequested} />
      <CardContent className="flex-grow flex flex-col p-0 overflow-hidden bg-background">
        {/* ChatMessages now gets its data directly from useChatStore */}
        <ChatMessages />
        {/* ChatInput also gets its data and actions from useChatStore */}
        <ChatInput disabled={!isInitialized} />
      </CardContent>
    </Card>
  );
};

export default ChatWidget;
