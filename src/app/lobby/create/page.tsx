
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
import { db } from '@/lib/firebase';
import { doc, setDoc, collection, writeBatch } from 'firebase/firestore';

// Fonction pour générer un ID de salon simple
const generateLobbyId = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export default function CreateLobbyPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleCreateLobby = async (data: QuizSetupFormValues) => {
    setIsLoading(true);
    if (!data.playerName) {
        toast({
            title: "Nom de l'hôte requis",
            description: "Veuillez entrer votre nom pour créer le salon.",
            variant: "destructive",
        });
        setIsLoading(false);
        return;
    }

    try {
      const result: GenerateStarCitizenQuizOutput = await generateStarCitizenQuiz({
        topic: data.topic,
        numQuestions: data.numQuestions
      });

      const generatedQuiz: Quiz = result.quiz;
      const lobbyId = generateLobbyId();
      
      const batch = writeBatch(db);
      
      const lobbyDocRef = doc(db, "lobbies", lobbyId);
      batch.set(lobbyDocRef, {
        quiz: generatedQuiz,
        topic: data.topic,
        timer: data.timer,
        createdAt: new Date(),
        hostName: data.playerName,
        status: 'waiting', // initial status
      });

      const playerDocRef = doc(collection(lobbyDocRef, 'players'), data.playerName);
      batch.set(playerDocRef, { 
        name: data.playerName, 
        joinedAt: new Date(),
        score: 0,
        streak: 0,
      });

      await batch.commit();

      console.log(`Salon ${lobbyId} créé avec le quiz et l'hôte ${data.playerName}:`, generatedQuiz);

      toast({
        title: "Salon créé avec succès!",
        description: `Le salon ${lobbyId} a été généré. Redirection en cours...`,
      });
      
      router.push(`/moderator/${lobbyId}`);

    } catch (error: any) {
      console.error("Erreur détaillée :", error);
      
      let description = "Un problème est survenu. Veuillez consulter la console pour plus de détails et réessayer.";
      if (error.message && error.message.includes('503 Service Unavailable')) {
          description = "Le service de génération de quiz est actuellement surchargé. Veuillez réessayer dans quelques instants.";
      }

      toast({
        title: "Erreur lors de la création du salon",
        description: description,
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
            <QuizSetupForm 
              onSubmit={handleCreateLobby} 
              isLoading={isLoading} 
              showHeader={false} 
              showPlayerName={true} 
            />
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
