
// This is an example Genkit flow definition.

'use server';

/**
 * @fileOverview An AI agent that uses an HttpRequest tool to fetch external data and responds in the user's language.
 *
 * - httpRequest - A function that handles running the flow to answer a question, potentially using an HTTP request.
 * - HttpRequestFlowInput - The input type for the httpRequest flow function.
 * - HttpRequestFlowOutput - The return type for the httpRequest flow function.
 * - executeDirectHttpRequest - A function for directly executing the HTTP request tool.
 * - HttpRequestToolInput - The input type for the direct tool execution.
 * - HttpRequestToolOutput - The return type for a direct tool execution.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Schemas and types for the TOOL
const HttpRequestToolInputSchemaInternal = z.object({
  url: z.string().describe('The URL to make the HTTP request to.'),
});
export type HttpRequestToolInput = z.infer<typeof HttpRequestToolInputSchemaInternal>;

const HttpRequestToolOutputSchemaInternal = z.object({
  data: z.string().describe('The data returned from the HTTP request.'),
});
export type HttpRequestToolOutput = z.infer<typeof HttpRequestToolOutputSchemaInternal>;

// Tool definition
const httpRequestTool = ai.defineTool({
  name: 'httpRequest',
  description: 'Make an HTTP request to fetch external data. Use this tool if the user\'s question requires information from a specific URL.',
  inputSchema: HttpRequestToolInputSchemaInternal,
  outputSchema: HttpRequestToolOutputSchemaInternal,
  async execute(input: HttpRequestToolInput): Promise<HttpRequestToolOutput> {
    try {
      const response = await fetch(input.url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.text();
      return {data};
    } catch (error: any) {
      console.error('Error making HTTP request:', error);
      return {data: `Error: ${error.message}`};
    }
  },
});

// Exported function for DIRECT TOOL EXECUTION
export async function executeDirectHttpRequest(input: HttpRequestToolInput): Promise<HttpRequestToolOutput> {
  return httpRequestTool.execute(input);
}

// Schemas and types for the FLOW
const HttpRequestFlowInputSchemaInternal = z.object({
  question: z.string().describe('The user question.'),
});
export type HttpRequestFlowInput = z.infer<typeof HttpRequestFlowInputSchemaInternal>;

const HttpRequestFlowOutputSchemaInternal = z.object({
  answer: z.string().describe('The answer to the user question, in the user\'s language.'),
});
export type HttpRequestFlowOutput = z.infer<typeof HttpRequestFlowOutputSchemaInternal>;


// Prompt for the FLOW
const httpRequestPrompt = ai.definePrompt({
  name: 'httpRequestPrompt',
  tools: [httpRequestTool],
  input: { schema: HttpRequestFlowInputSchemaInternal }, // Specify input schema for prompt
  output: { schema: HttpRequestFlowOutputSchemaInternal }, // Specify output schema for prompt
  prompt: `You are an AI assistant designed to answer questions *only* using information retrieved via the 'httpRequest' tool. You *must not* use general knowledge.
First, identify the language of the user's question: "{{{question}}}".

If the user's question requires information from a URL, use the 'httpRequest' tool to fetch the data.
- If the tool successfully retrieves data, analyze this data and formulate a concise answer based *solely* on it.
- If the tool is used but returns an error or no relevant data (e.g., the 'data' field in the tool's output contains an error message or is empty/irrelevant), you *must* state that you were unable to retrieve the necessary information from the specified URL.
- If the user's question does not seem to require fetching data from a URL (i.e., the 'httpRequest' tool is not applicable or not used), you *must* state that you can only answer questions that involve fetching content from a URL and cannot answer this type of query.

**Crucially, all your responses, including explanations of inability to answer, must be in the same language as the user's original question.**

User question: {{{question}}}`,
});

// Internal flow definition
const httpRequestFlowInternal = ai.defineFlow(
  {
    name: 'httpRequestFlowInternal', // Genkit flow name
    inputSchema: HttpRequestFlowInputSchemaInternal,
    outputSchema: HttpRequestFlowOutputSchemaInternal,
  },
  async (input: HttpRequestFlowInput) => {
    const { output } = await httpRequestPrompt(input);
    // The prompt now guides the LLM to always provide a structured response.
    // The fallback 'No answer available.' should ideally not be hit if the LLM adheres to the prompt.
    return { answer: output?.answer ?? 'An unexpected error occurred, and no answer could be formulated.' };
  }
);

// EXPORTED WRAPPER FUNCTION for the FLOW.
// This is the primary exported function for using the "http request" flow.
export async function httpRequest(input: HttpRequestFlowInput): Promise<HttpRequestFlowOutput> {
  return httpRequestFlowInternal(input);
}

