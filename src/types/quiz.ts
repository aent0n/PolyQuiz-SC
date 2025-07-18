
export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

export type Quiz = QuizQuestion[];

export interface GameState {
  currentQuestionIndex: number;
  phase: 'question' | 'reveal' | 'finished';
}

export interface LobbyData {
  topic: string;
  timer: number;
  quiz: Quiz;
  status: 'waiting' | 'playing' | 'finished';
  gameState: GameState;
}
