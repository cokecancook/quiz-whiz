
'use client';

import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizTimerProps {
  timeRemaining: number;
}

export default function QuizTimer({ timeRemaining }: QuizTimerProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className="fixed top-2 left-2 z-50">
        <div className={cn(
            "flex items-center gap-2 font-semibold p-2 rounded-md bg-background/80 backdrop-blur-sm border shadow-md",
             timeRemaining < 600 ? "text-red-500" : ""
        )}>
            <Clock className="h-5 w-5"/>
            <span>{formatTime(timeRemaining)}</span>
        </div>
    </div>
  );
}
