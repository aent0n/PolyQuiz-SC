export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

export type Quiz = QuizQuestion[];
