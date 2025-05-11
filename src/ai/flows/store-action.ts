// The `use server` directive indicates that this code will run only on the server.
'use server';

/**
 * @fileOverview A Genkit flow for storing and displaying actions in a conversation.
 *
 * - storeAction - A function that triggers the 'actions' tool to store an action and display it in the conversation.
 * - StoreActionInput - The input type for the storeAction function.
 * - StoreActionOutput - The return type for the storeAction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StoreActionInputSchema = z.object({
  action: z.string().describe('The action to be stored and displayed.'),
});
export type StoreActionInput = z.infer<typeof StoreActionInputSchema>;

const StoreActionOutputSchema = z.object({
  storedAction: z.string().describe('The action that was stored.'),
});
export type StoreActionOutput = z.infer<typeof StoreActionOutputSchema>;

export async function storeAction(input: StoreActionInput): Promise<StoreActionOutput> {
  return storeActionFlow(input);
}

const storeActionTool = ai.defineTool({
  name: 'storeAction',
  description: 'Stores an action and returns it.',
  inputSchema: StoreActionInputSchema,
  outputSchema: StoreActionOutputSchema,
},
async (input) => {
  // Simply return the input action as the stored action.
  return { storedAction: input.action };
});

const storeActionPrompt = ai.definePrompt({
  name: 'storeActionPrompt',
  tools: [storeActionTool],
  input: {schema: StoreActionInputSchema},
  output: {schema: StoreActionOutputSchema},
  prompt: `Store the following action using the storeAction tool: {{{action}}}.`,
});

const storeActionFlow = ai.defineFlow({
  name: 'storeActionFlow',
  inputSchema: StoreActionInputSchema,
  outputSchema: StoreActionOutputSchema,
}, async (input) => {
  const {output} = await storeActionPrompt(input);
  return output!;
});
