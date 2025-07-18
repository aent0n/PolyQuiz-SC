// This page is obsolete now that we use dynamic routes for moderator lobbies.
// It can be removed or kept as a fallback. For now, we'll just make it redirect.
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ModeratorPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/');
    }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-foreground/80">Redirection...</p>
    </main>
  );
}
