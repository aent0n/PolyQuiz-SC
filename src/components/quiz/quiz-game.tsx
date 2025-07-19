
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { Quiz, QuizQuestion, GameState, PlayerState } from '@/types/quiz';
import { db } from '@/lib/firebase';
import { doc, setDoc, updateDoc, collection, onSnapshot, getDocs, getDoc, runTransaction, query, where } from 'firebase/firestore';

interface QuizGameProps {
  lobbyId: string;
  playerName: string | null;
  quiz: Quiz;
  topic: string;
  onFinish: () => void;
  timer: number;
  gameState: GameState;
  timeLeft: number;
}

const STREAK_BONUS_THRESHOLD = 3;
const BASE_POINTS = 10;
const STREAK_BONUS_POINTS = 5;

export function QuizGame({ quiz, topic, onFinish, timer, lobbyId, playerName, gameState, timeLeft }: QuizGameProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  
  const { currentQuestionIndex, phase } = gameState;
  const currentQuestion: QuizQuestion | undefined = quiz[currentQuestionIndex];
  const isAnswerPhase = phase === 'question';

  const previousQuestionIndex = useRef<number>();

  useEffect(() => {
    // This effect ensures local state is reset ONLY when the question actually changes.
    if (previousQuestionIndex.current !== currentQuestionIndex) {
      setSelectedAnswer(null);
      previousQuestionIndex.current = currentQuestionIndex;
    }
  }, [currentQuestionIndex]);

  const submitAnswer = useCallback(async (answer: string) => {
    if (!playerName || !isAnswerPhase || !currentQuestion) return;

    const answerRef = doc(db, 'lobbies', lobbyId, 'answers', `${currentQuestionIndex}-${playerName}`);
    try {
      await setDoc(answerRef, {
        playerName,
        answer: answer,
        questionIndex: currentQuestionIndex,
        isCorrect: answer === currentQuestion.answer,
        timestamp: new Date(),
      }, { merge: true });
    } catch (e) {
      console.error("Failed to submit answer:", e);
    }
  }, [lobbyId, playerName, currentQuestionIndex, currentQuestion, isAnswerPhase]);

  const handleAnswerSelect = (option: string) => {
    if (isAnswerPhase) {
      setSelectedAnswer(option);
      submitAnswer(option);
    }
  }

  // Score calculation effect
  useEffect(() => {
      if (phase !== 'reveal') return;

      const scoreCalculatedMarkerRef = doc(db, 'lobbies', lobbyId, 'answers', `score-calculated-${currentQuestionIndex}`);

      const calculateScores = async () => {
          try {
              await runTransaction(db, async (transaction) => {
                  const marker = await transaction.get(scoreCalculatedMarkerRef);
                  if (marker.exists()) {
                      console.log(`Scores for question ${currentQuestionIndex} already calculated.`);
                      return; // Scores already calculated
                  }
                  
                  // Phase 1: Reads
                  const answersQuery = query(collection(db, 'lobbies', lobbyId, 'answers'), where('questionIndex', '==', currentQuestionIndex));
                  const answersSnapshot = await getDocs(answersQuery);
                  
                  const currentAnswers = answersSnapshot.docs.map(doc => doc.data() as { playerName: string; isCorrect: boolean });

                  if (currentAnswers.length === 0) {
                      transaction.set(scoreCalculatedMarkerRef, { calculatedAt: new Date() });
                      return;
                  }

                  const playerRefs = currentAnswers.map(answer => doc(db, 'lobbies', lobbyId, 'players', answer.playerName));
                  const playerDocs = [];
                  for(const ref of playerRefs) {
                      playerDocs.push(await transaction.get(ref));
                  }
                  
                  // Phase 2: Writes
                  for (let i = 0; i < currentAnswers.length; i++) {
                      const answer = currentAnswers[i];
                      const playerDoc = playerDocs[i];

                      if (!playerDoc.exists()) continue;

                      const playerData = playerDoc.data() as PlayerState;
                      let newScore = playerData.score;
                      let newStreak = playerData.streak;

                      if (answer.isCorrect) {
                          newStreak += 1;
                          let pointsGained = BASE_POINTS;
                          if (newStreak >= STREAK_BONUS_THRESHOLD) {
                              pointsGained += STREAK_BONUS_POINTS;
                          }
                          newScore += pointsGained;
                      } else {
                          newStreak = 0;
                      }
                      transaction.update(playerRefs[i], { score: newScore, streak: newStreak });
                  }
                  
                  transaction.set(scoreCalculatedMarkerRef, { calculatedAt: new Date() });
              });
          } catch (error) {
              console.error("Transaction failed: ", error);
          }
      };

      calculateScores();

  }, [phase, currentQuestionIndex, lobbyId]);


  if (!currentQuestion) {
     useEffect(() => {
       onFinish();
     }, [onFinish]);

    return null;
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
    if (option === selectedAnswer && selectedAnswer !== currentQuestion.answer) {
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
          {isAnswerPhase && !!selectedAnswer && <p>Réponse enregistrée. Vous pouvez la modifier jusqu'à la fin du temps.</p>}
          {!isAnswerPhase && <p>Les réponses sont verrouillées. Révélation des scores...</p>}
        </div>
      </CardContent>
    </Card>
  );
}
