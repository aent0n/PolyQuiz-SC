'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, PlusCircle, Shield } from 'lucide-react';

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
        <Link href="/moderator" passHref className="w-full max-w-sm">
           <Button className="w-full text-lg py-6" variant="outline">
            <Shield className="mr-2" /> Vue Modérateur
          </Button>
        </Link>
         <Link href="/quiz" passHref className="w-full max-w-sm">
           <Button className="w-full text-lg py-6" variant="ghost">
            Jeu Solo
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
