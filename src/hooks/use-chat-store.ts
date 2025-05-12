"use client";

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { sendLocalChatMessage, type LocalChatResponse } from '@/services/local-chat-service';

export interface ActionItem {
  id: string;
  name: string;
  action: string; 
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: number;
  actions?: ActionItem[];
}

const STORAGE_KEY = 'chattysam-chat-log';
const EXPIRY_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface StoredChatLog {
  messages: ChatMessage[];
  createdAt: number;
}

const initialChatActions: ActionItem[] = [
  { id: 'action1', name: 'Check Order Status', action: 'check_order_status' },
  { id: 'action2', name: 'Talk to Support', action: 'talk_to_support' },
  { id: 'action3', name: 'View FAQs', action: 'view_faqs' },
  { id: 'action4', name: 'Update Profile', action: 'update_profile'},
  { id: 'action5', name: 'Track Shipment', action: 'track_shipment'},
];

const getInitialSystemMessage = (): ChatMessage => ({
  id: uuidv4(),
  text: "Hello! I'm ChattySam, your AI assistant. Here are some things I can help you with:",
  sender: 'system',
  timestamp: Date.now(),
  actions: initialChatActions,
});


export function useChatStore() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isProcessingMessage, setIsProcessingMessage] = useState(false);

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
        setMessages([getInitialSystemMessage()]);
      } else {
        setMessages(loadedMessages);
      }
      setIsInitialized(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      if (messages.length === 0) {
        // If all messages are cleared, ensure the initial system message is re-added or storage is cleared.
        // Current clearChat handles re-adding. If messages become empty by other means, storage might need clearing.
        if (localStorage.getItem(STORAGE_KEY)) {
           // If messages are empty but storage exists, means it was likely cleared and should be empty
           // or repopulated with initial. For safety, if messages array is empty, clear storage.
           // Or rely on clearChat to always set the initial message.
        }
        return; 
      }

      let effectiveCreatedAt = Date.now();
      try {
        const storedLogRaw = localStorage.getItem(STORAGE_KEY);
        // Only try to parse if there's actually a stored log and messages array is not empty.
        if (storedLogRaw && messages.length > 0) {
          const parsedLog: StoredChatLog = JSON.parse(storedLogRaw);
          // Preserve original creation timestamp if log is not expired and not empty
          if (parsedLog.messages.length > 0 && (Date.now() - parsedLog.createdAt < EXPIRY_DURATION)) {
            effectiveCreatedAt = parsedLog.createdAt;
          }
        }
        
        const logToStore: StoredChatLog = {
          messages,
          createdAt: (messages.length === 1 && messages[0].actions === initialChatActions) ? Date.now() : effectiveCreatedAt,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(logToStore));
      } catch (error) {
        console.error("Failed to save messages to localStorage", error);
      }
    }
  }, [messages, isInitialized]);

  const addMessageInternal = useCallback((messageContent: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      id: uuidv4(),
      ...messageContent,
      timestamp: Date.now(),
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  }, []);

  const submitUserMessage = useCallback(async (text: string) => {
    if (!text.trim() || isProcessingMessage) return;

    addMessageInternal({ text, sender: 'user' });
    setIsProcessingMessage(true);

    try {
      const response: LocalChatResponse = await sendLocalChatMessage(text);
      addMessageInternal({ text: response.reply, sender: 'ai', actions: response.actions });
    } catch (error) {
      console.error("Error sending message to local agent:", error);
      addMessageInternal({ text: "Error: Could not get a response from the local agent.", sender: 'system' });
    } finally {
      setIsProcessingMessage(false);
    }
  }, [isProcessingMessage, addMessageInternal]);

  const submitAction = useCallback(async (action: string, actionName: string) => {
    if (isProcessingMessage) return;

    addMessageInternal({ text: `Selected: ${actionName}`, sender: 'user' });
    setIsProcessingMessage(true);

    try {
      const response: LocalChatResponse = await sendLocalChatMessage(actionName, action);
      addMessageInternal({ text: response.reply, sender: 'ai', actions: response.actions });
    } catch (error) {
      console.error("Error submitting action to local agent:", error);
      addMessageInternal({ text: "Error: Could not process the action.", sender: 'system' });
    } finally {
      setIsProcessingMessage(false);
    }
  }, [isProcessingMessage, addMessageInternal]);


  const clearChat = useCallback(() => {
    setMessages([getInitialSystemMessage()]);
    // localStorage will be updated by the useEffect hook watching 'messages'
  }, []);


  return { 
    messages, 
    addMessage: addMessageInternal, // Keep addMessage for direct additions if needed, though submitUserMessage is primary
    clearChat, 
    isInitialized,
    submitUserMessage,
    submitAction,
    isProcessingMessage 
  };
}
