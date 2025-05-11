
'use server';

export interface LocalChatResponse {
  reply: string;
  data?: Record<string, any>; 
}

export async function sendLocalChatMessage(message: string): Promise<LocalChatResponse> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));

  // Simple echo logic, but can be expanded to more complex responses
  return {
    reply: `Local Agent: You said: "${message}"`,
    data: {
      originalMessage: message,
      timestamp: new Date().toISOString(),
      processingTime: Math.random() * 100, // Example additional data
    }
  };
}
