
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
  onReview: () => void;
  mode: 'practice' | 'test' | 'study';
}

export default function QuizResults({ score, totalQuestions, onRestart, onReview, mode }: QuizResultsProps) {
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  const getPerformanceFeedback = () => {
    if (percentage >= 90) return { message: "Excellent! Outstanding performance! 🎉", color: "text-green-500" };
    if (percentage >= 80) return { message: "Great job! Very good score! 🌟", color: "text-green-500" };
    if (percentage >= 70) return { message: "Good work! Keep it up! 👍", color: "text-blue-500" };
    if (percentage >= 60) return { message: "Almost! Room for improvement. 💪", color: "text-yellow-500" };
    return { message: "Keep practicing! You can do better! 📚", color: "text-red-500" };
  };

  const performance = getPerformanceFeedback();

  return (
    <Card className="w-full max-w-2xl mx-auto animate-fade-in rounded-3xl shadow-sm">
      <CardHeader className="text-center p-8">
        <CardTitle className="text-3xl font-headline">Quiz Completed!</CardTitle>
        <CardDescription className={`text-xl font-semibold ${performance.color}`}>{performance.message}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-8">
        <div className="text-center">
          <p className="text-lg">Your Score</p>
          <p className="text-5xl font-bold">{score} / {totalQuestions}</p>
          <div className="w-full max-w-sm mx-auto mt-4">
            <Progress value={percentage} className="h-4" />
            <p className="text-2xl font-semibold mt-2">{percentage}%</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center gap-4 p-8">
        <Button onClick={onRestart}>Try Again</Button>
        <Button variant="outline" onClick={onReview} disabled={totalQuestions === 0}>Review Answers</Button>
      </CardFooter>
    </Card>
  );
}
