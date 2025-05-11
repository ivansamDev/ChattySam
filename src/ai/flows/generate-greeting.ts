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
  greetingMessage: z.string().describe('The generated greeting message, if applicable.'),
});
export type GenerateGreetingOutput = z.infer<typeof GenerateGreetingOutputSchema>;

export async function generateGreeting(input: GenerateGreetingInput): Promise<GenerateGreetingOutput> {
  return generateGreetingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateGreetingPrompt',
  input: {schema: GenerateGreetingInputSchema},
  output: {schema: GenerateGreetingOutputSchema},
  prompt: `You are a helpful AI assistant that detects greetings and responds accordingly.

  Determine if the following message is a greeting. If it is, generate a suitable greeting message. 
  If it is not, return isGreeting as false and greetingMessage as an empty string.

  Message: {{{message}}}
  
  Output format: JSON
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
