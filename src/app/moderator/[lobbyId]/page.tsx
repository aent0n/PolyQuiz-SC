'use client';

import { useEffect, useState, use } from 'react';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";

interface LobbyData {
  topic: string;
  timer: number;
  quiz: any[];
}

export default function ModeratorLobbyPage({ params }: { params: Promise<{ lobbyId: string }> }) {
  const [lobbyData, setLobbyData] = useState<LobbyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { lobbyId } = use(params);
  const { toast } = useToast();

  useEffect(() => {
    if (!lobbyId) return;

    const lobbyDocRef = doc(db, 'lobbies', lobbyId);

    const fetchLobbyData = async () => {
      try {
        const lobbyDocSnap = await getDoc(lobbyDocRef);

        if (lobbyDocSnap.exists()) {
          setLobbyData(lobbyDocSnap.data() as LobbyData);
        } else {
          setError('Le salon est introuvable ou a été supprimé.');
        }
      } catch (err) {
        console.error("Erreur lors de la récupération du salon:", err);
        setError('Impossible de charger les données du salon.');
      } finally {
        setLoading(false);
      }
    };

    fetchLobbyData();

    // Fonction de nettoyage qui s'exécute lorsque le composant est démonté
    return () => {
      const deleteLobby = async () => {
        try {
          await deleteDoc(lobbyDocRef);
          console.log(`Salon ${lobbyId} supprimé.`);
          // Pas besoin de toast ici, car l'utilisateur a déjà quitté la page.
        } catch (error) {
          console.error("Erreur lors de la suppression du salon:", error);
          // On ne peut pas afficher de toast de manière fiable car la page est en cours de fermeture.
        }
      };
      
      // On vérifie que le salon existe avant de tenter de le supprimer
      if (lobbyData) {
        deleteLobby();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lobbyId]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background">
      <div className="w-full max-w-4xl">
        <Card className="border-primary/20 shadow-lg shadow-primary/10">
          <CardHeader>
            <CardTitle className="text-center text-3xl text-primary">Salon du Modérateur</CardTitle>

            <CardDescription className="text-center text-lg text-foreground/80">
              Code du salon : <span className="font-bold text-primary">{lobbyId}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {loading && (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-lg">Chargement du salon...</p>
              </div>
            )}
            {error && <p className="text-destructive text-lg">{error}</p>}
            {lobbyData && (
              <div>
                <h3 className="text-2xl font-bold mb-4">Détails du Quiz</h3>
                <p>Sujet : <span className="font-semibold capitalize">{lobbyData.topic}</span></p>
                <p>Questions : <span className="font-semibold">{lobbyData.quiz.length}</span></p>
                <p>Timer : <span className="font-semibold">{lobbyData.timer} secondes</span></p>

                {/* D'autres composants pour la gestion du jeu viendront ici */}
              </div>
            )}
             <div className="text-center mt-8">
                <Link href="/" passHref>
                  <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour à l'accueil
                  </Button>
                </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
