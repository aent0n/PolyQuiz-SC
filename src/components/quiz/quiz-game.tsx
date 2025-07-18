
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { Quiz, QuizQuestion, GameState } from '@/types/quiz';
import { QuizResults } from './quiz-results';
import { db } from '@/lib/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

interface QuizGameProps {
  lobbyId: string;
  playerName: string | null;
  quiz: Quiz;
  topic: string;
  onFinish: () => void;
  timer?: number;
  gameState: GameState;
}

const QUESTION_TIME = 15; // default seconds

export function QuizGame({ quiz, topic, onFinish, timer = QUESTION_TIME, lobbyId, playerName, gameState }: QuizGameProps) {
  const [score, setScore] = useState(0); // This will be calculated from Firestore later
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(timer);

  const { currentQuestionIndex, phase } = gameState;
  const currentQuestion: QuizQuestion | undefined = quiz[currentQuestionIndex];
  const isAnswerPhase = phase === 'question';
  
  const handleAnswerSelect = (option: string) => {
    if (isAnswerPhase) {
      setSelectedAnswer(option);
    }
  }
  
  // Submit answer to Firestore when timer ends or answer is locked
  const submitAnswer = useCallback(async () => {
    if (!playerName || !selectedAnswer) return;
    const answerRef = doc(db, 'lobbies', lobbyId, 'answers', `${currentQuestionIndex}-${playerName}`);
    await setDoc(answerRef, {
      playerName,
      answer: selectedAnswer,
      questionIndex: currentQuestionIndex,
      isCorrect: selectedAnswer === currentQuestion?.answer,
    });
  }, [lobbyId, playerName, selectedAnswer, currentQuestionIndex, currentQuestion]);

  useEffect(() => {
    // Reset for new question
    setSelectedAnswer(null);
    setTimeLeft(timer);
  }, [currentQuestionIndex, timer]);
  
  // Timer countdown effect
  useEffect(() => {
    if (!isAnswerPhase) {
      if(timeLeft > 0) setTimeLeft(0);
      return;
    };
    
    if (timeLeft === 0) {
      // Time's up, lock in the answer and tell the host to reveal
      submitAnswer();
      const lobbyDocRef = doc(db, 'lobbies', lobbyId);
      updateDoc(lobbyDocRef, { 'gameState.phase': 'reveal' });
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, isAnswerPhase, submitAnswer, lobbyId]);


  if (!currentQuestion) {
     return <QuizResults score={score} total={quiz.length} onRestart={onFinish} />;
  }

  const getButtonClass = (option: string) => {
    if (isAnswerPhase) {
      return selectedAnswer === option
        ? 'border-primary bg-primary/20'
        : 'bg-secondary/80';
    }
    // Reveal phase
    if (option === currentQuestion.answer) {
      return 'bg-green-600 hover:bg-green-600 text-white border-green-500'; // Correct answer
    }
    if (option === selectedAnswer) {
      return 'bg-red-600 hover:bg-red-600 text-white border-red-500'; // Wrong selected answer
    }
    return 'bg-secondary/50 opacity-60'; // Other incorrect options
  };

  return (
    <Card className="w-full border-primary/20 shadow-lg shadow-primary/10">
      <CardHeader>
        <div className="flex justify-between items-center text-foreground/80">
          <span>Question {currentQuestionIndex + 1} sur {quiz.length}</span>
          <span className="capitalize">{topic}</span>
        </div>
        <Progress value={(timeLeft / timer) * 100} className="w-full h-2 mt-2 [&>div]:bg-primary" />
        <CardTitle className="pt-4 text-2xl">{currentQuestion.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.options.map((option) => (
            <Button
              key={option}
              onClick={() => handleAnswerSelect(option)}
              className={cn(
                "h-auto w-full justify-start p-4 text-left whitespace-normal text-base transition-all duration-300 border-2 border-transparent",
                getButtonClass(option)
              )}
              disabled={!isAnswerPhase}
            >
              {option}
            </Button>
          ))}
        </div>
         <div className="text-center text-foreground/60 h-6">
            {!isAnswerPhase && <p>Les réponses sont verrouillées. En attente de l'hôte...</p>}
        </div>
      </CardContent>
    </Card>
  );
}
