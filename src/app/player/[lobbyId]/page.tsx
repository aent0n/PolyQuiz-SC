'use client';

import { use, useEffect, useState } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

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
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background">
      <Card className="w-full max-w-md border-primary/20">
        <CardHeader>
          <CardTitle className="text-center text-primary">Salon: {lobbyId}</CardTitle>
          <CardDescription className="text-center capitalize">
            Thème du quiz : {lobbyData?.topic}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
             <p className="text-lg text-foreground/80">En attente du lancement de la partie par l'hôte...</p>
             <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mt-4" />
          </div>
          {/* Ici, nous ajouterons le formulaire pour entrer le nom du joueur */}
        </CardContent>
      </Card>
    </main>
  );
}
