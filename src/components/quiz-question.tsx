
'use client';

import { useEffect } from "react";
import type { Question } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import ScoreBanner from "./score-banner";

interface QuizQuestionProps {
  question: Question;
  currentQuestion: number;
  totalQuestions: number;
  score: number;
  selectedAnswer: string | null;
  showExplanation: boolean;
  onAnswerSelect: (answer: string) => void;
  onSubmit: () => void;
  onNext: () => void;
  onPrev: () => void;
  mode: 'practice' | 'test' | 'study';
  onSubmitTest: () => void;
  isPaused: boolean;
}

export default function QuizQuestion({
  question,
  currentQuestion,
  totalQuestions,
  score,
  selectedAnswer,
  showExplanation,
  onAnswerSelect,
  onSubmit,
  onNext,
  onPrev,
  mode,
  onSubmitTest,
  isPaused,
}: QuizQuestionProps) {

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent handling events when an input, textarea, or button is focused or dialog is open
      if (['INPUT', 'TEXTAREA', 'BUTTON'].includes((event.target as HTMLElement).tagName) || isPaused) {
        return;
      }
      
      switch (event.key) {
        case 'ArrowUp':
        case 'ArrowDown':
          event.preventDefault();
          if (showExplanation) return;
          const options = question.options;
          let currentIndex = selectedAnswer ? options.indexOf(selectedAnswer) : -1;
          
          if (event.key === 'ArrowUp') {
            currentIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
          } else {
            currentIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
          }
          onAnswerSelect(options[currentIndex]);
          break;

        case 'Enter':
          event.preventDefault();
          if (mode === 'practice' || mode === 'study') {
            if (showExplanation) {
              onNext();
            } else if (selectedAnswer) {
              onSubmit();
            }
          } else {
             if (currentQuestion === totalQuestions) {
                onSubmitTest();
            } else {
                onNext();
            }
          }
          break;
        
        case 'ArrowLeft':
          event.preventDefault();
          if (currentQuestion > 1) {
            onPrev();
          }
          break;
        
        case 'ArrowRight':
          event.preventDefault();
          if (currentQuestion < totalQuestions) {
            onNext();
          } else if ((mode === 'practice' || mode === 'study') && showExplanation) {
            onNext();
          } else if (mode === 'test') {
            onSubmitTest();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedAnswer, showExplanation, mode, currentQuestion, totalQuestions, onAnswerSelect, onSubmit, onNext, onPrev, onSubmitTest, question.options, isPaused]);

  const getOptionClassName = (option: string) => {
    if (!showExplanation) return "";
    if (option === question.correct_answer) return "bg-green-100 dark:bg-green-900/50 border-green-500";
    if (option === selectedAnswer) return "bg-red-100 dark:bg-red-900/50 border-red-500";
    return "";
  };
  
  const questionsAttempted = mode === 'test' 
    ? currentQuestion -1 
    : currentQuestion - (showExplanation ? 0 : 1);


  return (
    <>
      <Card className="w-full animate-fade-in mt-16 relative mb-32 rounded-3xl shadow-sm">
        <CardHeader className="p-8">
           <div className="flex justify-between items-center relative">
                <div className="font-headline text-lg w-1/3">{currentQuestion} of {totalQuestions}</div>
                <div className="w-1/3 flex justify-end">
                    {mode !== 'test' && <ScoreBanner score={score} total={questionsAttempted} />}
                </div>
            </div>
          <Progress value={(currentQuestion / totalQuestions) * 100} className="mt-4" />
        </CardHeader>
        <CardContent className="space-y-6 px-8 pb-8">
          <div className="text-base md:text-lg" dangerouslySetInnerHTML={{ __html: question.question }} />
          
          <RadioGroup value={selectedAnswer ?? ""} onValueChange={onAnswerSelect} disabled={showExplanation}>
            {question.options.map((option, index) => (
              <Label key={index} className={cn("flex items-start gap-4 rounded-lg border p-4 transition-colors cursor-pointer hover:bg-muted/50", getOptionClassName(option))}>
                <RadioGroupItem value={option} id={`option-${index}`} className="mt-1"/>
                <div className="flex-1" dangerouslySetInnerHTML={{ __html: option }} />
                {showExplanation && (
                    option === question.correct_answer ? <CheckCircle className="h-6 w-6 text-green-500"/> :
                    option === selectedAnswer ? <XCircle className="h-6 w-6 text-red-500"/> : null
                )}
              </Label>
            ))}
          </RadioGroup>
          
          {showExplanation && (
            <Card className="bg-muted/50 animate-fade-in rounded-2xl">
              <CardHeader>
                <div className="font-headline text-lg">Explanation</div>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: question.explanation }}/>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <div className="fixed bottom-0 left-0 w-full p-4 bg-background/80 backdrop-blur-sm border-t z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Button variant="outline" onClick={onPrev} disabled={currentQuestion === 1}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
          
          {(mode === 'practice' || mode === 'study') && !showExplanation && (
            <Button onClick={onSubmit} disabled={!selectedAnswer}>
                Submit Answer
            </Button>
          )}

          {(mode === 'practice' || mode === 'study') && showExplanation && (
            <Button onClick={onNext}>
              {currentQuestion === totalQuestions ? 'Finish' : 'Next'} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}

          {mode === 'test' && (
            currentQuestion === totalQuestions ? (
                <Button onClick={onSubmitTest} className="bg-green-600 hover:bg-green-700">Submit Test</Button>
            ) : (
                <Button onClick={onNext}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            )
          )}
        </div>
      </div>
    </>
  );
}
