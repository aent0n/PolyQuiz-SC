
'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot, collection, deleteDoc, updateDoc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2, Users, QrCode, Crown } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';


interface LobbyData {
  topic: string;
  timer: number;
  quiz: any[];
  status?: 'waiting' | 'playing' | 'finished';
  hostName: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface Player {
  id: string;
  name: string;
}

function PlayerList({ players, hostName }: { players: Player[], hostName: string }) {
  if (players.length === 0) {
    return <p className="text-foreground/60">En attente des joueurs...</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {players.map((player) => {
        const isHost = player.name === hostName;
        return (
          <div key={player.id} className={cn("flex items-center gap-2 p-2 rounded-lg bg-secondary", isHost && "ring-2 ring-yellow-400")}>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
              {player.name.charAt(0).toUpperCase()}
            </span>
            <div className="flex-1 truncate">
                <p className="font-semibold truncate flex items-center gap-1.5">
                    {player.name}
                    {isHost && <Crown className="h-4 w-4 text-yellow-400" />}
                </p>
            </div>
          </div>
        )
      })}
    </div>
  );
}

export default function ModeratorLobbyPage() {
  const params = useParams();
  const lobbyId = Array.isArray(params.lobbyId) ? params.lobbyId[0] : params.lobbyId;
  const [lobbyData, setLobbyData] = useState<LobbyData | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [joinUrl, setJoinUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && lobbyId) {
        setJoinUrl(`${window.location.origin}/lobby/join?code=${lobbyId}`);
    }
  }, [lobbyId]);

  useEffect(() => {
    if (!lobbyId) return;

    const lobbyDocRef = doc(db, 'lobbies', lobbyId);
    const unsubscribeLobby = onSnapshot(lobbyDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as LobbyData;
        setLobbyData(data);
        if(data.status === 'playing') {
          router.push(`/game-state/${lobbyId}?role=moderator`);
        }
        setError(null);
      } else {
        setError('Le salon est introuvable ou a été supprimé.');
        setLobbyData(null);
      }
      setLoading(false);
    }, (err) => {
      console.error("Erreur lors de la récupération du salon:", err);
      setError('Impossible de charger les données du salon.');
      setLoading(false);
    });

    const playersColRef = collection(db, 'lobbies', lobbyId, 'players');
    const unsubscribePlayers = onSnapshot(playersColRef, (snapshot) => {
      const playersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player));
      setPlayers(playersList);
    });

    return () => {
      unsubscribeLobby();
      unsubscribePlayers();
    };
  }, [lobbyId, router]);

  const handleCloseLobby = async () => {
    if (!lobbyId) return;
    try {
      const batch = writeBatch(db);

      // Delete all players in the subcollection
      const playersColRef = collection(db, 'lobbies', lobbyId, 'players');
      const playersSnapshot = await getDocs(playersColRef);
      playersSnapshot.docs.forEach((playerDoc) => {
          batch.delete(playerDoc.ref);
      });
      
      // Delete the lobby document itself
      const lobbyDocRef = doc(db, 'lobbies', lobbyId);
      batch.delete(lobbyDocRef);
      
      await batch.commit();

      console.log(`Salon ${lobbyId} et ses joueurs ont été supprimés.`);
      router.push('/');
    } catch (error) {
      console.error("Erreur lors de la suppression du salon:", error);
    }
  };

 const handleStartGame = async () => {
    if (!lobbyId) return;
    try {
      const lobbyDocRef = doc(db, 'lobbies', lobbyId);
      await updateDoc(lobbyDocRef, {
        status: 'playing',
        gameState: {
          currentQuestionIndex: 0,
          phase: 'question', // 'question', 'reveal', 'finished'
        },
      });
      // The useEffect will handle the redirection
    } catch (error) {
      console.error("Erreur lors du lancement de la partie:", error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background">
      <div className="w-full max-w-4xl">
        <Card className="border-primary/20 shadow-lg shadow-primary/10">
          <CardHeader>
             <div className="flex justify-between items-start">
                <div className="flex-1 text-center">
                    <CardTitle className="text-3xl text-primary font-headline">Salon de pré-partie</CardTitle>
                    <CardDescription className="text-lg text-foreground/80">
                        Code du salon : <span className="font-bold text-primary tracking-widest">{lobbyId}</span>
                    </CardDescription>
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                         <Button variant="ghost" size="icon">
                            <QrCode className="h-6 w-6" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4">
                        <div className="flex flex-col items-center gap-2">
                            <h4 className="font-medium text-lg">Scannez pour rejoindre</h4>
                            {joinUrl && (
                                <QRCodeSVG 
                                    value={joinUrl} 
                                    size={192}
                                    bgColor={"#ffffff"}
                                    fgColor={"#000000"}
                                    level={"L"}
                                    includeMargin={true}
                                />
                            )}
                             <p className="text-sm text-muted-foreground">{lobbyId}</p>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
          </CardHeader>
          <CardContent className="text-center space-y-8">
            {loading && (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-lg">Chargement du salon...</p>
              </div>
            )}
            {error && <p className="text-destructive text-lg">{error}</p>}
            {lobbyData && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Détails du Quiz</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center items-center gap-8 text-lg">
                    <p>Thème : <span className="font-semibold capitalize">{lobbyData.topic === 'mix' ? 'Mix' : lobbyData.topic}</span></p>
                    <p>Questions : <span className="font-semibold">{lobbyData.quiz.length}</span></p>
                    <p>Timer : <span className="font-semibold">{lobbyData.timer} secondes</span></p>
                    <p>Difficulté : <span className="font-semibold capitalize">{lobbyData.difficulty}</span></p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-center text-xl">
                      <Users className="mr-2 h-6 w-6" />
                      Joueurs Connectés ({players.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                     <PlayerList players={players} hostName={lobbyData.hostName} />
                  </CardContent>
                </Card>

                <Button size="lg" className="text-xl py-8 w-full max-w-sm" disabled={players.length === 0} onClick={handleStartGame}>
                  Lancer la partie
                </Button>
              </>
            )}
             <div className="text-center mt-8">
                <Button variant="destructive" onClick={handleCloseLobby}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Fermer le salon et retourner à l'accueil
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
