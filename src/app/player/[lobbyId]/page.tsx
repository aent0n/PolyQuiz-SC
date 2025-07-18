
'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { doc, onSnapshot, setDoc, collection, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface LobbyData {
  topic: string;
  status?: 'waiting' | 'playing' | 'finished';
}

function PlayerLobbyContent() {
  const params = useParams();
  const router = useRouter();
  const lobbyId = Array.isArray(params.lobbyId) ? params.lobbyId[0] : params.lobbyId;
  const searchParams = useSearchParams();
  const playerName = searchParams.get('playerName');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lobbyData, setLobbyData] = useState<LobbyData | null>(null);

  const unregisterPlayer = useCallback(async () => {
    if (playerName && lobbyId) {
      try {
        const playerDocRef = doc(db, 'lobbies', lobbyId, 'players', playerName);
        await deleteDoc(playerDocRef);
        console.log(`Joueur ${playerName} retiré du salon ${lobbyId}`);
      } catch (error) {
         console.error(`Impossible de retirer le joueur ${playerName}:`, error);
      }
    }
  }, [lobbyId, playerName]);


  useEffect(() => {
    if (!lobbyId || !playerName) {
        setError("Informations de salon ou de joueur manquantes.");
        setLoading(false);
        return;
    }

    const lobbyDocRef = doc(db, 'lobbies', lobbyId);
    const playerDocRef = doc(collection(lobbyDocRef, 'players'), playerName);

    const registerPlayer = async () => {
        try {
            const lobbySnap = await getDoc(lobbyDocRef);
            if (!lobbySnap.exists() || lobbySnap.data().status === 'playing') {
                setError('Ce salon n\'existe plus ou la partie a déjà commencé.');
                setLoading(false);
                return;
            }
            await setDoc(playerDocRef, { 
                name: playerName, 
                joinedAt: new Date(),
                score: 0,
                streak: 0,
            });
            console.log(`Joueur ${playerName} enregistré dans le salon ${lobbyId}`);
        } catch (err) {
            console.error("Erreur lors de l'enregistrement du joueur:", err);
            setError("Impossible d'enregistrer votre participation.");
            setLoading(false);
        }
    };

    registerPlayer();

    const unsubscribe = onSnapshot(lobbyDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as LobbyData;
        setLobbyData(data);
        if (data.status === 'playing') {
          router.push(`/game-state/${lobbyId}?playerName=${encodeURIComponent(playerName)}`);
        }
        setError(null);
      } else {
        setError('Le salon a été fermé par l\'hôte.');
        setLobbyData(null);
      }
      setLoading(false);
    }, (err) => {
      console.error("Erreur d'écoute du salon:", err);
      setError('Impossible de se connecter au salon.');
      setLoading(false);
    });

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        unregisterPlayer();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        unsubscribe();
    };
  }, [lobbyId, playerName, router, unregisterPlayer]);
  
  const handleLeave = async () => {
      await unregisterPlayer();
      router.push('/');
  }

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
          <div className="text-center space-y-4">
              <p className="text-xl font-bold">Bienvenue, {playerName} !</p>
              <p className="text-lg text-foreground/80 mt-2">En attente du lancement de la partie par l'hôte...</p>
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mt-4" />
              <Button variant="outline" size="sm" onClick={handleLeave}>Quitter le salon</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}


export default function PlayerLobbyPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <PlayerLobbyContent />
    </Suspense>
  );
}
