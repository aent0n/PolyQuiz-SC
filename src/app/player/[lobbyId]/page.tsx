'use client';

import { use, useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

// Types pour être plus explicite
interface LobbyData {
  topic: string;
  // autres champs...
}

interface PlayerData {
  name: string;
  score: number;
}

export default function PlayerLobbyPage({ params }: { params: Promise<{ lobbyId: string }> }) {
  const { lobbyId } = use(params);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lobbyData, setLobbyData] = useState<LobbyData | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (!lobbyId) return;

    const lobbyDocRef = doc(db, 'lobbies', lobbyId);

    const unsubscribe = onSnapshot(lobbyDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setLobbyData(docSnap.data() as LobbyData);
        setError(null);
      } else {
        setError('Le salon a été supprimé ou n\'existe pas.');
        setLobbyData(null);
      }
      setLoading(false);
    }, (err) => {
      console.error("Erreur d'écoute du salon:", err);
      setError('Impossible de se connecter au salon.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [lobbyId]);

  const handleRegister = () => {
    if (playerName.trim()) {
      // TODO: Ajouter la logique pour enregistrer le joueur dans Firestore
      console.log(`Le joueur ${playerName} rejoint le salon ${lobbyId}`);
      setIsRegistered(true);
    }
  };


  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-foreground/80">Recherche du salon...</p>
      </main>
    );
  }

  if (error) {
     return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background">
        <Card className="w-full max-w-md text-center border-destructive/50">
           <CardHeader>
            <CardTitle className="text-destructive">Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{error}</p>
            <Button asChild variant="outline" className="mt-4">
                <Link href="/lobby/join">Retour</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(theme(colors.accent/20%)_1px,transparent_1px)] [background-size:32px_32px]"></div>
      <Card className="w-full max-w-md border-primary/20 z-10">
        <CardHeader>
          <CardTitle className="text-center text-primary">Salon: {lobbyId}</CardTitle>
          <CardDescription className="text-center capitalize">
            Thème du quiz : {lobbyData?.topic}
          </CardDescription>
        </CardHeader>
        <CardContent>
        {isRegistered ? (
             <div className="text-center">
                <p className="text-xl font-bold">Bienvenue, {playerName} !</p>
                <p className="text-lg text-foreground/80 mt-2">En attente du lancement de la partie par l'hôte...</p>
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mt-4" />
            </div>
        ) : (
            <div className="space-y-4">
                <Input 
                    placeholder="Entrez votre nom de joueur" 
                    value={playerName} 
                    onChange={(e) => setPlayerName(e.target.value)}
                />
                <Button onClick={handleRegister} className="w-full" disabled={!playerName.trim()}>
                    Rejoindre la partie
                </Button>
            </div>
        )}
        </CardContent>
      </Card>
    </main>
  );
}
