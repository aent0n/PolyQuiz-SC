
'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { Loader2, ArrowLeft, LogOut } from 'lucide-react';
import { GameContainer } from '@/components/game/game-container';
import { Button } from '@/components/ui/button';
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
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { doc, getDocs, writeBatch, deleteDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

function ExitGameButton() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const lobbyId = Array.isArray(params.lobbyId) ? params.lobbyId[0] : params.lobbyId;
    const role = searchParams.get('role');
    const playerName = searchParams.get('playerName');
    const isHost = role === 'moderator';

    const handleLeave = async () => {
        if (playerName && lobbyId) {
            try {
                const playerDocRef = doc(db, 'lobbies', lobbyId, 'players', playerName);
                await deleteDoc(playerDocRef);
            } catch (error) {
                console.error("Erreur lors de la sortie du joueur :", error);
            }
        }
        router.push('/');
    };

    const handleCloseLobby = async () => {
        if (!lobbyId) return;
        try {
            const batch = writeBatch(db);

            const playersColRef = collection(db, 'lobbies', lobbyId, 'players');
            const playersSnapshot = await getDocs(playersColRef);
            playersSnapshot.docs.forEach((playerDoc) => {
                batch.delete(playerDoc.ref);
            });

            const answersColRef = collection(db, 'lobbies', lobbyId, 'answers');
            const answersSnapshot = await getDocs(answersColRef);
            answersSnapshot.docs.forEach((answerDoc) => {
                batch.delete(answerDoc.ref);
            });
            
            const lobbyDocRef = doc(db, 'lobbies', lobbyId);
            batch.delete(lobbyDocRef);
            
            await batch.commit();

            router.push('/');
        } catch (error) {
            console.error("Erreur lors de la fermeture du salon:", error);
        }
    };

    if (isHost) {
        return (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <LogOut className="mr-2 h-4 w-4" />
                    Fermer le salon
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Êtes-vous sûr de vouloir fermer le salon ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. Le salon sera supprimé pour tous les joueurs et la partie sera terminée.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCloseLobby}>Confirmer et quitter</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        );
    }

    return (
        <Button variant="outline" size="sm" onClick={handleLeave}>
            <LogOut className="mr-2 h-4 w-4" />
            Quitter la partie
        </Button>
    );
}

function GameStatePage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
            <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(theme(colors.accent/20%)_1px,transparent_1px)] [background-size:32px_32px]"></div>
            
            <div className="absolute top-4 left-4 z-20">
                <ExitGameButton />
            </div>

            <div className="z-10 w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <GameContainer />
            </div>
            <footer className="z-10 mt-8 text-center text-sm text-foreground/50">
                <p>PolyQuiz - Un projet par deltavip3r et Mrjop ✧</p>
                <p>Non affilié à Cloud Imperium Games.</p>
            </footer>
        </main>
    );
}

export default function GameStatePageWithSuspense() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4">Chargement de la partie...</p>
            </div>
        }>
            <GameStatePage />
        </Suspense>
    );
}
