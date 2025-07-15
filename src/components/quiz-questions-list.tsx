
"use client";

import { useState, useMemo } from "react";
import type { StoredQuiz } from "@/types/quiz";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface QuizQuestionsListProps {
  quiz: StoredQuiz;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QuizQuestionsList({ quiz, open, onOpenChange }: QuizQuestionsListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredQuestions = useMemo(() => {
    if (!searchTerm) {
      return quiz.questions;
    }
    return quiz.questions.filter(q => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const inQuestion = q.question.toLowerCase().includes(lowerCaseSearchTerm);
      const inOptions = q.options.some(opt => opt.toLowerCase().includes(lowerCaseSearchTerm));
      const inExplanation = q.explanation.toLowerCase().includes(lowerCaseSearchTerm);
      return inQuestion || inOptions || inExplanation;
    });
  }, [searchTerm, quiz.questions]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] flex flex-col rounded-t-3xl shadow-sm">
        <SheetHeader className="p-8 pb-4">
          <SheetTitle>Questions in: {quiz.name}</SheetTitle>
          <SheetDescription>
            Showing {filteredQuestions.length} of {quiz.questions.length} questions from this quiz.
          </SheetDescription>
        </SheetHeader>
        <div className="px-8 py-2">
            <Input
                placeholder="Search questions or answers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
            />
        </div>
        <ScrollArea className="flex-1 mt-2 px-8">
            <Accordion type="multiple" className="w-full">
                {filteredQuestions.map((q, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                         <div className="p-4 border-b">
                            <div className="font-semibold mb-2" dangerouslySetInnerHTML={{ __html: q.question }} />
                            <ul className="space-y-2 text-sm">
                                {q.options.map((opt, i) => (
                                    <li key={i} className={`ml-4 list-disc ${opt === q.correct_answer ? 'text-green-600 font-bold' : ''}`} dangerouslySetInnerHTML={{ __html: opt }} />
                                ))}
                            </ul>
                        </div>
                        <AccordionTrigger className="px-4 py-2 text-sm text-muted-foreground hover:no-underline">
                            Show Explanation
                        </AccordionTrigger>
                        <AccordionContent className="px-4">
                            <div className="pt-2 text-sm text-muted-foreground prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: q.explanation }}/>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
             {filteredQuestions.length === 0 && (
                <div className="text-center text-muted-foreground p-8">
                    <p>No questions match your search.</p>
                </div>
            )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
