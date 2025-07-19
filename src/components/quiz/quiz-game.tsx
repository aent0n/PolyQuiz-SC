
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { Quiz, QuizQuestion, GameState, PlayerState } from '@/types/quiz';
import { QuizResults } from './quiz-results';
import { db } from '@/lib/firebase';
import { doc, setDoc, updateDoc, collection, onSnapshot, getDocs, writeBatch, getDoc, runTransaction } from 'firebase/firestore';

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
const STREAK_BONUS_THRESHOLD = 3;
const BASE_POINTS = 10;
const STREAK_BONUS_POINTS = 5;

export function QuizGame({ quiz, topic, onFinish, timer = QUESTION_TIME, lobbyId, playerName, gameState }: QuizGameProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(timer);
  const [playerCount, setPlayerCount] = useState(0);
  const [score, setScore] = useState(0); // Used for final results screen

  const { currentQuestionIndex, phase } = gameState;
  const currentQuestion: QuizQuestion | undefined = quiz[currentQuestionIndex];
  const isAnswerPhase = phase === 'question';

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

  // Effect to get player count
  useEffect(() => {
    const playersColRef = collection(db, 'lobbies', lobbyId, 'players');
    const unsubscribe = onSnapshot(playersColRef, (snapshot) => {
      setPlayerCount(snapshot.size);
    });
    return () => unsubscribe();
  }, [lobbyId]);


  // Score calculation effect
  useEffect(() => {
      if (phase !== 'reveal') return;

      const calculateScores = async () => {
          const answersQuerySnapshot = await getDocs(collection(db, 'lobbies', lobbyId, 'answers'));
          const currentAnswers = answersQuerySnapshot.docs
              .map(doc => ({ id: doc.id, ...doc.data() }))
              .filter(a => a.questionIndex === currentQuestionIndex);

          if (currentAnswers.length === 0) return; // No answers to process

          try {
              await runTransaction(db, async (transaction) => {
                  for (const answer of currentAnswers) {
                      const playerDocRef = doc(db, 'lobbies', lobbyId, 'players', answer.playerName);
                      const playerDoc = await transaction.get(playerDocRef);

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
                      transaction.update(playerDocRef, { score: newScore, streak: newStreak });
                  }
              });

              // Update local score for final results display if current player is involved
              if(playerName) {
                  const playerDocRef = doc(db, 'lobbies', lobbyId, 'players', playerName);
                  const finalPlayerDoc = await getDoc(playerDocRef);
                  if(finalPlayerDoc.exists()) {
                      setScore(finalPlayerDoc.data().score);
                  }
              }

          } catch (error) {
              console.error("Transaction failed: ", error);
          }
      };

      calculateScores();

  }, [phase, currentQuestionIndex, lobbyId, playerName]);


  useEffect(() => {
    setSelectedAnswer(null);
    setTimeLeft(timer);
  }, [currentQuestionIndex, timer]);

  // Timer countdown effect
  useEffect(() => {
    if (!isAnswerPhase) return;

    if (timeLeft <= 0) {
      const lobbyDocRef = doc(db, 'lobbies', lobbyId);
      getDoc(lobbyDocRef).then(lobbySnap => {
          if (lobbySnap.exists() && lobbySnap.data().gameState.phase === 'question') {
             updateDoc(lobbyDocRef, {
                'gameState.phase': 'reveal',
            });
          }
      });
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, isAnswerPhase, lobbyId]);


  if (!currentQuestion) {
    // Attempt to fetch final score for results screen
    useEffect(() => {
      const fetchFinalScore = async () => {
        if(playerName) {
          const playerDocRef = doc(db, 'lobbies', lobbyId, 'players', playerName);
          const docSnap = await getDoc(playerDocRef);
          if (docSnap.exists()) {
            setScore(docSnap.data().score);
          }
        }
      }
      fetchFinalScore();
    }, [lobbyId, playerName]);
    return <QuizResults score={score} total={quiz.length * BASE_POINTS} onRestart={onFinish} />;
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
          {isAnswerPhase && !!selectedAnswer && <p>Réponse sélectionnée. Vous pouvez changer tant que le temps n'est pas écoulé.</p>}
          {!isAnswerPhase && <p>Les réponses sont verrouillées. En attente de la révélation...</p>}
        </div>
      </CardContent>
    </Card>
  );
}
