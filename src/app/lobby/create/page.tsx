'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { QuizSetupForm, type QuizSetupFormValues } from '@/components/quiz/quiz-setup';
import { generateStarCitizenQuiz, type GenerateStarCitizenQuizOutput } from '@/ai/flows/generate-star-citizen-quiz';
import { useToast } from "@/hooks/use-toast";
import type { Quiz } from '@/types/quiz';

export default function CreateLobbyPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleCreateLobby = async (data: QuizSetupFormValues) => {
    setIsLoading(true);
    try {
      const result: GenerateStarCitizenQuizOutput = await generateStarCitizenQuiz({
        topic: data.topic,
        numQuestions: data.numQuestions
      });

      const generatedQuiz: Quiz = result.quiz;
      
      console.log('Quiz généré pour le salon:', generatedQuiz);
      console.log('Timer par question:', data.timer);

      toast({
        title: "Salon créé avec succès!",
        description: "Votre quiz a été généré. Redirection en cours...",
      });

      // TODO: Pass quiz data and lobby ID to moderator page
      router.push('/moderator');

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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(theme(colors.accent/20%)_1px,transparent_1px)] [background-size:32px_32px]"></div>
      <div className="z-10 w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="border-primary/20 shadow-lg shadow-primary/10">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-headline text-primary">Créer un Salon</CardTitle>
            <CardDescription className="text-center text-foreground/80 pt-2">
              Configurez votre quiz et invitez des joueurs à vous rejoindre.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QuizSetupForm onSubmit={handleCreateLobby} isLoading={isLoading} showHeader={false} />
            <div className="text-center mt-6">
              <Link href="/" passHref>
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour à l'accueil
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
