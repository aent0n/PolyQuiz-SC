
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { LogIn, PlusCircle, Shield, PenSquare, Rocket, GitCommitHorizontal, BookOpenCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";


export function HomePage() {
  return (
    <Card className="border-primary/20 shadow-lg shadow-primary/10 bg-card/50 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-5xl md:text-6xl font-headline tracking-wider text-primary">
          POLYQUIZ
        </CardTitle>
        <CardDescription className="text-foreground/80 pt-2 text-lg">
          Un jeu de quiz futuriste pour les fans de Star Citizen.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4 pt-6">
        <Link href="/lobby/create" passHref className="w-full max-w-sm">
          <Button className="w-full text-lg py-6" variant="default">
            <PlusCircle className="mr-2" /> Créer un Salon
          </Button>
        </Link>
        <Link href="/lobby/join" passHref className="w-full max-w-sm">
          <Button className="w-full text-lg py-6" variant="secondary">
            <LogIn className="mr-2" /> Rejoindre un Salon
          </Button>
        </Link>
         <Link href="/quiz/creator" passHref className="w-full max-w-sm">
           <Button className="w-full text-lg py-6" variant="outline">
            <PenSquare className="mr-2" /> Créer un Quiz
          </Button>
        </Link>
        <Link href="/moderator" passHref className="w-full max-w-sm">
           <Button className="w-full text-lg py-6" variant="ghost">
            <Shield className="mr-2" /> Vue Modérateur
          </Button>
        </Link>
         <Link href="/quiz" passHref className="w-full max-w-sm">
           <Button className="w-full text-lg py-6" variant="ghost">
            Jeu Solo
          </Button>
        </Link>
      </CardContent>
       <CardFooter className="flex flex-col items-center justify-center pt-6">
        <Dialog>
          <DialogTrigger asChild>
            <Badge variant="outline" className="text-xs cursor-pointer hover:bg-accent">
                v1.0
            </Badge>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-primary text-2xl">Notes de version v1.0</DialogTitle>
              <DialogDescription>
                Les quiz sont maintenant plus intelligents et parlent français !
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex items-start gap-4">
                <Rocket className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold">Quiz en Français</h4>
                  <p className="text-sm text-muted-foreground">Toutes les questions, réponses et options sont maintenant générées en français pour une meilleure immersion.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <BookOpenCheck className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold">Explications des Réponses</h4>
                  <p className="text-sm text-muted-foreground">Après chaque question, découvrez un fait amusant ou une explication sur la bonne réponse pour parfaire vos connaissances.</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
