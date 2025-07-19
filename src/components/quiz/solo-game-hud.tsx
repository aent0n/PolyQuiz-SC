
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Flame, Star } from 'lucide-react';

interface SoloGameHudProps {
    score: number;
    streak: number;
}

export function SoloGameHud({ score, streak }: SoloGameHudProps) {
    return (
        <div className="fixed top-4 right-4 z-50">
            <Card className="bg-background/80 backdrop-blur-sm border-primary/30">
                <CardContent className="p-3 flex items-center gap-4">
                    <div className="text-center">
                        <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                            <Star className="h-6 w-6" />
                            <span>{score}</span>
                        </div>
                        <p className="text-xs text-foreground/70">Score</p>
                    </div>
                    {streak > 1 && (
                         <div className="text-center">
                            <div className="flex items-center gap-2 text-2xl font-bold text-yellow-400">
                                <Flame className="h-6 w-6" />
                                <span>{streak}</span>
                            </div>
                            <p className="text-xs text-foreground/70">Série</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
