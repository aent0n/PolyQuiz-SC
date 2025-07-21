
'use client';

import { Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function MaintenancePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(theme(colors.accent/20%)_1px,transparent_1px)] [background-size:32px_32px]"></div>
      <div className="z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="border-primary/20 shadow-lg shadow-primary/10 text-center">
            <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                    <Wrench className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="text-3xl font-headline text-primary pt-4">
                    En Maintenance
                </CardTitle>
                <CardDescription className="text-foreground/80 pt-2">
                    Nous effectuons actuellement des mises à jour pour améliorer votre expérience.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-lg">
                    Le site sera de retour très prochainement.
                </p>
                <p className="text-sm text-foreground/60 mt-2">
                    Merci de votre patience !
                </p>
            </CardContent>
        </Card>
      </div>
       <footer className="z-10 mt-8 text-center text-sm text-foreground/50">
        <p>PolyQuiz - Un projet par deltavip3r et Mrjop ✧</p>
      </footer>
    </main>
  );
}
