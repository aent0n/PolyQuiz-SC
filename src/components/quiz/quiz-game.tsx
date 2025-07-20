
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { Quiz, QuizQuestion, GameState } from '@/types/quiz';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ChevronsRight, HelpCircle } from 'lucide-react';


interface QuizGameProps {
  quiz: Quiz;
  topic: string;
  onFinish: () => void;
  timer: number;
  gameState: GameState;
  timeLeft: number;
  // Multiplayer-specific props
  lobbyId?: string;
  playerName?: string | null;
  // Solo-specific props
  onNextQuestion?: () => void;
  onScoreUpdate?: React.Dispatch<React.SetStateAction<number>>;
  onStreakUpdate?: React.Dispatch<React.SetStateAction<number>>;
  onCorrectAnswer?: () => void;
}


const STREAK_BONUS_THRESHOLD = 3;
const BASE_POINTS = 10;
const STREAK_BONUS_POINTS = 5;

export function QuizGame({ 
  quiz, 
  topic, 
  onFinish, 
  timer, 
  lobbyId, 
  playerName, 
  gameState, 
  timeLeft,
  onNextQuestion,
  onScoreUpdate,
  onStreakUpdate,
  onCorrectAnswer
}: QuizGameProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  
  const { currentQuestionIndex, phase } = gameState;
  const currentQuestion: QuizQuestion | undefined = quiz[currentQuestionIndex];
  const isAnswerPhase = phase === 'question';
  const isMultiplayer = !!lobbyId;

  const previousQuestionIndex = useRef<number>();
  const scoreCalculatedForIndex = useRef<number>();


  useEffect(() => {
    // This effect ensures local state is reset ONLY when the question actually changes.
    if (previousQuestionIndex.current !== currentQuestionIndex) {
      setSelectedAnswer(null);
      previousQuestionIndex.current = currentQuestionIndex;
    }
  }, [currentQuestionIndex]);

  const submitAnswer = useCallback(async (answer: string) => {
    if (!isMultiplayer || !playerName || !isAnswerPhase || !currentQuestion || !lobbyId) return;

    // We only record the last answer given by the player for the current question
    const answerRef = doc(db, 'lobbies', lobbyId, 'answers', `${currentQuestionIndex}-${playerName}`);
    try {
      await setDoc(answerRef, {
        playerName,
        answer: answer,
        questionIndex: currentQuestionIndex,
        isCorrect: answer === currentQuestion.answer,
        timestamp: new Date(),
      }, { merge: true });
    } catch (e) {
      console.error("Failed to submit answer:", e);
    }
  }, [isMultiplayer, playerName, isAnswerPhase, currentQuestion, lobbyId, currentQuestionIndex]);

  const handleAnswerSelect = (option: string) => {
    if (isAnswerPhase) {
      setSelectedAnswer(option);
      if (isMultiplayer) {
        submitAnswer(option);
      }
    }
  }

  // Score calculation effect - runs ONLY in SOLO mode
  useEffect(() => {
    if (isMultiplayer || phase !== 'reveal' || !currentQuestion) return;
    
    // Check if score has already been calculated for this question to prevent loops
    if(scoreCalculatedForIndex.current === currentQuestionIndex) return;

    // --- SOLO MODE SCORE CALCULATION ---
    if (onScoreUpdate && onStreakUpdate && onCorrectAnswer) {
      if (selectedAnswer === currentQuestion.answer) {
        onCorrectAnswer();
        onStreakUpdate(prevStreak => {
          const newStreak = prevStreak + 1;
          let pointsGained = BASE_POINTS;
          if (newStreak >= STREAK_BONUS_THRESHOLD) {
            pointsGained += STREAK_BONUS_POINTS;
          }
          onScoreUpdate(prevScore => prevScore + pointsGained);
          return newStreak;
        });
      } else {
        onStreakUpdate(0);
      }
      scoreCalculatedForIndex.current = currentQuestionIndex;
    }
  }, [
      phase, 
      isMultiplayer, 
      currentQuestionIndex, 
      onScoreUpdate, 
      onStreakUpdate, 
      onCorrectAnswer, 
      selectedAnswer, 
      currentQuestion
  ]);


  useEffect(() => {
    if (!currentQuestion) {
      onFinish();
    }
  }, [currentQuestion, onFinish]);


  if (!currentQuestion) {
    return null;
  }

  const getButtonClass = (option: string) => {
    if (phase === 'question') {
      return selectedAnswer === option
        ? 'border-primary bg-primary/20'
        : 'bg-secondary/80';
    }
    // Reveal or Nulled phase
    if (option === currentQuestion.answer) {
      return 'bg-green-600 hover:bg-green-600 text-white border-green-500'; // Correct answer
    }
    if (option === selectedAnswer && selectedAnswer !== currentQuestion.answer) {
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
          {isAnswerPhase && !!selectedAnswer && <p>Réponse enregistrée. Vous pouvez la modifier jusqu'à la fin du temps.</p>}
          {phase === 'reveal' && <p>Les réponses sont verrouillées. En attente de l'hôte...</p>}
          {phase === 'nulled' && <p className="text-destructive font-bold">Question annulée par l'hôte. Aucun point ne sera attribué.</p>}
        </div>

        {(phase === 'reveal' || phase === 'nulled') && (
          <div className="pt-2">
            {currentQuestion.explanation && (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      <span>Explication</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {currentQuestion.explanation}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}

            {!isMultiplayer && onNextQuestion && (
              <div className="text-center mt-4">
                <Button onClick={onNextQuestion}>
                  Question Suivante
                  <ChevronsRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

    