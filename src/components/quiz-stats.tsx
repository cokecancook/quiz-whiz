
"use client";

import { useState, useMemo } from "react";
import type { QuizProgress } from "@/types/quiz";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis, ComposedChart, Tooltip } from "recharts";
import { subDays, format, startOfDay } from 'date-fns';

type TimeRange = '7days' | '30days' | 'all';

interface QuizStatsProps {
  quizName: string;
  progress: QuizProgress | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QuizStats({ quizName, progress, open, onOpenChange }: QuizStatsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('7days');

  const chartData = useMemo(() => {
    if (!progress || !progress.history || progress.history.length === 0) return [];

    const now = new Date();
    let startDate: Date;

    if (timeRange === '7days') {
      startDate = subDays(now, 6);
    } else if (timeRange === '30days') {
      startDate = subDays(now, 29);
    } else {
      // Find the earliest date in history
      const earliestDate = progress.history.reduce((earliest, attempt) => {
        const attemptDate = new Date(attempt.date);
        return attemptDate < earliest ? attemptDate : earliest;
      }, new Date());
      startDate = earliestDate;
    }

    const startOfDayStartDate = startOfDay(startDate);

    const filteredHistory = progress.history.filter(attempt => new Date(attempt.date) >= startOfDayStartDate);
    
    const aggregatedData: { [key: string]: { questions: number, correct: number, count: number } } = {};

    filteredHistory.forEach(attempt => {
      const day = format(new Date(attempt.date), 'MMM d');
      if (!aggregatedData[day]) {
        aggregatedData[day] = { questions: 0, correct: 0, count: 0 };
      }
      aggregatedData[day].questions += attempt.questionsAnswered;
      aggregatedData[day].correct += attempt.correctAnswers;
      aggregatedData[day].count += 1;
    });

    const finalData = Object.keys(aggregatedData).map(day => ({
      date: day,
      questions: aggregatedData[day].questions,
      percentage: Math.round((aggregatedData[day].correct / aggregatedData[day].questions) * 100),
    })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return finalData;

  }, [progress, timeRange]);

  const chartConfig = {
    questions: {
      label: "Questions",
      color: "hsl(var(--muted-foreground))",
    },
    percentage: {
      label: "Correct %",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] flex flex-col rounded-t-3xl shadow-sm">
        <SheetHeader className="p-8 pb-4">
          <SheetTitle>Statistics for: {quizName}</SheetTitle>
          <SheetDescription>
            View your performance over time.
          </SheetDescription>
        </SheetHeader>
        <div className="flex items-center justify-center gap-2 py-4">
            <Button variant={timeRange === '7days' ? 'default' : 'outline'} onClick={() => setTimeRange('7days')}>Last 7 Days</Button>
            <Button variant={timeRange === '30days' ? 'default' : 'outline'} onClick={() => setTimeRange('30days')}>Last 30 Days</Button>
            <Button variant={timeRange === 'all' ? 'default' : 'outline'} onClick={() => setTimeRange('all')}>All Time</Button>
        </div>
        <div className="flex-1 min-h-0 px-8 pb-8">
          {chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="w-full h-full">
              <ComposedChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                    yAxisId="left"
                    orientation="left"
                    stroke="hsl(var(--muted-foreground))"
                    label={{ value: 'Questions Answered', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="hsl(var(--primary))"
                    domain={[0, 100]}
                    label={{ value: 'Correct %', angle: 90, position: 'insideRight', fill: 'hsl(var(--primary))' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="questions" fill="var(--color-questions)" radius={4} yAxisId="left" />
                <Line type="monotone" dataKey="percentage" stroke="var(--color-percentage)" strokeWidth={2} dot={{ r: 4, fill: "var(--color-percentage)" }} yAxisId="right" />
              </ComposedChart>
            </ChartContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>No quiz history found for this period. Complete some quizzes to see your stats!</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
