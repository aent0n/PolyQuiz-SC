'use client';

import { useState } from 'react';
import { QuizSetupForm } from '@/components/quiz/quiz-setup';
import { QuizGame } from '@/components/quiz/quiz-game';
import { generateStarCitizenQuiz, type GenerateStarCitizenQuizOutput } from '@/ai/flows/generate-star-citizen-quiz';
import { useToast } from "@/hooks/use-toast";
import type { Quiz } from '@/types/quiz';

export default function Home() {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [topic, setTopic] = useState<string>('lore');

  const handleStartQuiz = async (data: { topic: string, numQuestions: number }) => {
    setIsLoading(true);
    setTopic(data.topic);
    try {
      const result: GenerateStarCitizenQuizOutput = await generateStarCitizenQuiz(data);
      // The AI sometimes returns a malformed JSON string with backticks and "json" prefix.
      const cleanedJsonString = result.quiz.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedQuiz = JSON.parse(cleanedJsonString);
      setQuiz(parsedQuiz.quiz);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error Generating Quiz",
        description: "There was an issue creating your quiz. Please try again.",
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
          <QuizGame quiz={quiz} topic={topic} onFinish={handleQuizFinish} />
        )}
      </div>

       <footer className="z-10 mt-8 text-center text-sm text-foreground/50">
        <p>PolyQuiz - A Star Citizen Adventure</p>
        <p>Not affiliated with Cloud Imperium Games.</p>
      </footer>
    </main>
  );
}
