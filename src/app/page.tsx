'use client';

import { HomePage } from '@/components/landing/home-page';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background">
       <div className="z-10 w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <HomePage />
      </div>

       <footer className="z-10 mt-8 text-center text-sm text-foreground/50">
        <p>PolyQuiz - Un projet par deltavip3r et Mrjop ✧</p>
        <p>Non affilié à Cloud Imperium Games.</p>
      </footer>
    </main>
  );
}
