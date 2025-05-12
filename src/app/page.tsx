"use client";

import React, { useState, useEffect } from 'react';
import ChatWidget from "@/components/chat/chat-widget";
import { Button } from "@/components/ui/button";
import { MessageSquare, MessageSquareX } from 'lucide-react';
import { ChatStoreProvider } from '@/hooks/use-chat-store'; // Import the provider

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  const handleOpenChat = () => {
    setIsChatOpen(true);
  };

  if (!isClient) {
    // Avoid rendering UI that depends on client-side state during SSR
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 lg:p-12">
         {/* Placeholder or loading state can go here */}
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 lg:p-12">
      {/* Optional: Add some content behind the chat widget or a welcome message */}
      {/* <h1 className="text-4xl font-bold mb-8 text-center">Welcome to ChattySam</h1> */}
      
      {isChatOpen ? (
        <ChatStoreProvider> {/* Wrap ChatWidget with the provider */}
          <ChatWidget onCloseRequested={handleCloseChat} />
        </ChatStoreProvider>
      ) : (
        <Button
          onClick={handleOpenChat}
          className="fixed bottom-5 right-5 rounded-full shadow-2xl z-50"
          size="lg"
          aria-label="Open chat"
        >
          <MessageSquare className="mr-2 h-6 w-6" /> Open Chat
        </Button>
      )}
    </main>
  );
}