
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { LogIn, PlusCircle, Shield, PenSquare, Rocket, GitCommitHorizontal, BookOpenCheck, List, Bug, BarChart3, Flame } from 'lucide-react';
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
          <Badge variant="secondary" className="absolute -top-1 -right-1 -rotate-12">Prochainement !</Badge>
        </div>
        <div className="w-full max-w-sm relative">
           <Button className="w-full text-lg py-6" variant="ghost" disabled>
            <Shield className="mr-2" /> Vue Modérateur
          </Button>
           <Badge variant="secondary" className="absolute -top-1 -right-1 -rotate-12">Prochainement !</Badge>
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
                v1.3
            </Badge>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-primary text-2xl">Notes de version v1.3</DialogTitle>
              <DialogDescription>
                Résultats de partie améliorés et nouvelles options.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex items-start gap-4">
                <BarChart3 className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold">Statistiques Détaillées</h4>
                  <p className="text-sm text-muted-foreground">L'écran des résultats affiche désormais le classement, le nombre de réponses correctes, et les séries de bonnes réponses. La vue de l'hôte offre un tableau complet des performances de chaque joueur.</p>
                </div>
              </div>
               <div className="flex items-start gap-4">
                <Flame className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold">Statistiques Amusantes</h4>
                  <p className="text-sm text-muted-foreground">Découvrez qui a eu la plus grande série de... mauvaises réponses ! Une nouvelle statistique pour pimenter les fins de partie.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <List className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold">Configuration de Quiz Adaptée</h4>
                  <p className="text-sm text-muted-foreground">Les options pour le nombre de questions sont maintenant différentes pour le mode solo (plus courtes) et le mode multijoueur (plus longues), pour une mise en place plus rapide.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Bug className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold">Correction de Bugs Majeurs</h4>
                  <p className="text-sm text-muted-foreground">Résolution des problèmes de score lors de l'annulation d'une question par l'hôte et de divers bugs de stabilité.</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
