

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export type Quiz = QuizQuestion[];

export interface GameState {
  currentQuestionIndex: number;
  phase: 'question' | 'reveal' | 'finished' | 'nulled';
}

export interface PlayerState {
  name: string;
  score: number;
  streak: number;
  negativeStreak: number;
  maxNegativeStreak: number;
}

export interface LobbyData {
  topic: string;
  timer: number;
  quiz: Quiz;
  status: 'waiting' | 'playing' | 'finished';
  gameState: GameState;
  hostName: string; // Add this line
  players?: { [key: string]: PlayerState };
}
