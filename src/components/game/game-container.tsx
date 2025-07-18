
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import type { Quiz } from '@/types/quiz';
import { QuizGame } from '../quiz/quiz-game';

interface LobbyData {
  topic: string;
  timer: number;
  quiz: Quiz;
  status: 'waiting' | 'playing' | 'finished';
}

export function GameContainer() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const lobbyId = Array.isArray(params.lobbyId) ? params.lobbyId[0] : params.lobbyId;
    const playerName = searchParams.get('playerName');

    const [lobbyData, setLobbyData] = useState<LobbyData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!lobbyId) return;

        const lobbyDocRef = doc(db, 'lobbies', lobbyId);
        const unsubscribe = onSnapshot(lobbyDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data() as LobbyData;
                setLobbyData(data);
                if (data.status === 'finished') {
                    // Redirect to results page later
                    router.push('/');
                }
            } else {
                setError('La partie a été terminée ou n\'existe plus.');
                setTimeout(() => router.push('/'), 3000);
            }
            setLoading(false);
        }, (err) => {
            console.error(err);
            setError('Erreur de connexion à la partie.');
            setLoading(false);
        });

        return () => unsubscribe();
    }, [lobbyId, router]);

    const handleFinish = () => {
      // For now, just go home. Later, this will go to a results screen.
      console.log("Quiz finished!");
      router.push('/');
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
    
    if (!lobbyData) {
        return <p className="text-destructive text-center text-lg">Données de la partie introuvables.</p>;
    }

    // Both players and the moderator/host will play the game.
    // A dedicated moderator view can be implemented later.
    return (
        <QuizGame 
            quiz={lobbyData.quiz}
            topic={lobbyData.topic}
            timer={lobbyData.timer}
            onFinish={handleFinish}
        />
    );
}
