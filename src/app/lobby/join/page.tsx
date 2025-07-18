
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

function JoinLobbyForm() {
  const [lobbyCode, setLobbyCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setLobbyCode(codeFromUrl.toUpperCase());
    }
  }, [searchParams]);

  const handleJoinLobby = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lobbyCode.trim() || !playerName.trim()) {
      toast({
        title: 'Champs requis',
        description: 'Veuillez entrer un code de salon et votre nom de joueur.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);

    try {
      const lobbyDocRef = doc(db, 'lobbies', lobbyCode.toUpperCase());
      const lobbyDocSnap = await getDoc(lobbyDocRef);

      if (lobbyDocSnap.exists()) {
        toast({
          title: 'Salon trouvé !',
          description: 'Vous allez être redirigé...',
        });
        // Rediriger vers la page du joueur avec le nom en paramètre de requête
        router.push(`/player/${lobbyCode.toUpperCase()}?playerName=${encodeURIComponent(playerName)}`);
      } else {
        toast({
          title: 'Salon introuvable',
          description: 'Vérifiez le code et réessayez.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error("Erreur en rejoignant le salon:", error);
      toast({
        title: 'Erreur',
        description: 'Impossible de rejoindre le salon. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background">
       <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(theme(colors.accent/20%)_1px,transparent_1px)] [background-size:32px_32px]"></div>
      <div className="z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="border-primary/20 shadow-lg shadow-primary/10">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-headline text-primary">Rejoindre un Salon</CardTitle>
            <CardDescription className="text-center text-foreground/80 pt-2">
              Entrez le code du salon et votre nom pour participer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoinLobby} className="space-y-4">
               <div>
                <Label htmlFor="lobby-code">Code du Salon</Label>
                <Input
                  id="lobby-code"
                  value={lobbyCode}
                  onChange={(e) => setLobbyCode(e.target.value)}
                  placeholder="CODE"
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                  autoCapitalize="characters"
                />
              </div>
              <div>
                <Label htmlFor="player-name">Votre Nom</Label>
                <Input
                  id="player-name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Nom du joueur"
                  className="text-center text-lg"
                />
              </div>
              <Button type="submit" className="w-full text-lg py-6" disabled={isLoading || !lobbyCode.trim() || !playerName.trim()}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  'Rejoindre'
                )}
              </Button>
            </form>
            <div className="text-center mt-6">
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


export default function JoinLobbyPage() {
  return (
    <Suspense fallback={
        <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    }>
        <JoinLobbyForm />
    </Suspense>
  )
}
