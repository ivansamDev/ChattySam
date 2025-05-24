
"use client";

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { sendLocalChatMessage, type LocalChatResponse } from '@/services/local-chat-service';
import { getExternalOptions } from '@/services/external-options-service'; // No type import needed if getExternalOptions returns ActionItem[]

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
const STORAGE_ACTION = 'chattysam-current-action'; // Renamed for clarity
const EXPIRY_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface StoredChatLog {
  messages: ChatMessage[];
  createdAt: number;
}

// Modified getInitialSystemMessage to accept actions
const getInitialSystemMessage = (actions: ActionItem[]): ChatMessage => ({
  id: uuidv4(),
  text: "Hello! I'm ChattySam, your AI assistant. Here are some things I can help you with:",
  sender: 'system',
  timestamp: Date.now(),
  actions: actions,
});

// Define the shape of the context value
interface ChatStoreContextType {
  messages: ChatMessage[];
  isInitialized: boolean;
  isProcessingMessage: boolean;
  submitUserMessage: (text: string) => Promise<void>;
  submitAction: (action: string, actionName: string) => Promise<void>;
  clearChat: () => void;
}

// Create the context
const ChatStoreContext = React.createContext<ChatStoreContextType | undefined>(undefined);

// Internal hook with the actual logic
function useChatStoreInternal(): ChatStoreContextType {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isProcessingMessage, setIsProcessingMessage] = useState(false);
  const [initialActions, setInitialActions] = useState<ActionItem[]>([]); // State for fetched initial actions

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loadData = async () => {
        let loadedMessages: ChatMessage[] = [];
        let shouldAddInitialSystemMessage = true;
        let fetchedInitialActions: ActionItem[];

        try {
          fetchedInitialActions = await getExternalOptions();
          setInitialActions(fetchedInitialActions);
        } catch (error) {
          // This catch is a fallback; getExternalOptions should ideally handle its own errors and return a default.
          console.error("Error fetching initial actions in useChatStore:", error);
          fetchedInitialActions = [{ id: 'fallback-error', name: 'Error loading options', action: 'error_loading_options' }];
          setInitialActions(fetchedInitialActions);
        }

        try {
          const storedLogRaw = localStorage.getItem(STORAGE_KEY);
          if (storedLogRaw) {
            const parsedLog: StoredChatLog = JSON.parse(storedLogRaw);
            if (Date.now() - parsedLog.createdAt < EXPIRY_DURATION) {
              if (parsedLog.messages.length > 0) {
                loadedMessages = parsedLog.messages;
                shouldAddInitialSystemMessage = false;
              }
            } else {
              localStorage.removeItem(STORAGE_KEY);
            }
          }
        } catch (error) {
          console.error("Failed to load messages from localStorage", error);
          localStorage.removeItem(STORAGE_KEY);
        }

        if (shouldAddInitialSystemMessage) {
          setMessages([getInitialSystemMessage(fetchedInitialActions)]);
        } else {
          setMessages(loadedMessages);
        }
        setIsInitialized(true);
      };
      loadData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined' && initialActions.length > 0) {
      if (messages.length === 0) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }

      let effectiveCreatedAt = Date.now();
      const isDefaultInitialMessage = messages.length === 1 &&
                                    messages[0].sender === 'system' &&
                                    JSON.stringify(messages[0].actions) === JSON.stringify(initialActions);

      try {
        const storedLogRaw = localStorage.getItem(STORAGE_KEY);
        if (storedLogRaw) {
          const parsedLog: StoredChatLog = JSON.parse(storedLogRaw);
          // Check if stored messages are not just the default initial message and are within expiry
          if (parsedLog.messages.length > 0 && 
              !(parsedLog.messages.length === 1 && parsedLog.messages[0].sender === 'system' && JSON.stringify(parsedLog.messages[0].actions) === JSON.stringify(initialActions)) &&
              (Date.now() - parsedLog.createdAt < EXPIRY_DURATION)) {
            effectiveCreatedAt = parsedLog.createdAt;
          }
        }

        const logToStore: StoredChatLog = {
          messages,
          createdAt: isDefaultInitialMessage ? Date.now() : effectiveCreatedAt,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(logToStore));
      } catch (error) {
        console.error("Failed to save messages to localStorage", error);
      }
    }
  }, [messages, isInitialized, initialActions]);

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
      const storedAction = localStorage.getItem(STORAGE_ACTION);
      const response: LocalChatResponse = await sendLocalChatMessage(text, storedAction || undefined); // Pass undefined if null
      addMessageInternal({ text: response.reply, sender: 'ai', actions: response.actions });
      if (response.actions === undefined || response.actions.length === 0) { // If AI provides no further actions, clear stored action
        localStorage.removeItem(STORAGE_ACTION);
      }
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
      localStorage.setItem(STORAGE_ACTION, action);
      const response: LocalChatResponse = await sendLocalChatMessage(actionName, action);
      addMessageInternal({ text: response.reply, sender: 'ai', actions: response.actions });
       if (response.actions === undefined || response.actions.length === 0) { // If AI provides no further actions, clear stored action
        localStorage.removeItem(STORAGE_ACTION);
      }
    } catch (error) {
      console.error("Error submitting action to local agent:", error);
      addMessageInternal({ text: "Error: Could not process the action.", sender: 'system' });
    } finally {
      setIsProcessingMessage(false);
    }
  }, [isProcessingMessage, addMessageInternal]);


  const clearChat = useCallback(() => {
    if (initialActions.length > 0) {
      setMessages([getInitialSystemMessage(initialActions)]);
    } else {
      // Fallback if initialActions are not yet loaded (should be rare with current setup)
      console.warn("Clearing chat, but initial actions were not fully loaded. Using empty actions.");
      setMessages([getInitialSystemMessage([])]);
    }
    if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_ACTION); // Clear stored action as well
    }
  }, [initialActions]);


  return {
    messages,
    isInitialized,
    isProcessingMessage,
    submitUserMessage,
    submitAction,
    clearChat
  };
}

// Provider component
export const ChatStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = useChatStoreInternal();
  return <ChatStoreContext.Provider value={store}>{children}</ChatStoreContext.Provider>;
};

// Public hook to consume the context
export function useChatStore(): ChatStoreContextType {
  const context = useContext(ChatStoreContext);
  if (context === undefined) {
    throw new Error('useChatStore must be used within a ChatStoreProvider');
  }
  return context;
}
