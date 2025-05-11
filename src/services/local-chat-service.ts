
'use server';

export interface LocalChatResponse {
  reply: string;
  localdata?: Record<string, any>; 
  data?: Record<string, any>; 
}

export async function sendLocalChatMessage(message: string): Promise<LocalChatResponse> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));
  // Suggested code may be subject to a license. Learn more: ~LicenseLog:3571554918.
  const externalApiUrl = process.env.EXTERNAL_MARKDOWN_API_URL;
  const response = await fetch(externalApiUrl+'/webhook-test/1c936cc2-78d2-4f5b-af1f-4fe036e5d63b/?action=answer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  const data = await response.json();

  // Simple echo logic, but can be expanded to more complex responses
  return {
    reply: `Agent: "${data.data.message}"`,
    localdata :{
      originalMessage: message,
      timestamp: new Date().toISOString(),
      processingTime: Math.random() * 100, // Example additional data
    },
    data: data,
  };
}
