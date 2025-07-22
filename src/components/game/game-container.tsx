
'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { doc, onSnapshot, updateDoc, runTransaction, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2, XCircle, Flame, Star, ChevronsRight } from 'lucide-react';
import type { LobbyData, PlayerState } from '@/types/quiz';
import { QuizGame } from '../quiz/quiz-game';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const STREAK_BONUS_THRESHOLD = 3;
const BASE_POINTS = 10;
const STREAK_BONUS_POINTS = 5;

// This function will now be responsible for calculating and updating scores.
// It will be called explicitly by the host controls.
async function calculateAndApplyScores(lobbyId: string, questionIndex: number) {
  const scoreCalculatedMarkerRef = doc(db, 'lobbies', lobbyId, 'answers', `score-calculated-${questionIndex}`);
  const answersQuery = query(collection(db, 'lobbies', lobbyId, 'answers'), where('questionIndex', '==', questionIndex));
  
  try {
    await runTransaction(db, async (transaction) => {
      const marker = await transaction.get(scoreCalculatedMarkerRef);
      if (marker.exists()) {
        console.log(`Scores for question ${questionIndex} already calculated.`);
        return; // Scores already calculated
      }

      const answersSnapshot = await getDocs(answersQuery);
      const playerAnswers: { [playerName: string]: boolean } = {};
      answersSnapshot.forEach(doc => {
          const data = doc.data();
          playerAnswers[data.playerName] = data.isCorrect;
      });

      const playersColRef = collection(db, 'lobbies', lobbyId, 'players');
      const playersSnapshot = await getDocs(playersColRef);

      playersSnapshot.forEach(playerDoc => {
          const playerData = playerDoc.data() as PlayerState;
          const isCorrect = playerAnswers[playerData.name];
          
          if (isCorrect === undefined) return; // Player didn't answer

          let newScore = playerData.score;
          let newStreak = playerData.streak;
          let newNegativeStreak = playerData.negativeStreak;
          let newMaxNegativeStreak = playerData.maxNegativeStreak;


          if (isCorrect) {
              newStreak += 1;
              newNegativeStreak = 0; // Reset negative streak
              let pointsGained = BASE_POINTS;
              if (newStreak >= STREAK_BONUS_THRESHOLD) {
                  pointsGained += STREAK_BONUS_POINTS;
              }
              newScore += pointsGained;
          } else {
              newStreak = 0; // Reset positive streak
              newNegativeStreak += 1;
              if (newNegativeStreak > newMaxNegativeStreak) {
                  newMaxNegativeStreak = newNegativeStreak;
              }
          }
          transaction.update(playerDoc.ref, { 
            score: newScore, 
            streak: newStreak,
            negativeStreak: newNegativeStreak,
            maxNegativeStreak: newMaxNegativeStreak,
          });
      });

      // Mark this question's scores as calculated
      transaction.set(scoreCalculatedMarkerRef, { calculatedAt: new Date() });
    });
  } catch (error) {
    console.error("Score calculation transaction failed: ", error);
  }
}


function HostControls({ lobbyId }: { lobbyId: string }) {
  const handleNextQuestion = async () => {
    const lobbyDocRef = doc(db, 'lobbies', lobbyId);
    try {
       await runTransaction(db, async (transaction) => {
        const lobbySnap = await transaction.get(lobbyDocRef);
        if (!lobbySnap.exists()) {
          throw "Le salon n'existe pas !";
        }

        const lobbyData = lobbySnap.data() as LobbyData;
        const { currentQuestionIndex, phase } = lobbyData.gameState;
        
        // If revealing a valid question, calculate scores before moving on.
        if (phase === 'reveal') {
            await calculateAndApplyScores(lobbyId, currentQuestionIndex);
        }
        
        // Now, move to the next question or finish the game.
        const nextIndex = currentQuestionIndex + 1;

        if (nextIndex >= lobbyData.quiz.length) {
           transaction.update(lobbyDocRef, {
                'gameState.phase': 'finished',
                status: 'finished',
            });
        } else {
             transaction.update(lobbyDocRef, {
                'gameState.phase': 'question',
                'gameState.currentQuestionIndex': nextIndex,
            });
        }
      });
    } catch(e) {
        console.error("Erreur lors du passage à la question suivante:", e);
    }
  };

  const handleNullifyQuestion = async () => {
    const lobbyDocRef = doc(db, 'lobbies', lobbyId);
    await updateDoc(lobbyDocRef, {
      'gameState.phase': 'nulled',
    });
  };

  return (
    <Card className="mt-6 border-primary/50">
      <CardHeader>
        <CardTitle className="text-center">Contrôles de l'Hôte</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center gap-4">
        <Button onClick={handleNextQuestion} size="lg">
            <ChevronsRight className="mr-2 h-5 w-5" />
            Question Suivante
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="lg">
              <XCircle className="mr-2 h-5 w-5" />
              Annuler la Question
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action annulera la question actuelle pour tous les joueurs.
                Aucun point ne sera attribué et vous passerez à la question suivante.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Retour</AlertDialogCancel>
              <AlertDialogAction onClick={handleNullifyQuestion}>Confirmer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}

function PlayerHud({ playerState }: { playerState: PlayerState | null }) {
    if (!playerState) return null;

    return (
        <div className="fixed top-4 right-4 z-50">
            <Card className="bg-background/80 backdrop-blur-sm border-primary/30">
                <CardContent className="p-3 flex items-center gap-4">
                    <div className="text-center">
                        <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                            <Star className="h-6 w-6" />
                            <span>{playerState.score}</span>
                        </div>
                        <p className="text-xs text-foreground/70">Score</p>
                    </div>
                    {playerState.streak > 1 && (
                         <div className="text-center">
                            <div className="flex items-center gap-2 text-2xl font-bold text-yellow-400">
                                <Flame className="h-6 w-6" />
                                <span>{playerState.streak}</span>
                            </div>
                            <p className="text-xs text-foreground/70">Série</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export function GameContainer() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const lobbyId = Array.isArray(params.lobbyId) ? params.lobbyId[0] : params.lobbyId;
    const role = searchParams.get('role');
    const isHost = role === 'moderator';

    const [playerName, setPlayerName] = useState<string | null>(searchParams.get('playerName'));
    const [lobbyData, setLobbyData] = useState<LobbyData | null>(null);
    const [playerState, setPlayerState] = useState<PlayerState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);

    const timerRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        if (!lobbyId) return;

        const lobbyDocRef = doc(db, 'lobbies', lobbyId);
        const unsubscribeLobby = onSnapshot(lobbyDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data() as LobbyData;
                setLobbyData(data);

                if (isHost && !playerName && data.hostName) {
                    setPlayerName(data.hostName);
                }

                if (data.status === 'finished' || (data.gameState && data.gameState.phase === 'finished')) {
                    let url = `/results/${lobbyId}`;
                    const params = new URLSearchParams();
                    if(role) params.set('role', role);
                    if(playerName) params.set('playerName', playerName);
                    router.push(`${url}?${params.toString()}`);
                }
            } else {
                setError("La partie a été terminée ou n'existe plus.");
                setTimeout(() => router.push('/'), 3000);
            }
            setLoading(false);
        }, (err) => {
            console.error(err);
            setError('Erreur de connexion à la partie.');
            setLoading(false);
        });

        return () => unsubscribeLobby();
    }, [lobbyId, router, isHost, playerName, role]);

    useEffect(() => {
        let unsubscribePlayer: (() => void) | undefined;
        if (lobbyId && playerName) {
            const playerDocRef = doc(db, 'lobbies', lobbyId, 'players', playerName);
            unsubscribePlayer = onSnapshot(playerDocRef, (docSnap) => {
                if(docSnap.exists()){
                    setPlayerState(docSnap.data() as PlayerState);
                }
            });
        }
        return () => {
            if (unsubscribePlayer) unsubscribePlayer();
        }
    }, [lobbyId, playerName]);
    
    // The One True Timer Logic - Only in the GameContainer
    useEffect(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        if (lobbyData?.gameState?.phase === 'question') {
            setTimeLeft(lobbyData.timer);
            
            timerRef.current = setInterval(() => {
                setTimeLeft(prevTime => {
                    if (prevTime <= 1) {
                        clearInterval(timerRef.current);
                        // Only host updates the game state to prevent race conditions
                        if (isHost && lobbyId) {
                            const lobbyDocRef = doc(db, 'lobbies', lobbyId);
                            updateDoc(lobbyDocRef, { 'gameState.phase': 'reveal' });
                        }
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);

    }, [lobbyData?.gameState?.phase, lobbyData?.gameState?.currentQuestionIndex, lobbyData?.timer, isHost, lobbyId]);


    const handleFinish = async () => {
      if (isHost) {
        const lobbyDocRef = doc(db, 'lobbies', lobbyId);
        await updateDoc(lobbyDocRef, {
            'gameState.phase': 'finished',
            status: 'finished',
        });
      }
    }

    if (loading) {
        return <div className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4">Préparation de la partie...</p>
        </div>;
    }

    if (error) {
        return <p className="text-destructive text-center text-lg">{error}</p>;
    }
    
    if (!lobbyData || !lobbyData.gameState) {
        return <p className="text-destructive text-center text-lg">Données de la partie introuvables ou invalides.</p>;
    }
    
    const { quiz, topic, timer, gameState } = lobbyData;

    return (
        <div>
            <PlayerHud playerState={playerState} />
            <QuizGame 
                lobbyId={lobbyId}
                playerName={playerName}
                quiz={quiz}
                topic={topic}
                timer={timer}
                onFinish={handleFinish}
                gameState={gameState}
                timeLeft={timeLeft} // Pass the time down
            />
            {isHost && (gameState.phase === 'reveal' || gameState.phase === 'nulled') && (
                <HostControls lobbyId={lobbyId} />
            )}
        </div>
    );
}

    
