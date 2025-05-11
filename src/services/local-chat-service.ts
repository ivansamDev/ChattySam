'use server';

export interface LocalChatResponse {
  reply: string;
  localdata?: Record<string, any>;
  data?: Record<string, any>;
}

export async function sendLocalChatMessage(message: string, action?: string): Promise<LocalChatResponse> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));

  const baseUrl = process.env.EXTERNAL_MARKDOWN_API_URL;

  if (!baseUrl) {
    console.error("EXTERNAL_MARKDOWN_API_URL is not set. Returning a mock response.");
    return {
      reply: `Agent: API URL is not configured. You said "${message}"` + (action ? ` with action "${action}"` : ""),
      localdata: {
        originalMessage: message,
        action,
        timestamp: new Date().toISOString(),
        error: "EXTERNAL_MARKDOWN_API_URL not configured."
      },
    };
  }

  const endpoint = action
    ? `${baseUrl}/webhook/1c936cc2-78d2-4f5b-af1f-4fe036e5d63b/?action=${action}`
    : `${baseUrl}/webhook/1c936cc2-78d2-4f5b-af1f-4fe036e5d63b/?action=answer`; // Default action

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }), // Send the user's message in the body
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}): ${errorText}`);
      return {
        reply: `Agent: Error communicating with the server (Status: ${response.status}).`,
        localdata: {
          originalMessage: message,
          action,
          timestamp: new Date().toISOString(),
          error: `API Error: ${response.status} - ${errorText.substring(0, 200)}...`
        },
      };
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return {
        reply: `Agent: "${data?.data?.message || data?.reply || "Received a response."}"`,
        localdata: {
          originalMessage: message,
          action,
          timestamp: new Date().toISOString(),
          processingTime: Math.random() * 100,
        },
        data: data,
      };
    } else {
      const textData = await response.text();
      console.warn("Received non-JSON response from API. Content-Type:", contentType, "Body:", textData.substring(0,200) + "...");
      return {
        reply: `Agent: Received an unexpected response format from the server.`,
        localdata: {
          originalMessage: message,
          action,
          timestamp: new Date().toISOString(),
          warning: "Non-JSON response from API.",
          responseTextPreview: textData.substring(0, 200) + "..."
        },
      };
    }

  } catch (error) {
    console.error("Error sending message to local agent or parsing response:", error);
    let errorMessage = "Agent: An unexpected error occurred while contacting the service.";
    if (error instanceof SyntaxError) { // Specifically for JSON parsing errors
        errorMessage = "Agent: Received an invalid response format from the server.";
    } else if (error instanceof TypeError && (error.message.toLowerCase().includes('failed to fetch') || error.message.toLowerCase().includes('networkerror'))) {
        errorMessage = "Agent: Could not connect to the server. Please check the API URL and network connection.";
    }

    return {
      reply: errorMessage,
      localdata: {
        originalMessage: message,
        action,
        timestamp: new Date().toISOString(),
        error: (error as Error).message
      },
    };
  }
}
