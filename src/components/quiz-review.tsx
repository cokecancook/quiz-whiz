
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import type { Question } from "@/types/quiz";
import ScoreBanner from "./score-banner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle, Lightbulb, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog";

interface QuizReviewProps {
  questions: Question[];
  userAnswers: (string | null)[];
  onClose: () => void;
}

export default function QuizReview({ questions, userAnswers, onClose }: QuizReviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showIncorrectOnly, setShowIncorrectOnly] = useState(false);
  const reviewContainerRef = useRef<HTMLDivElement>(null);

  const filteredQuestions = useMemo(() => {
    if (!showIncorrectOnly) {
      return questions.map((q, i) => ({ ...q, originalIndex: i }));
    }
    return questions
      .map((q, i) => ({ ...q, originalIndex: i }))
      .filter((q) => userAnswers[q.originalIndex] !== q.correct_answer);
  }, [questions, userAnswers, showIncorrectOnly]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [showIncorrectOnly]);
  
  useEffect(() => {
    if (reviewContainerRef.current) {
        window.scrollTo(0, 0);
    }
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'BUTTON'].includes((event.target as HTMLElement).tagName)) {
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        if (currentIndex > 0) {
          setCurrentIndex(i => i - 1);
        }
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (currentIndex < filteredQuestions.length - 1) {
          setCurrentIndex(i => i + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, filteredQuestions.length]);

  const score = userAnswers.reduce((acc, answer, index) => {
    return acc + (answer === questions[index].correct_answer ? 1 : 0);
  }, 0);

  const getOptionClassName = (option: string, question: Question, userAnswer: string | null) => {
    if (option === question.correct_answer) return "border-green-500 bg-green-50 dark:bg-green-900/30";
    if (option === userAnswer) return "border-red-500 bg-red-50 dark:bg-red-900/30";
    return "";
  };

  if (filteredQuestions.length === 0 && showIncorrectOnly) {
    return (
        <div className="w-full animate-fade-in" ref={reviewContainerRef}>
             <div className="sticky top-2 z-50 flex justify-center mb-4">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" className="shadow-md rounded-full">
                            <X className="h-4 w-4 mr-2" />
                            Close Review
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-3xl shadow-sm">
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will end your review session.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={onClose}>End Review</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
            <Card className="mb-4 rounded-3xl shadow-sm">
                <CardHeader className="flex-row items-center justify-between p-8">
                    <div className="space-y-1">
                        <CardTitle className="font-headline">Reviewing Test</CardTitle>
                        <div className="flex items-center space-x-2 pt-2">
                            <Switch id="show-incorrect" checked={showIncorrectOnly} onCheckedChange={setShowIncorrectOnly} />
                            <Label htmlFor="show-incorrect">Show Incorrect Only</Label>
                        </div>
                    </div>
                    <ScoreBanner score={score} total={questions.length} />
                </CardHeader>
            </Card>
            <Card className="rounded-3xl shadow-sm">
                <CardContent className="pt-6 text-center p-8">
                    <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                    <h3 className="text-xl font-semibold">Congratulations!</h3>
                    <p className="text-muted-foreground">You answered all questions correctly.</p>
                </CardContent>
            </Card>
        </div>
    );
  }

  if (filteredQuestions.length === 0) {
    return (
        <div className="w-full animate-fade-in" ref={reviewContainerRef}>
            <Card className="rounded-3xl shadow-sm">
                <CardContent className="pt-6 text-center p-8">
                    <h3 className="text-xl font-semibold">No questions to review.</h3>
                    <Button onClick={onClose} className="mt-6">Back</Button>
                </CardContent>
            </Card>
        </div>
    )
  }

  const currentQuestionData = filteredQuestions[currentIndex];
  const originalIndex = currentQuestionData.originalIndex;
  const userAnswer = userAnswers[originalIndex];
  const isCorrect = userAnswer === currentQuestionData.correct_answer;
  
  return (
    <div className="w-full animate-fade-in" ref={reviewContainerRef}>
        <div className="sticky top-2 z-50 flex justify-center mb-4">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" className="shadow-md rounded-full">
                        <X className="h-4 w-4 mr-2" />
                        Close Review
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-3xl shadow-sm">
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will end your review session.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onClose}>End Review</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
        <Card className="mb-4 rounded-3xl shadow-sm">
            <CardHeader className="flex-row items-center justify-between p-8">
                <div className="space-y-1">
                    <CardTitle className="font-headline">Reviewing Test</CardTitle>
                    <div className="flex items-center space-x-2 pt-2">
                        <Switch id="show-incorrect" checked={showIncorrectOnly} onCheckedChange={setShowIncorrectOnly} />
                        <Label htmlFor="show-incorrect">Show Incorrect Only</Label>
                    </div>
                </div>
                <ScoreBanner score={score} total={questions.length} />
            </CardHeader>
        </Card>
        <Card className="rounded-3xl shadow-sm">
            <CardHeader className="p-8">
                <div className="flex items-center justify-between">
                    <span className="font-headline text-lg">{currentIndex + 1} of {filteredQuestions.length}</span>
                    {isCorrect ? 
                        <span className="flex items-center gap-1 text-sm text-green-500 font-semibold"><CheckCircle className="h-4 w-4"/> Correct</span> : 
                        <span className="flex items-center gap-1 text-sm text-red-500 font-semibold"><XCircle className="h-4 w-4"/> Incorrect</span>
                    }
                </div>
            </CardHeader>
            <CardContent className="space-y-4 px-8">
                <div className="text-base md:text-lg p-4 bg-muted rounded-md" dangerouslySetInnerHTML={{ __html: currentQuestionData.question }} />

                <div className="space-y-2">
                    {currentQuestionData.options.map((option, index) => (
                        <div key={index} className={cn("flex items-center gap-4 rounded-lg border p-3", getOptionClassName(option, currentQuestionData, userAnswer))}>
                           {option === currentQuestionData.correct_answer && <CheckCircle className="h-5 w-5 text-green-500" />}
                           {option !== currentQuestionData.correct_answer && option === userAnswer && <XCircle className="h-5 w-5 text-red-500" />}
                           {option !== currentQuestionData.correct_answer && option !== userAnswer && <div className="w-5 h-5" />}
                           <div className="flex-1" dangerouslySetInnerHTML={{ __html: option }} />
                        </div>
                    ))}
                </div>
                
                <Card className="bg-muted/50 rounded-2xl">
                    <CardHeader className="flex-row items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-yellow-500"/>
                        <CardTitle className="text-lg">Explanation</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: currentQuestionData.explanation }}/>
                    </CardContent>
                </Card>

            </CardContent>
            <CardFooter className="flex justify-between p-8">
                <Button variant="outline" onClick={() => setCurrentIndex(i => i - 1)} disabled={currentIndex === 0}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                {currentIndex < filteredQuestions.length - 1 && (
                    <Button onClick={() => setCurrentIndex(i => i + 1)}>
                        Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </CardFooter>
        </Card>
    </div>
  );
}
