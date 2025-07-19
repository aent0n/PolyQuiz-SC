
'use client';

import { useState, useEffect, useRef } from 'react';
import { QuizSetupForm, type QuizSetupFormValues } from '@/components/quiz/quiz-setup';
import { QuizGame } from '@/components/quiz/quiz-game';
import { generateStarCitizenQuiz, type GenerateStarCitizenQuizOutput } from '@/ai/flows/generate-star-citizen-quiz';
import { useToast } from "@/hooks/use-toast";
import type { Quiz, GameState } from '@/types/quiz';
import { QuizResults } from '@/components/quiz/quiz-results';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function QuizPage() {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [topic, setTopic] = useState<string>('lore');
  const [timer, setTimer] = useState(15);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);

  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timerRef.current) {
        clearInterval(timerRef.current);
    }

    if (gameState?.phase === 'question') {
        setTimeLeft(timer);
        
        timerRef.current = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(timerRef.current);
                    setGameState(gs => gs ? { ...gs, phase: 'reveal' } : null);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);
    }
    return () => clearInterval(timerRef.current);

  }, [gameState?.phase, gameState?.currentQuestionIndex, timer]);

  const handleStartQuiz = async (data: QuizSetupFormValues) => {
    setIsLoading(true);
    setTopic(data.topic);
    setTimer(data.timer);
    try {
      const result: GenerateStarCitizenQuizOutput = await generateStarCitizenQuiz({
        topic: data.topic,
        numQuestions: data.numQuestions,
      });
      setQuiz(result.quiz);
      setGameState({ currentQuestionIndex: 0, phase: 'question' });
      setScore(0);
    } catch (error) {
      console.error(error);
      toast({
        title: "Erreur lors de la génération du quiz",
        description: "Un problème est survenu lors de la création de votre quiz. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleQuizFinish = () => {
    setGameState(gs => gs ? { ...gs, phase: 'finished' } : null);
  }

  const handleRestart = () => {
    setQuiz(null);
    setGameState(null);
    setScore(0);
  }

  const handleNextQuestion = () => {
    if (!quiz || !gameState) return;

    const nextIndex = gameState.currentQuestionIndex + 1;
    if (nextIndex >= quiz.length) {
      handleQuizFinish();
    } else {
      setGameState({ currentQuestionIndex: nextIndex, phase: 'question' });
    }
  };
  
  const renderContent = () => {
    if (gameState?.phase === 'finished') {
        return <QuizResults score={score} totalQuestions={quiz?.length || 0} onRestart={handleRestart} />;
    }
    if (quiz && gameState) {
      return (
        <QuizGame 
          quiz={quiz} 
          topic={topic} 
          onFinish={handleQuizFinish} 
          timer={timer} 
          gameState={gameState}
          timeLeft={timeLeft}
          onNextQuestion={handleNextQuestion}
          onScoreUpdate={setScore}
        />
      );
    }
    return (
      <>
        <QuizSetupForm onSubmit={handleStartQuiz} isLoading={isLoading} showHeader={true} />
        <div className="text-center mt-6">
          <Link href="/" passHref>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
       <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(theme(colors.accent/20%)_1px,transparent_1px)] [background-size:32px_32px]"></div>
       
       <div className="z-10 w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        {renderContent()}
      </div>

       <footer className="z-10 mt-8 text-center text-sm text-foreground/50">
        <p>PolyQuiz - Un projet par deltavip3r et Mrjop ✧</p>
        <p>Non affilié à Cloud Imperium Games.</p>
      </footer>
    </main>
  );
}
