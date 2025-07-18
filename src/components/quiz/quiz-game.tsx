
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { Quiz, QuizQuestion, GameState } from '@/types/quiz';
import { QuizResults } from './quiz-results';
import { db } from '@/lib/firebase';
import { doc, setDoc, updateDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';

interface QuizGameProps {
  lobbyId: string;
  playerName: string | null;
  quiz: Quiz;
  topic: string;
  onFinish: () => void;
  timer?: number;
  gameState: GameState;
}

const QUESTION_TIME = 15; // default seconds

export function QuizGame({ quiz, topic, onFinish, timer = QUESTION_TIME, lobbyId, playerName, gameState }: QuizGameProps) {
  const [score, setScore] = useState(0); // This will be calculated from Firestore later
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(timer);
  const [playerCount, setPlayerCount] = useState(0);

  const { currentQuestionIndex, phase } = gameState;
  const currentQuestion: QuizQuestion | undefined = quiz[currentQuestionIndex];
  const isAnswerPhase = phase === 'question';
  
  const submitAnswer = useCallback(async (answer: string) => {
    if (!playerName) return;

    const answerRef = doc(db, 'lobbies', lobbyId, 'answers', `${currentQuestionIndex}-${playerName}`);
    await setDoc(answerRef, {
      playerName,
      answer: answer,
      questionIndex: currentQuestionIndex,
      isCorrect: answer === currentQuestion?.answer,
      timestamp: new Date(),
    });

    // This part is now handled in game-container to avoid race conditions
  }, [lobbyId, playerName, currentQuestionIndex, currentQuestion]);

  const handleAnswerSelect = (option: string) => {
    if (isAnswerPhase) {
      setSelectedAnswer(option);
      submitAnswer(option);
    }
  }

  // Effect to get player count
  useEffect(() => {
    const playersColRef = collection(db, 'lobbies', lobbyId, 'players');
    const unsubscribe = onSnapshot(playersColRef, (snapshot) => {
        setPlayerCount(snapshot.size);
    });
    return () => unsubscribe();
  }, [lobbyId]);

  // Effect to check if all players have answered
  useEffect(() => {
    if (!isAnswerPhase || playerCount === 0) return;

    const answersColRef = collection(db, 'lobbies', lobbyId, 'answers');
    const unsubscribe = onSnapshot(answersColRef, async (snapshot) => {
        const currentQuestionAnswers = snapshot.docs.filter(doc => doc.data().questionIndex === currentQuestionIndex);
        if (currentQuestionAnswers.length === playerCount) {
            const lobbyDocRef = doc(db, 'lobbies', lobbyId);
            await updateDoc(lobbyDocRef, {
                'gameState.phase': 'reveal',
            });
        }
    });

    return () => unsubscribe();

  }, [isAnswerPhase, lobbyId, currentQuestionIndex, playerCount]);


  useEffect(() => {
    // Reset for new question
    setSelectedAnswer(null);
    setTimeLeft(timer);
  }, [currentQuestionIndex, timer]);
  
  // Timer countdown effect
  useEffect(() => {
    if (!isAnswerPhase || timeLeft <= 0) {
      if(isAnswerPhase && timeLeft <= 0){
        const lobbyDocRef = doc(db, 'lobbies', lobbyId);
        updateDoc(lobbyDocRef, {
            'gameState.phase': 'reveal',
        });
      }
      return;
    };
    
    const timerId = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, isAnswerPhase, lobbyId]);


  if (!currentQuestion) {
     return <QuizResults score={score} total={quiz.length} onRestart={onFinish} />;
  }

  const getButtonClass = (option: string) => {
    if (isAnswerPhase) {
      return selectedAnswer === option
        ? 'border-primary bg-primary/20'
        : 'bg-secondary/80';
    }
    // Reveal phase
    if (option === currentQuestion.answer) {
      return 'bg-green-600 hover:bg-green-600 text-white border-green-500'; // Correct answer
    }
    if (option === selectedAnswer) {
      return 'bg-red-600 hover:bg-red-600 text-white border-red-500'; // Wrong selected answer
    }
    return 'bg-secondary/50 opacity-60'; // Other incorrect options
  };

  return (
    <Card className="w-full border-primary/20 shadow-lg shadow-primary/10">
      <CardHeader>
        <div className="flex justify-between items-center text-foreground/80">
          <span>Question {currentQuestionIndex + 1} sur {quiz.length}</span>
          <span className="capitalize">{topic}</span>
        </div>
        <Progress value={(timeLeft / timer) * 100} className="w-full h-2 mt-2 [&>div]:bg-primary" />
        <CardTitle className="pt-4 text-2xl">{currentQuestion.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.options.map((option) => (
            <Button
              key={option}
              onClick={() => handleAnswerSelect(option)}
              className={cn(
                "h-auto w-full justify-start p-4 text-left whitespace-normal text-base transition-all duration-300 border-2 border-transparent",
                getButtonClass(option)
              )}
              disabled={!isAnswerPhase}
            >
              {option}
            </Button>
          ))}
        </div>
         <div className="text-center text-foreground/60 h-6">
            { isAnswerPhase && !!selectedAnswer && <p>Réponse sélectionnée. Vous pouvez changer tant que le temps n'est pas écoulé.</p>}
            { !isAnswerPhase && <p>Les réponses sont verrouillées. En attente de l'hôte...</p>}
        </div>
      </CardContent>
    </Card>
  );
}
