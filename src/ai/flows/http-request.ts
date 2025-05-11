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
  prompt: `You are a helpful AI assistant.
First, identify the language of the user's question: "{{{question}}}".
Your goal is to answer this question. If the question explicitly asks for information from a URL or implies needing current data from an external web source, use the 'httpRequest' tool to get the necessary data.
After obtaining any necessary data (or if no external data is needed for a general knowledge question), formulate a concise and informative answer.
**Crucially, your final answer must be in the same language as the user's original question.**
If you cannot answer the question or find relevant information even after using tools, indicate that in the identified user language.

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
    return { answer: output?.answer ?? 'No answer available.' };
  }
);

// EXPORTED WRAPPER FUNCTION for the FLOW.
// This is the primary exported function for using the "http request" flow.
export async function httpRequest(input: HttpRequestFlowInput): Promise<HttpRequestFlowOutput> {
  return httpRequestFlowInternal(input);
}

