
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { Quiz, QuizQuestion } from '@/types/quiz';
import { QuizResults } from './quiz-results';

interface QuizGameProps {
  quiz: Quiz;
  topic: string;
  onFinish: () => void;
  timer?: number;
}

const QUESTION_TIME = 15; // default seconds

export function QuizGame({ quiz, topic, onFinish, timer = QUESTION_TIME }: QuizGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timer);

  const currentQuestion: QuizQuestion | undefined = quiz[currentQuestionIndex];

  const nextQuestion = useCallback(() => {
    setIsAnswered(false);
    setSelectedAnswer(null);
    setCurrentQuestionIndex((prev) => prev + 1);
    setTimeLeft(timer);
  }, [timer]);

  const handleAnswer = useCallback(() => {
    if (isAnswered) return;
    
    setIsAnswered(true);
    if (selectedAnswer === currentQuestion?.answer) {
      setScore((s) => s + 1);
    }

    setTimeout(() => {
      nextQuestion();
    }, 2000);
  }, [isAnswered, selectedAnswer, currentQuestion, nextQuestion]);

  useEffect(() => {
    if (isAnswered) return;
    if (timeLeft === 0) {
      handleAnswer();
      return;
    }
    const timerId = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, isAnswered, handleAnswer]);
  
  useEffect(() => {
    setTimeLeft(timer);
  }, [timer]);


  if (!currentQuestion) {
    return <QuizResults score={score} total={quiz.length} onRestart={onFinish} />;
  }

  const getButtonClass = (option: string) => {
    if (!isAnswered) {
      return selectedAnswer === option
        ? 'bg-primary/80 border-primary' // Highlight selected answer
        : 'bg-secondary/80';
    }
    // After answer is revealed
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
              onClick={() => !isAnswered && setSelectedAnswer(option)}
              className={cn(
                "h-auto w-full justify-start p-4 text-left whitespace-normal text-base transition-all duration-300 border-2 border-transparent",
                getButtonClass(option)
              )}
              disabled={isAnswered}
            >
              {option}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
