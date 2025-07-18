
'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { GameContainer } from '@/components/game/game-container';

function GameStatePage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
            <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(theme(colors.accent/20%)_1px,transparent_1px)] [background-size:32px_32px]"></div>
            <div className="z-10 w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <GameContainer />
            </div>
            <footer className="z-10 mt-8 text-center text-sm text-foreground/50">
                <p>PolyQuiz - Une aventure Star Citizen</p>
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
