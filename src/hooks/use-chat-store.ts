"use client";

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: number;
}

const STORAGE_KEY = 'chattysam-chat-log';
const EXPIRY_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface StoredChatLog {
  messages: ChatMessage[];
  createdAt: number;
}

export function useChatStore() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedLogRaw = localStorage.getItem(STORAGE_KEY);
        if (storedLogRaw) {
          const parsedLog: StoredChatLog = JSON.parse(storedLogRaw);
          if (Date.now() - parsedLog.createdAt < EXPIRY_DURATION) {
            setMessages(parsedLog.messages);
          } else {
            localStorage.removeItem(STORAGE_KEY); // Clear expired log
          }
        }
      } catch (error) {
        console.error("Failed to load messages from localStorage", error);
        localStorage.removeItem(STORAGE_KEY);
      }
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      if (messages.length === 0) {
        // If all messages are cleared, attempt to remove the log from localStorage
        // This check ensures we don't repeatedly try to remove if it's already gone
        if (localStorage.getItem(STORAGE_KEY)) {
          localStorage.removeItem(STORAGE_KEY);
        }
        return;
      }

      let effectiveCreatedAt = Date.now();
      try {
        const storedLogRaw = localStorage.getItem(STORAGE_KEY);
        if (storedLogRaw) {
          const parsedLog: StoredChatLog = JSON.parse(storedLogRaw);
          // If there was a previous log with messages, and it's still valid, keep its createdAt.
          if (parsedLog.messages.length > 0 && (Date.now() - parsedLog.createdAt < EXPIRY_DURATION)) {
            effectiveCreatedAt = parsedLog.createdAt;
          }
          // If parsedLog.messages was empty, or log was expired, effectiveCreatedAt remains Date.now(), starting a new log session.
        }
        
        const logToStore: StoredChatLog = {
          messages,
          createdAt: effectiveCreatedAt,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(logToStore));
      } catch (error) {
        console.error("Failed to save messages to localStorage", error);
        // Fallback: save with current time if parsing failed or if there's an issue with the existing log
        const logToStore: StoredChatLog = {
          messages,
          createdAt: Date.now(), // This might overwrite a valid older timestamp in error cases
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(logToStore));
      }
    }
  }, [messages, isInitialized]);

  const addMessage = useCallback((messageContent: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      id: uuidv4(),
      ...messageContent,
      timestamp: Date.now(),
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    // The useEffect for messages will handle removing from localStorage
  }, []);


  return { messages, addMessage, clearChat, isInitialized };
}
