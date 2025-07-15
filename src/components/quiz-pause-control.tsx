
'use client';

import { Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface QuizPauseControlProps {
  isPaused: boolean;
  onPause: (pausedByButton: boolean) => void;
  onResume: (pausedByButton: boolean) => void;
  onCloseQuiz: () => void;
}

export default function QuizPauseControl({ isPaused, onPause, onResume, onCloseQuiz }: QuizPauseControlProps) {
  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50">
        <AlertDialog open={isPaused} onOpenChange={(open) => {
            if (open) {
                onPause(true);
            } else {
                onResume(true);
            }
        }}>
            <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon" className="shadow-md">
                    <Pause className="h-5 w-5" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-3xl shadow-sm">
                <AlertDialogHeader>
                <AlertDialogTitle>Quiz Paused</AlertDialogTitle>
                <AlertDialogDescription>
                    Your progress is saved. You can resume when you're ready or exit the quiz.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={onCloseQuiz}>End Quiz</AlertDialogAction>
                    <AlertDialogCancel>Resume</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
