
"use client";

import { useState, useEffect, useCallback } from "react";
import type { StoredQuiz, Question, QuizMode, QuizAttempt, QuizProgress } from "@/types/quiz";
import { shuffleArray } from "@/lib/utils";
import QuizUploader from "@/components/quiz-uploader";
import QuizQuestion from "@/components/quiz-question";
import QuizResults from "@/components/quiz-results";
import QuizReview from "@/components/quiz-review";
import QuizTimer from "@/components/quiz-timer";
import { Button } from "@/components/ui/button";
import QuizPauseControl from "@/components/quiz-pause-control";
import { loadQuizzes, saveQuizzes, loadQuizProgress, saveQuizProgress } from "@/lib/storage";

type QuizStatus = "idle" | "active" | "finished" | "review";

export default function Home() {
  const [quizzes, setQuizzes] = useState<StoredQuiz[]>([]);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
  const [quizConfig, setQuizConfig] = useState<{ id: string; name: string; mode: "practice" | "test" | "study"; length: number } | null>(null);
  const [score, setScore] = useState(0);
  const [quizStatus, setQuizStatus] = useState<QuizStatus>("idle");
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [wasPausedByButton, setWasPausedByButton] = useState(false);
  const [quizProgressMap, setQuizProgressMap] = useState<Record<string, QuizProgress>>({});

  useEffect(() => {
    const loadedQuizzes = loadQuizzes();
    setQuizzes(loadedQuizzes);
    const progressData: Record<string, QuizProgress> = {};
    for (const quiz of loadedQuizzes) {
        progressData[quiz.id] = loadQuizProgress(quiz.id);
    }
    setQuizProgressMap(progressData);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && quizStatus === 'active' && quizConfig?.mode === 'test' && !wasPausedByButton) {
        setIsPaused(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [quizStatus, quizConfig, wasPausedByButton]);


  const handleQuizzesUpdate = (updatedQuizzes: StoredQuiz[]) => {
    saveQuizzes(updatedQuizzes);
    setQuizzes(updatedQuizzes);
  };

  const handleStartQuiz = (quiz: StoredQuiz, mode: QuizMode, length: number) => {
    let questionsForQuiz: Question[] = [...quiz.questions];

    if (mode.type === 'study') {
        const progress = quizProgressMap[quiz.id] || { questionStats: {}, history: [] };
        // Sort questions by worst performance (lowest correct percentage)
        questionsForQuiz.sort((a, b) => {
            const statsA = progress.questionStats[a.question] || { correct: 0, total: 0 };
            const statsB = progress.questionStats[b.question] || { correct: 0, total: 0 };
            const perfA = statsA.total > 0 ? statsA.correct / statsA.total : 1;
            const perfB = statsB.total > 0 ? statsB.correct / statsB.total : 1;
            if (perfA !== perfB) {
                return perfA - perfB; // Lower performance first
            }
             // If performance is equal, add some randomness
            return Math.random() - 0.5;
        });
        questionsForQuiz = questionsForQuiz.slice(0, length);
    } else {
        questionsForQuiz = shuffleArray(questionsForQuiz).slice(0, length);
    }

    const questionsWithShuffledOptions = questionsForQuiz.map(q => ({
      ...q,
      options: shuffleArray(q.options),
    }));

    setActiveQuestions(questionsWithShuffledOptions);
    setQuizConfig({ id: quiz.id, name: quiz.name, mode: mode.type, length: questionsWithShuffledOptions.length });
    setCurrentQuestionIndex(0);
    setUserAnswers(new Array(questionsWithShuffledOptions.length).fill(null));
    setScore(0);
    setShowExplanation(false);
    setSelectedAnswer(null);
    setQuizStatus("active");
    setTimeRemaining(null);
    setIsPaused(false);
    setWasPausedByButton(false);

    if (mode.type === "test") {
      const testTime = Math.ceil(length * 1.5 * 60); // 1.5 minutes per question
      setTimeRemaining(testTime);
    }
  };
  
  const updateProgress = (quizId: string, questionText: string, isCorrect: boolean) => {
    setQuizProgressMap(prevMap => {
        const currentProgress = prevMap[quizId] ? { ...prevMap[quizId] } : { questionStats: {}, history: [] };
        
        // Ensure questionStats exists
        currentProgress.questionStats = currentProgress.questionStats ? { ...currentProgress.questionStats } : {};

        const stat = currentProgress.questionStats[questionText] ? { ...currentProgress.questionStats[questionText] } : { correct: 0, total: 0 };

        stat.total += 1;
        if (isCorrect) {
            stat.correct += 1;
        }

        currentProgress.questionStats[questionText] = stat;
        
        // For practice/study mode, add a single-question attempt to history
        if (quizConfig?.mode === 'practice' || quizConfig?.mode === 'study') {
            const newAttempt: QuizAttempt = {
                date: new Date().toISOString(),
                questionsAnswered: 1,
                correctAnswers: isCorrect ? 1 : 0,
            };
            currentProgress.history = [...(currentProgress.history || []), newAttempt];
        }

        saveQuizProgress(quizId, currentProgress);

        return {
            ...prevMap,
            [quizId]: currentProgress
        };
    });
  };

  const handleFinishQuiz = useCallback(() => {
    if (!quizConfig) return;
    
    let finalScore = 0;
    
    userAnswers.forEach((answer, index) => {
        if (answer === activeQuestions[index].correct_answer) {
            finalScore++;
        }
        if (quizConfig.mode === 'test') {
            const question = activeQuestions[index];
            const isCorrect = answer === question.correct_answer;
            updateProgress(quizConfig.id, question.question, isCorrect);
        }
    });
    
    setScore(finalScore);
    setQuizStatus("finished");
    setTimeRemaining(null);

    // Save quiz attempt to history for 'test' mode
    if (quizConfig.mode === 'test') {
        const newAttempt: QuizAttempt = {
            date: new Date().toISOString(),
            questionsAnswered: activeQuestions.length,
            correctAnswers: finalScore,
        };
        setQuizProgressMap(prevMap => {
            const currentProgress = prevMap[quizConfig.id] ? { ...prevMap[quizConfig.id] } : { questionStats: {}, history: [] };
            currentProgress.history = [...(currentProgress.history || []), newAttempt];
            saveQuizProgress(quizConfig.id, currentProgress);
            return {
                ...prevMap,
                [quizConfig.id]: currentProgress
            };
        });
    }
  }, [userAnswers, activeQuestions, quizConfig]);

  useEffect(() => {
    if (quizStatus !== 'active' || quizConfig?.mode !== 'test' || timeRemaining === null || isPaused) {
      return;
    }

    if (timeRemaining <= 0) {
      handleFinishQuiz();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStatus, quizConfig, timeRemaining, handleFinishQuiz, isPaused]);

  const handleAnswerSelect = (answer: string) => {
    if (showExplanation) return;
    setSelectedAnswer(answer);

    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);
  };

  const handleSubmitPractice = () => {
    if (!selectedAnswer || !quizConfig) return;
    const currentQuestion = activeQuestions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    
    if (isCorrect) {
      setScore(s => s + 1);
    }

    if (quizConfig.mode === 'practice' || quizConfig.mode === 'study') {
        updateProgress(quizConfig.id, currentQuestion.question, isCorrect);
    }

    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
      if (quizConfig?.mode === 'test') {
        setSelectedAnswer(userAnswers[currentQuestionIndex + 1]);
      } else {
        setSelectedAnswer(null);
        setShowExplanation(false);
      }
    } else {
      handleFinishQuiz();
    }
  };
  
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(i => i - 1);
      setSelectedAnswer(userAnswers[currentQuestionIndex - 1]);
      if (quizConfig?.mode !== 'test') {
        setShowExplanation(false);
      }
    }
  };

  const handleRestart = () => {
    setQuizStatus("idle");
    setActiveQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setScore(0);
    setShowExplanation(false);
    setSelectedAnswer(null);
    setQuizConfig(null);
    setIsPaused(false);
    setWasPausedByButton(false);
  };
  
  const handleReview = () => {
    setQuizStatus("review");
  };

  const handlePause = (pausedByButton: boolean) => {
    setIsPaused(true);
    if (pausedByButton) {
        setWasPausedByButton(true);
    }
  };

  const handleResume = (pausedByButton: boolean) => {
    setIsPaused(false);
    if (pausedByButton) {
        setWasPausedByButton(false);
    }
  };

  const renderContent = () => {
    switch (quizStatus) {
      case "active":
        if (activeQuestions.length > 0 && quizConfig) {
          return (
            <div className="w-full max-w-4xl mx-auto mt-8 p-4 sm:p-6 md:p-8 bg-card rounded-3xl shadow-sm">
              <QuizQuestion
                question={activeQuestions[currentQuestionIndex]}
                currentQuestion={currentQuestionIndex + 1}
                totalQuestions={activeQuestions.length}
                score={score}
                selectedAnswer={selectedAnswer}
                showExplanation={showExplanation}
                onAnswerSelect={handleAnswerSelect}
                onSubmit={handleSubmitPractice}
                onNext={handleNextQuestion}
                onPrev={handlePrevQuestion}
                mode={quizConfig.mode}
                onSubmitTest={handleFinishQuiz}
                isPaused={isPaused}
              />
            </div>
          );
        }
        return (
          <div className="text-center p-8 bg-card rounded-3xl shadow-sm">
            <h2 className="text-2xl font-bold mb-4">No Questions Available!</h2>
            <p className="text-muted-foreground">There are no questions in this quiz.</p>
            <Button onClick={handleRestart} className="mt-6">Back to Home</Button>
          </div>
        );
      case "finished":
        if (quizConfig) {
          return (
            <div className="w-full max-w-4xl mx-auto mt-8 p-4 sm:p-6 md:p-8 bg-card rounded-3xl shadow-sm">
              <QuizResults
                score={score}
                totalQuestions={activeQuestions.length}
                onRestart={handleRestart}
                onReview={handleReview}
                mode={quizConfig.mode}
              />
            </div>
          );
        }
        return null;
      case "review":
        return (
          <div className="w-full max-w-4xl mx-auto mt-8 p-4 sm:p-6 md:p-8 bg-card rounded-3xl shadow-sm">
            <QuizReview
                questions={activeQuestions}
                userAnswers={userAnswers}
                onClose={() => setQuizStatus('finished')}
            />
           </div>
        );
      case "idle":
      default:
        return (
          <QuizUploader
            storedQuizzes={quizzes}
            quizProgressMap={quizProgressMap}
            onQuizzesUpdate={handleQuizzesUpdate}
            onStartQuiz={handleStartQuiz}
          />
        );
    }
  };

  return (
    <main className="text-foreground flex flex-col items-center justify-center p-4 font-body">
      {quizStatus === "active" && quizConfig?.mode === "test" && timeRemaining !== null && (
        <QuizTimer timeRemaining={timeRemaining} />
      )}
       {quizStatus === "active" && (
        <QuizPauseControl
            isPaused={isPaused}
            onPause={handlePause}
            onResume={handleResume}
            onCloseQuiz={handleRestart}
        />
      )}
      <div className="w-full max-w-5xl mx-auto">
        {renderContent()}
      </div>
    </main>
  );
}
