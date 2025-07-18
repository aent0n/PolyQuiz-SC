'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, RotateCw, TrendingDown, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

interface QuizResultsProps {
  score: number;
  total: number;
  onRestart: () => void;
}

export function QuizResults({ score, total, onRestart }: QuizResultsProps) {
  const percentage = Math.round((score / total) * 100);

  const feedback = useMemo(() => {
    if (percentage === 100) {
      return {
        title: 'Perfect Score!',
        message: 'You\'re a true Star Citizen loremaster!',
        icon: <Award className="h-16 w-16 text-yellow-400" />,
      };
    }
    if (percentage >= 70) {
      return {
        title: 'Excellent!',
        message: 'Your knowledge of the verse is impressive.',
        icon: <TrendingUp className="h-16 w-16 text-green-500" />,
      };
    }
    if (percentage >= 40) {
      return {
        title: 'Not Bad!',
        message: 'You know your way around, but there\'s always more to learn.',
        icon: <Award className="h-16 w-16 text-blue-400" />,
      };
    }
    return {
      title: 'Keep Exploring!',
      message: 'The verse is vast and full of knowledge. Don\'t give up!',
      icon: <TrendingDown className="h-16 w-16 text-red-500" />,
    };
  }, [percentage]);

  return (
    <Card className="w-full text-center border-primary/20 shadow-lg shadow-primary/10 animate-in fade-in duration-500">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">{feedback.title}</CardTitle>
        <CardDescription className="text-foreground/80">{feedback.message}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6">
        <div className="flex items-center justify-center text-6xl font-bold text-primary">
          {feedback.icon}
        </div>
        <div className="text-center">
            <p className="text-lg text-foreground/80">You Scored</p>
            <p className="text-7xl font-bold text-primary">{score}<span className="text-3xl text-foreground/60">/{total}</span></p>
            <p className="text-2xl font-medium text-accent">{percentage}%</p>
        </div>
        <Button onClick={onRestart} className="w-full max-w-xs text-lg py-6">
          <RotateCw className="mr-2 h-5 w-5" />
          Play Again
        </Button>
      </CardContent>
    </Card>
  );
}
