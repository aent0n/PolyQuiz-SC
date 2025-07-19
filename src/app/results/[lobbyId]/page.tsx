
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PlayerState } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Home, BarChart3, CheckCircle2, XCircle, Flame } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface Answer {
  id: string;
  playerName: string;
  isCorrect: boolean;
  questionIndex: number;
}

interface EnrichedPlayerState extends PlayerState {
    id: string;
    answers: Answer[];
}

function GameResults() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    const lobbyId = Array.isArray(params.lobbyId) ? params.lobbyId[0] : params.lobbyId;
    const role = searchParams.get('role');
    const isHost = role === 'moderator';

    const [players, setPlayers] = useState<EnrichedPlayerState[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [questionCount, setQuestionCount] = useState(0);

    useEffect(() => {
        if (!lobbyId) {
            router.push('/');
            return;
        }

        const fetchResults = async () => {
            try {
                setLoading(true);
                const playersColRef = collection(db, 'lobbies', lobbyId, 'players');
                const answersColRef = collection(db, 'lobbies', lobbyId, 'answers');

                const [playersSnapshot, answersSnapshot] = await Promise.all([
                    getDocs(playersColRef),
                    getDocs(answersColRef)
                ]);

                if (playersSnapshot.empty) {
                    throw new Error("Aucun joueur trouvé pour cette partie.");
                }

                const allAnswers = answersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Answer));
                
                let maxQuestionIndex = 0;
                allAnswers.forEach(a => {
                    if(a.questionIndex > maxQuestionIndex) {
                        maxQuestionIndex = a.questionIndex;
                    }
                });
                setQuestionCount(maxQuestionIndex + 1);

                const enrichedPlayers = playersSnapshot.docs.map(doc => {
                    const playerData = doc.data() as PlayerState;
                    const playerAnswers = allAnswers.filter(a => a.playerName === playerData.name);
                    return { id: doc.id, ...playerData, answers: playerAnswers };
                });

                // Sort by score descending
                enrichedPlayers.sort((a, b) => b.score - a.score);

                setPlayers(enrichedPlayers);
            } catch (err) {
                console.error("Erreur lors de la récupération des résultats:", err);
                setError("Impossible de charger les résultats de la partie.");
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [lobbyId, router]);
    
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4">Calcul des résultats...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="w-full max-w-md text-center border-destructive/50">
               <CardHeader>
                <CardTitle className="text-destructive">Erreur</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">{error}</p>
                 <Button asChild variant="outline" className="mt-4">
                    <Link href="/">
                        <Home className="mr-2 h-4 w-4" />
                        Retour à l'accueil
                    </Link>
                </Button>
              </CardContent>
            </Card>
        );
    }

    return (
        <div className="w-full max-w-4xl space-y-8 animate-in fade-in duration-500">
            <Card className="border-primary/20 shadow-lg shadow-primary/10">
                <CardHeader>
                    <CardTitle className="text-3xl text-primary font-headline text-center">Résultats Finaux</CardTitle>
                    <CardDescription className="text-lg text-foreground/80 text-center">
                        Voici le classement final de la partie.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {players.map((player, index) => (
                            <Card key={player.id} className="flex items-center p-4 bg-secondary">
                                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/20 text-primary font-bold text-xl mr-4">
                                    {index + 1}
                                </div>
                                <div className="flex-grow">
                                    <p className="font-bold text-lg">{player.name}</p>
                                    <p className="text-sm text-foreground/70">
                                        Série max: <span className="font-semibold">{player.streak}</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-primary">{player.score} pts</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
            
            {isHost && (
                 <Card className="mt-8">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <BarChart3 className="mr-2 h-6 w-6"/>
                            Panel Détaillé de l'Hôte
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Joueur</TableHead>
                                    <TableHead className="text-center">Score</TableHead>
                                    <TableHead className="text-center">Série Max</TableHead>
                                    <TableHead className="text-center">Réponses (Q1...)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {players.map(player => (
                                    <TableRow key={player.id}>
                                        <TableCell className="font-medium">{player.name}</TableCell>
                                        <TableCell className="text-center font-bold">{player.score}</TableCell>
                                        <TableCell className="text-center">{player.streak}</TableCell>
                                        <TableCell className="flex justify-center gap-2">
                                            {Array.from({ length: questionCount }).map((_, qIndex) => {
                                                const answer = player.answers.find(a => a.questionIndex === qIndex);
                                                if (!answer) return <Badge key={qIndex} variant="outline" className="h-6 w-6 p-0 flex items-center justify-center">-</Badge>;
                                                return answer.isCorrect
                                                    ? <CheckCircle2 key={qIndex} className="h-6 w-6 text-green-500" />
                                                    : <XCircle key={qIndex} className="h-6 w-6 text-red-500" />;
                                            })}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            <div className="text-center mt-8">
                <Button asChild size="lg">
                    <Link href="/">
                        <Home className="mr-2 h-5 w-5" />
                        Retourner à l'accueil
                    </Link>
                </Button>
            </div>
        </div>
    )
}

export default function ResultsPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background">
            <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(theme(colors.accent/20%)_1px,transparent_1px)] [background-size:32px_32px]"></div>
            <Suspense fallback={
                 <div className="flex flex-col items-center justify-center p-8">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4">Chargement des résultats...</p>
                </div>
            }>
                <GameResults />
            </Suspense>
        </main>
    )
}
