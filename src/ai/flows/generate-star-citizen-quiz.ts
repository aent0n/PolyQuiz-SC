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
    .describe('The topic of the Star Citizen quiz. Can be a specific topic like "lore", "locations", "ships", or "mix" for a mix of all topics.'),
  numQuestions: z.number().describe('The number of questions to generate for the quiz.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('The difficulty level of the quiz.'),
});
export type GenerateStarCitizenQuizInput = z.infer<
  typeof GenerateStarCitizenQuizInputSchema
>;

const questionSchema = z.object({
  question: z.string().describe('The question text, in French.'),
  options: z.array(z.string()).describe('An array of 4 possible answers, in French.'),
  answer: z.string().describe('The correct answer, which must be one of the options.'),
  explanation: z.string().describe('A brief, lore-rich explanation for the correct answer, in French.'),
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

  Generate a quiz with {{numQuestions}} questions about the following topic: "{{topic}}". If the topic is "mix", generate questions from a variety of categories (lore, ships, locations, history, etc.).
  The quiz difficulty must be: {{difficulty}}.

  Guidelines for difficulty:
  - easy: Questions should cover general knowledge that most players would know. Focus on popular ships, major locations, and main story elements.
  - medium: Questions can be more specific, about less common ships, specific planetary systems, or events mentioned in lore posts.
  - hard: Questions should be for experts, referencing deep lore, specific ship stats, historical details from "Inside Star Citizen" or other developer content.
  
  The entire quiz should be primarily in French, but you MUST keep technical terms, ship names, or proper nouns in English if their French translation is awkward or not commonly used by the community (e.g., "Jump Point", "Stanton System", "Aegis Dynamics", "UEE"). The goal is to use language that feels natural to a French-speaking Star Citizen fan.

  For each question:
  - Formulate concise and direct questions. Avoid lengthy sentences to ensure the question can be read and understood quickly.
  - Provide a brief, lore-rich explanation for the correct answer. The explanation should be detailed and include specific lore elements like dates, entities (corporations, alien races), historical events, or important characters.
  - Ensure that the answer is one of the 4 options provided.
  - CRUCIAL: The question text MUST NOT contain any part of the correct answer. For example, if the answer is "Aegis Idris", the word "Aegis" must not appear in the question. The question should be formulated to test knowledge without giving away clues.
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
