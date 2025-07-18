'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { QuizCreatorForm } from '@/components/quiz/quiz-creator-form';
import type { Quiz } from '@/types/quiz';

export default function QuizCreatorPage() {

  const handleSaveQuiz = (data: { title: string; questions: Quiz }) => {
    console.log('Quiz sauvegardé :', data);
    // TODO: Implémenter la logique de sauvegarde (par exemple, dans une base de données)
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(theme(colors.accent/20%)_1px,transparent_1px)] [background-size:32px_32px]"></div>
      <div className="z-10 w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="border-primary/20 shadow-lg shadow-primary/10">
          <CardHeader>
            <CardTitle className="text-center text-3xl text-primary font-headline">Créateur de Quiz</CardTitle>
            <CardDescription className="text-center text-foreground/80 pt-2">
              Créez vos propres quiz personnalisés pour les utiliser dans les salons de jeu.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QuizCreatorForm onSave={handleSaveQuiz} />
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
