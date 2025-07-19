
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { LogIn, PlusCircle, Shield, PenSquare, Rocket, GitCommitHorizontal, BookOpenCheck, List } from 'lucide-react';
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
         <div className="w-full max-w-sm relative">
           <Button className="w-full text-lg py-6" variant="outline" disabled>
            <PenSquare className="mr-2" /> Créer un Quiz
          </Button>
          <Badge variant="secondary" className="absolute -top-2 -right-2 -rotate-12">Prochainement</Badge>
        </div>
        <div className="w-full max-w-sm relative">
           <Button className="w-full text-lg py-6" variant="ghost" disabled>
            <Shield className="mr-2" /> Vue Modérateur
          </Button>
           <Badge variant="secondary" className="absolute -top-2 -right-2 -rotate-12">Prochainement</Badge>
        </div>
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
                v1.1
            </Badge>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-primary text-2xl">Notes de version v1.1</DialogTitle>
              <DialogDescription>
                Plus de thèmes pour plus de fun !
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex items-start gap-4">
                <List className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold">Plus de Thématiques</h4>
                  <p className="text-sm text-muted-foreground">De nouveaux sujets de quiz ont été ajoutés (vaisseaux, lieux, etc.) ainsi qu'une option "Mélange de tout" pour varier les plaisirs.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Rocket className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold">Quiz en Français</h4>
                  <p className="text-sm text-muted-foreground">Les questions sont maintenant générées en français, avec une touche de "franglais" pour les termes techniques, pour une meilleure immersion.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <BookOpenCheck className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold">Explications de Lore</h4>
                  <p className="text-sm text-muted-foreground">Après chaque question, découvrez une explication riche en lore pour parfaire vos connaissances de l'univers.</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
