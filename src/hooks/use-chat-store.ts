// Suggested code may be subject to a license. Learn more: ~LicenseLog:3324088040.
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

// Define the action type
interface ActionItem {
  id: string;
  name: string;
  action: string; // Could be an enum or specific string types if actions are predefined
}

// Sample actions
const initialChatActions: ActionItem[] = [
  { id: 'action1', name: 'Check Order Status', action: 'check_order_status' },
  { id: 'action2', name: 'Talk to Support', action: 'talk_to_support' },
  { id: 'action3', name: 'View FAQs', action: 'view_faqs' },
  { id: 'action4', name: 'Update Profile', action: 'update_profile'},
  { id: 'action5', name: 'Track Shipment', action: 'track_shipment'},
];

// Function to format actions into a message string
const formatActionsForMessage = (actions: ActionItem[]): string => {
  let message = "Hello! I'm ChattySam, your AI assistant. Here are some things I can help you with:";
  actions.forEach(action => {
    message += `\n- ${action.name}`;
  });
  message += "\n\nHow can I assist you today?";
  return message;
};


export function useChatStore() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let loadedMessages: ChatMessage[] = [];
      let shouldAddInitialMessage = true; 

      try {
        const storedLogRaw = localStorage.getItem(STORAGE_KEY);
        if (storedLogRaw) {
          const parsedLog: StoredChatLog = JSON.parse(storedLogRaw);
          if (Date.now() - parsedLog.createdAt < EXPIRY_DURATION) {
            if (parsedLog.messages.length > 0) {
              loadedMessages = parsedLog.messages;
              shouldAddInitialMessage = false; 
            }
          } else {
            localStorage.removeItem(STORAGE_KEY); 
          }
        }
      } catch (error) {
        console.error("Failed to load messages from localStorage", error);
        localStorage.removeItem(STORAGE_KEY);
      }

      if (shouldAddInitialMessage) {
        const actionsMessageText = formatActionsForMessage(initialChatActions);
        const systemMessage: ChatMessage = {
          id: uuidv4(),
          text: actionsMessageText,
          sender: 'system',
          timestamp: Date.now(),
        };
        setMessages([systemMessage]);
      } else {
        setMessages(loadedMessages);
      }
      setIsInitialized(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      if (messages.length === 0) {
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
          if (parsedLog.messages.length > 0 && (Date.now() - parsedLog.createdAt < EXPIRY_DURATION)) {
            effectiveCreatedAt = parsedLog.createdAt;
          }
        }
        
        const logToStore: StoredChatLog = {
          messages,
          createdAt: effectiveCreatedAt,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(logToStore));
      } catch (error) {
        console.error("Failed to save messages to localStorage", error);
        const logToStore: StoredChatLog = {
          messages,
          createdAt: Date.now(), 
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
    // Add the initial system message again after clearing
    const actionsMessageText = formatActionsForMessage(initialChatActions);
    const systemMessage: ChatMessage = {
      id: uuidv4(),
      text: actionsMessageText,
      sender: 'system',
      timestamp: Date.now(),
    };
    setMessages([systemMessage]);
    // The useEffect for messages will handle removing/updating localStorage
  }, []);


  return { messages, addMessage, clearChat, isInitialized };
}
