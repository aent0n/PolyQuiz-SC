'use client';

import { useState } from 'react';
import { QuizSetupForm, type QuizSetupFormValues } from '@/components/quiz/quiz-setup';
import { QuizGame } from '@/components/quiz/quiz-game';
import { generateStarCitizenQuiz, type GenerateStarCitizenQuizOutput } from '@/ai/flows/generate-star-citizen-quiz';
import { useToast } from "@/hooks/use-toast";
import type { Quiz } from '@/types/quiz';

export default function QuizPage() {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [topic, setTopic] = useState<string>('lore');
  const [timer, setTimer] = useState(15);

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
    setQuiz(null);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
       <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(theme(colors.accent/20%)_1px,transparent_1px)] [background-size:32px_32px]"></div>
       
       <div className="z-10 w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        {!quiz ? (
          <QuizSetupForm onSubmit={handleStartQuiz} isLoading={isLoading} />
        ) : (
          <QuizGame quiz={quiz} topic={topic} onFinish={handleQuizFinish} timer={timer} />
        )}
      </div>

       <footer className="z-10 mt-8 text-center text-sm text-foreground/50">
        <p>PolyQuiz - Une aventure Star Citizen</p>
        <p>Non affilié à Cloud Imperium Games.</p>
      </footer>
    </main>
  );
}
