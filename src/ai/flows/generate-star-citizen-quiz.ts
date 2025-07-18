// src/ai/flows/generate-star-citizen-quiz.ts
'use server';
/**
 * @fileOverview Quiz generation flow for Star Citizen.
 *
 * - generateStarCitizenQuiz - Generates a quiz about Star Citizen.
 * - GenerateStarCitizenQuizInput - Input type for the quiz generation.
 * - GenerateStarCitizenQuizOutput - Output type for the generated quiz.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Quiz } from '@/types/quiz';

const GenerateStarCitizenQuizInputSchema = z.object({
  topic: z
    .string()
    .describe('The topic of the Star Citizen quiz (lore, locations, resources, etc.).'),
  numQuestions: z.number().describe('The number of questions to generate for the quiz.'),
});
export type GenerateStarCitizenQuizInput = z.infer<
  typeof GenerateStarCitizenQuizInputSchema
>;

const questionSchema = z.object({
  question: z.string().describe('The question text'),
  options: z.array(z.string()).describe('An array of 4 possible answers.'),
  answer: z.string().describe('The correct answer, which must be one of the options.'),
});

const GenerateStarCitizenQuizOutputSchema = z.object({
  quiz: z.array(questionSchema).describe('The array of quiz questions.'),
});
export type GenerateStarCitizenQuizOutput = z.infer<
  typeof GenerateStarCitizenQuizOutputSchema
>;

export async function generateStarCitizenQuiz(
  input: GenerateStarCitizenQuizInput
): Promise<GenerateStarCitizenQuizOutput> {
  return generateStarCitizenQuizFlow(input);
}

const generateStarCitizenQuizPrompt = ai.definePrompt({
  name: 'generateStarCitizenQuizPrompt',
  input: {schema: GenerateStarCitizenQuizInputSchema},
  output: {schema: GenerateStarCitizenQuizOutputSchema},
  prompt: `You are an expert quiz generator specializing in Star Citizen trivia.

  Generate a quiz with {{numQuestions}} questions about {{topic}}.
  Ensure that the answer is one of the 4 options provided.
  `,
});

const generateStarCitizenQuizFlow = ai.defineFlow(
  {
    name: 'generateStarCitizenQuizFlow',
    inputSchema: GenerateStarCitizenQuizInputSchema,
    outputSchema: GenerateStarCitizenQuizOutputSchema,
  },
  async input => {
    const {output} = await generateStarCitizenQuizPrompt(input);
    return output!;
  }
);
