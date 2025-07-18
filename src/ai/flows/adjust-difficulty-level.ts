'use server';

/**
 * @fileOverview A flow to dynamically adjust the quiz difficulty based on player performance.
 *
 * - adjustDifficultyLevel - Adjusts the difficulty level of the quiz.
 * - AdjustDifficultyLevelInput - The input type for adjustDifficultyLevel.
 * - AdjustDifficultyLevelOutput - The output type for adjustDifficultyLevel.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdjustDifficultyLevelInputSchema = z.object({
  averageScore: z
    .number()
    .describe('The average score of all players in the current round.'),
  currentDifficulty: z
    .enum(['easy', 'medium', 'hard'])
    .describe('The current difficulty level of the quiz.'),
});
export type AdjustDifficultyLevelInput = z.infer<
  typeof AdjustDifficultyLevelInputSchema
>;

const AdjustDifficultyLevelOutputSchema = z.object({
  newDifficulty: z
    .enum(['easy', 'medium', 'hard'])
    .describe('The new difficulty level of the quiz, adjusted by the AI.'),
  reasoning: z
    .string()
    .describe(
      'Explanation of why the difficulty level was adjusted, based on player performance.'
    ),
});
export type AdjustDifficultyLevelOutput = z.infer<
  typeof AdjustDifficultyLevelOutputSchema
>;

export async function adjustDifficultyLevel(
  input: AdjustDifficultyLevelInput
): Promise<AdjustDifficultyLevelOutput> {
  return adjustDifficultyLevelFlow(input);
}

const adjustDifficultyLevelPrompt = ai.definePrompt({
  name: 'adjustDifficultyLevelPrompt',
  input: {schema: AdjustDifficultyLevelInputSchema},
  output: {schema: AdjustDifficultyLevelOutputSchema},
  prompt: `You are an AI game master responsible for dynamically adjusting the difficulty of a quiz.

  The current difficulty is {{{currentDifficulty}}}.

  Based on the overall player performance, determine if the difficulty should be adjusted.

  Here is the average score of all players: {{{averageScore}}}

  Consider these guidelines when adjusting difficulty:
  - If the average score is very low (e.g., below 30), consider lowering the difficulty to make the quiz more accessible.
  - If the average score is moderate (e.g., between 30 and 70), maintain the current difficulty level.
  - If the average score is very high (e.g., above 70), consider increasing the difficulty to provide a greater challenge.

  Output the new difficulty level and provide a brief reasoning for the adjustment.
  `,
});

const adjustDifficultyLevelFlow = ai.defineFlow(
  {
    name: 'adjustDifficultyLevelFlow',
    inputSchema: AdjustDifficultyLevelInputSchema,
    outputSchema: AdjustDifficultyLevelOutputSchema,
  },
  async input => {
    const {output} = await adjustDifficultyLevelPrompt(input);
    return output!;
  }
);
