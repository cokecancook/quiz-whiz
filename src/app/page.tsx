
"use client";

import { useState, useEffect, useCallback } from "react";
import type { StoredQuiz, Question, QuizMode, QuizAttempt } from "@/types/quiz";
import { shuffleArray } from "@/lib/utils";
import QuizUploader from "@/components/quiz-uploader";
import QuizQuestion from "@/components/quiz-question";
import QuizResults from "@/components/quiz-results";
import QuizReview from "@/components/quiz-review";
import QuizTimer from "@/components/quiz-timer";
import { Button } from "@/components/ui/button";
import QuizPauseControl from "@/components/quiz-pause-control";
import { loadQuizzes, saveQuizzes } from "@/lib/storage";

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

  useEffect(() => {
    setQuizzes(loadQuizzes());
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


  const handleSaveQuizzes = (updatedQuizzes: StoredQuiz[]) => {
    saveQuizzes(updatedQuizzes);
    setQuizzes(updatedQuizzes);
  };

  const handleStartQuiz = (quiz: StoredQuiz, mode: QuizMode, length: number) => {
    let questionsForQuiz: Question[] = [];

    if (mode.type === 'study') {
      questionsForQuiz = quiz.questions.slice(0, length);
    } else {
      const shuffled = shuffleArray(quiz.questions);
      questionsForQuiz = shuffled.slice(0, length);
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

  const updateQuestionOrder = (quizName: string, questionText: string, isCorrect: boolean, mode: 'practice' | 'test' | 'study') => {
    setQuizzes(prevQuizzes => {
      const updatedQuizzes = [...prevQuizzes];
      const quizIndex = updatedQuizzes.findIndex(q => q.name === quizName);
      if (quizIndex === -1) return prevQuizzes;
    
      const quiz = { ...updatedQuizzes[quizIndex] };
      quiz.questions = [...quiz.questions];
      const questionIndex = quiz.questions.findIndex(q => q.question === questionText);
      if (questionIndex === -1) return prevQuizzes;
    
      const [questionToMove] = quiz.questions.splice(questionIndex, 1);
    
      if (isCorrect) {
        // Move to the end
        quiz.questions.push(questionToMove);
      } else {
        if (mode === 'study') {
          // Move 10 positions down, or to the end if not possible
          const newPosition = Math.min(questionIndex + 10, quiz.questions.length);
          quiz.questions.splice(newPosition, 0, questionToMove);
        } else { // practice or test
          // Move to the top
          quiz.questions.unshift(questionToMove);
        }
      }
      updatedQuizzes[quizIndex] = quiz;
      handleSaveQuizzes(updatedQuizzes);
      return updatedQuizzes;
    });
  };
  
  const handleFinishQuiz = useCallback(() => {
    if (!quizConfig) return;
    
    let finalScore = 0;
    let correctAnswersCount = 0;

    userAnswers.forEach((answer, index) => {
      const question = activeQuestions[index];
      const isCorrect = answer === question.correct_answer;
      if (isCorrect) {
        correctAnswersCount++;
      }
      
      // For test mode, update all question orders at the end
      if (quizConfig.mode === 'test') {
        updateQuestionOrder(quizConfig.name, question.question, isCorrect, 'test');
      }
    });

    if (quizConfig.mode === 'test') {
      finalScore = correctAnswersCount;
    } else {
      finalScore = score;
    }
    
    setScore(finalScore);
    setQuizStatus("finished");
    setTimeRemaining(null);

    // Save quiz attempt to history for 'test' mode
    if (quizConfig.mode === 'test') {
        const currentQuizzes = loadQuizzes();
        const quizIndex = currentQuizzes.findIndex(q => q.id === quizConfig.id);
        if (quizIndex !== -1) {
          const newAttempt: QuizAttempt = {
            date: new Date().toISOString(),
            questionsAnswered: activeQuestions.length,
            correctAnswers: finalScore,
          };
          if (!currentQuizzes[quizIndex].history) {
            currentQuizzes[quizIndex].history = [];
          }
          currentQuizzes[quizIndex].history!.push(newAttempt);
          handleSaveQuizzes(currentQuizzes);
        }
    }
  }, [userAnswers, activeQuestions, quizConfig, score]);

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

    if (quizConfig?.mode === 'test') {
      const currentQuestion = activeQuestions[currentQuestionIndex];
      const isCorrect = answer === currentQuestion.correct_answer;
      if (isCorrect) {
        setScore(s => s + 1);
      } else {
        // If the user changes their mind to an incorrect answer, we need to handle that
        // This logic gets complex if we allow changing answers and track score live
        // A simple way is to recalculate score on every answer change in test mode
        let currentScore = 0;
        newAnswers.forEach((ans, index) => {
            if(ans && ans === activeQuestions[index].correct_answer) {
                currentScore++;
            }
        });
        setScore(currentScore);
      }
    }
  };

  const handleSubmitPractice = () => {
    if (!selectedAnswer || !quizConfig) return;
    const currentQuestion = activeQuestions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    
    if (isCorrect) {
      setScore(s => s + 1);
    }

    if (quizConfig.mode === 'practice' || quizConfig.mode === 'study') {
      updateQuestionOrder(quizConfig.name, currentQuestion.question, isCorrect, quizConfig.mode);

      // Save history for each answered question in practice/study mode
      const currentQuizzes = loadQuizzes();
      const quizIndex = currentQuizzes.findIndex(q => q.id === quizConfig.id);
      if (quizIndex !== -1) {
        const quizToUpdate = { ...currentQuizzes[quizIndex] };
        const newAttempt: QuizAttempt = {
          date: new Date().toISOString(),
          questionsAnswered: 1,
          correctAnswers: isCorrect ? 1 : 0,
        };
        if (!quizToUpdate.history) {
          quizToUpdate.history = [];
        }
        quizToUpdate.history.push(newAttempt);
        currentQuizzes[quizIndex] = quizToUpdate;
        handleSaveQuizzes(currentQuizzes);
      }
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
            <div className="w-full max-w-4xl mx-auto mt-8 p-4 sm:p-6 md:p-8 bg-card rounded-3xl shadow-lg">
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
          <div className="text-center p-8 bg-card rounded-3xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4">No Questions Available!</h2>
            <p className="text-muted-foreground">There are no questions in this quiz.</p>
            <Button onClick={handleRestart} className="mt-6">Back to Home</Button>
          </div>
        );
      case "finished":
        if (quizConfig) {
          return (
            <div className="w-full max-w-4xl mx-auto mt-8 p-4 sm:p-6 md:p-8 bg-card rounded-3xl shadow-lg">
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
          <div className="w-full max-w-4xl mx-auto mt-8 p-4 sm:p-6 md:p-8 bg-card rounded-3xl shadow-lg">
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
            onSaveQuizzes={handleSaveQuizzes}
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

    