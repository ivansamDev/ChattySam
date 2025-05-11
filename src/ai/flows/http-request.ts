// This is an example Genkit flow definition.

'use server';

/**
 * @fileOverview An AI agent that uses an HttpRequest tool to fetch external data.
 *
 * - httpRequest - A function that handles making HTTP requests and returning the data.
 * - HttpRequestInput - The input type for the httpRequest function.
 * - HttpRequestOutput - The return type for the httpRequest function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HttpRequestInputSchema = z.object({
  url: z.string().describe('The URL to make the HTTP request to.'),
});
export type HttpRequestInput = z.infer<typeof HttpRequestInputSchema>;

const HttpRequestOutputSchema = z.object({
  data: z.string().describe('The data returned from the HTTP request.'),
});
export type HttpRequestOutput = z.infer<typeof HttpRequestOutputSchema>;

export async function httpRequest(input: HttpRequestInput): Promise<HttpRequestOutput> {
  return httpRequestFlow(input);
}

const httpRequestTool = ai.defineTool({
  name: 'httpRequest',
  description: 'Make an HTTP request to fetch external data.',
  inputSchema: HttpRequestInputSchema,
  outputSchema: HttpRequestOutputSchema,
  async execute(input) {
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

const httpRequestPrompt = ai.definePrompt({
  name: 'httpRequestPrompt',
  tools: [httpRequestTool],
  prompt: `You are a helpful AI assistant.  If the user asks a question that requires fetching data from an external source, use the httpRequest tool to get the data.  Then, provide a concise and informative answer to the user, using the data you retrieved.  If the user's question does not require external data, answer the question directly.

User question: {{{question}}}`,
});

const HttpRequestFlowInputSchema = z.object({
  question: z.string().describe('The user question.'),
});

const HttpRequestFlowOutputSchema = z.object({
  answer: z.string().describe('The answer to the user question.'),
});

const httpRequestFlow = ai.defineFlow(
  {
    name: 'httpRequestFlow',
    inputSchema: HttpRequestFlowInputSchema,
    outputSchema: HttpRequestFlowOutputSchema,
  },
  async input => {
    const {output} = await httpRequestPrompt({question: input.question});
    return {answer: output?.answer ?? 'No answer available.'};
  }
);
