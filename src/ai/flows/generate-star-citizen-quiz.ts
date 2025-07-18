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

const GenerateStarCitizenQuizInputSchema = z.object({
  topic: z
    .string()
    .describe('The topic of the Star Citizen quiz (lore, locations, resources, etc.).'),
  numQuestions: z.number().describe('The number of questions to generate for the quiz.'),
});
export type GenerateStarCitizenQuizInput = z.infer<
  typeof GenerateStarCitizenQuizInputSchema
>;

const GenerateStarCitizenQuizOutputSchema = z.object({
  quiz: z.string().describe('The generated Star Citizen quiz in JSON format.'),
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
  The quiz should be returned in JSON format with the following structure:
  {
    "quiz": [
      {
        "question": "The question text",
        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
        "answer": "The correct answer"
      },
      ...
    ]
  }
  Ensure that the answer is one of the options provided. Do not include any explanation or context other than the JSON structure.
  Do not provide any intro or conclusion in the response. Start with the JSON object.
  Do not include any invalid JSON escape sequences.
  Do not provide more than 4 options for each question.`,
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
