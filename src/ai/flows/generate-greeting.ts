'use server';

/**
 * @fileOverview A flow for generating a greeting message if the user's input is a greeting.
 *
 * - generateGreeting - A function that generates a greeting message.
 * - GenerateGreetingInput - The input type for the generateGreeting function.
 * - GenerateGreetingOutput - The return type for the generateGreeting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateGreetingInputSchema = z.object({
  message: z.string().describe('The user message to check for a greeting.'),
});
export type GenerateGreetingInput = z.infer<typeof GenerateGreetingInputSchema>;

const GenerateGreetingOutputSchema = z.object({
  isGreeting: z.boolean().describe('Whether the message is a greeting or not.'),
  greetingMessage: z.string().describe('The generated greeting message, if applicable, in the user\'s language.'),
});
export type GenerateGreetingOutput = z.infer<typeof GenerateGreetingOutputSchema>;

export async function generateGreeting(input: GenerateGreetingInput): Promise<GenerateGreetingOutput> {
  return generateGreetingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateGreetingPrompt',
  input: {schema: GenerateGreetingInputSchema},
  output: {schema: GenerateGreetingOutputSchema},
  prompt: `You are a helpful AI assistant. Your primary task is to detect if a user's message is a greeting.
First, identify the language of the user's message.
If the user's message, "{{{message}}}", is a greeting, generate a polite and suitable greeting response *in the same language as the user's input message*.
If the message is not a greeting, set 'isGreeting' to false and 'greetingMessage' to an empty string.
Ensure your output is in JSON format as specified in the output schema.

User Message: {{{message}}}
`,
});

const generateGreetingFlow = ai.defineFlow(
  {
    name: 'generateGreetingFlow',
    inputSchema: GenerateGreetingInputSchema,
    outputSchema: GenerateGreetingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

