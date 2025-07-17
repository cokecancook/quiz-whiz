
"use client";

import { useState, useRef, useEffect } from "react";
import type { StoredQuiz, QuizMode, QuizData } from "@/types/quiz";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from "@/components/ui/sheet";
import { BookOpen, BrainCircuit, Check, GraduationCap, LineChart, List, Trash2, Upload, Book } from "lucide-react";
import { cn } from "@/lib/utils";
import QuizStats from "./quiz-stats";
import QuizQuestionsList from "./quiz-questions-list";
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


interface QuizUploaderProps {
  storedQuizzes: StoredQuiz[];
  onSaveQuizzes: (quizzes: StoredQuiz[]) => void;
  onStartQuiz: (quiz: StoredQuiz, mode: QuizMode, length: number) => void;
}

const quizModes: QuizMode[] = [
  { name: 'Practice', description: 'Immediate feedback after each question.', type: 'practice', icon: BookOpen },
  { name: 'Test', description: 'Timed assessment with results at the end.', type: 'test', icon: BrainCircuit },
  { name: 'Study', description: 'Focus on questions based on your performance.', type: 'study', icon: GraduationCap }
];
const quizLengths = [
    { name: 'Quick', value: 10 },
    { name: 'Medium', value: 25 },
    { name: 'Full', value: 50 }
];

export default function QuizUploader({ storedQuizzes, onSaveQuizzes, onStartQuiz }: QuizUploaderProps) {
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [quizForStats, setQuizForStats] = useState<StoredQuiz | null>(null);
  const [quizForQuestions, setQuizForQuestions] = useState<StoredQuiz | null>(null);
  const [selectedModeType, setSelectedModeType] = useState<"practice" | "test" | "study">("practice");
  const [selectedLength, setSelectedLength] = useState<number>(10);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedQuizId) {
        const selectedQuiz = storedQuizzes.find(q => q.id === selectedQuizId);
        if (selectedQuiz) {
             const maxQuestions = selectedQuiz.questions.length;
             const validLengths = quizLengths.filter(l => maxQuestions >= l.value);
             if (maxQuestions < selectedLength) {
                 setSelectedLength(validLengths.length > 0 ? validLengths[0].value : Math.min(10, maxQuestions));
             }
             setIsSheetOpen(true);
        }
    } else {
        setIsSheetOpen(false);
    }
  }, [selectedQuizId, storedQuizzes, selectedLength]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/json") {
      setError("Please upload a valid JSON file.");
      toast({ variant: "destructive", title: "Invalid File Type", description: "Only JSON files are accepted." });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("File content is not readable text.");

        const json: QuizData = JSON.parse(text);
        
        if (!json.questions || !Array.isArray(json.questions)) {
            throw new Error("JSON must have a 'questions' array.");
        }
        
        const newQuiz: StoredQuiz = {
          id: Date.now().toString(),
          name: file.name.replace('.json', ''),
          questions: json.questions,
          date: new Date().toISOString(),
          history: []
        };

        const updatedQuizzes = [...storedQuizzes, newQuiz];
        onSaveQuizzes(updatedQuizzes);
        setError(null);
        toast({ title: "Quiz Uploaded!", description: `"${newQuiz.name}" has been added.` });
      } catch (err: any) {
        setError(`Error parsing JSON: ${err.message}`);
        toast({ variant: "destructive", title: "Upload Failed", description: `Error parsing JSON: ${err.message}` });
      } finally {
        // Reset the file input by changing its key, which forces a re-render.
        // This is a reliable way to ensure the onChange event fires again on mobile.
        setFileInputKey(Date.now());
      }
    };
    reader.readAsText(file);
  };
  
  const handleDeleteQuiz = (idToDelete: string) => {
    const updatedQuizzes = storedQuizzes.filter(q => q.id !== idToDelete);
    onSaveQuizzes(updatedQuizzes);
    if (selectedQuizId === idToDelete) {
      setSelectedQuizId(null);
      setIsSheetOpen(false);
    }
    toast({ title: "Quiz Deleted", description: "The selected quiz has been removed." });
  };
  
  const handleStart = () => {
    const quiz = storedQuizzes.find(q => q.id === selectedQuizId);
    const mode = quizModes.find(m => m.type === selectedModeType);
    if (quiz && mode) {
        const maxQuestions = quiz.questions.length;
        const actualLength = Math.min(selectedLength, maxQuestions);

        if (selectedLength > maxQuestions && maxQuestions > 0) {
            toast({ title: "Note", description: `Quiz has only ${maxQuestions} questions. Starting with ${maxQuestions}.` });
        }
        onStartQuiz(quiz, mode, actualLength);
        setIsSheetOpen(false);
    } else {
        toast({ variant: "destructive", title: "Error", description: "Please select a quiz and a mode." });
    }
  };

  const handleShowStats = (quiz: StoredQuiz) => {
    setQuizForStats(quiz);
  };

  const handleShowQuestions = (quiz: StoredQuiz) => {
    setQuizForQuestions(quiz);
  };

  const selectedQuiz = storedQuizzes.find(q => q.id === selectedQuizId);
  const maxQuestions = selectedQuiz?.questions.length ?? 0;
  
  const formatDate = (dateString: string) => {
    // Check if the dateString is in ISO format (includes 'T' and 'Z')
    const isISO = dateString.includes('T') && dateString.includes('Z');
    let date;
    
    if (isISO) {
        date = new Date(dateString);
    } else {
        // Attempt to parse locale-specific date strings (e.g., "7/16/2024" or "16/7/2024")
        // This is less reliable but provides backward compatibility
        const parts = dateString.split(/[/.-]/);
        if (parts.length === 3) {
            // Assuming MM/DD/YYYY for US-like, but this is ambiguous.
            // Let's try to be smart, but it's not guaranteed.
            const part1 = parseInt(parts[0]);
            const part2 = parseInt(parts[1]);
            const part3 = parseInt(parts[2]);
            if (part2 > 12) { // Likely DD/MM/YYYY
                date = new Date(part3, part1 - 1, part2);
            } else { // Could be MM/DD/YYYY or DD/MM/YYYY where month <= 12
                date = new Date(part3, part1 - 1, part2);
            }
        } else {
             date = new Date(dateString);
        }
    }

    if (isNaN(date.getTime())) {
      // If parsing fails, return original string or a fallback
      return `(${dateString})`;
    }

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `(${day}/${month}/${year})`;
  }

  return (
    <div className="space-y-8 animate-fade-in">
        <header className="text-center px-6 py-4">
            <h1 className="text-5xl font-headline font-bold text-primary">QuizWhiz</h1>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">Upload a JSON file to start your personalized quiz experience.</p>
        </header>

        <Card className="rounded-3xl shadow-sm overflow-hidden">
            <CardHeader className="p-8">
                <CardTitle>Select Quiz</CardTitle>
                <CardDescription>Upload a new quiz or choose from your saved list.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-8 pb-8">
                <div className="flex gap-4">
                    <Button onClick={() => fileInputRef.current?.click()} className="w-full rounded-full">
                        <Upload className="mr-2 h-4 w-4" /> Upload Quiz JSON
                    </Button>
                    <Input type="file" key={fileInputKey} ref={fileInputRef} onChange={handleFileUpload} accept=".json" className="hidden" />
                </div>
                {error && <p className="text-destructive text-sm">{error}</p>}
                <div className="space-y-2 pt-4">
                    <Label>Available Quizzes</Label>
                    {storedQuizzes.length > 0 ? (
                        <div className="border rounded-2xl">
                        {storedQuizzes.map((quiz) => (
                            <div
                                key={quiz.id}
                                onClick={() => setSelectedQuizId(quiz.id)}
                                className={cn(
                                    "p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b last:border-b-0",
                                    selectedQuizId === quiz.id && "bg-muted"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {selectedQuizId === quiz.id ? (
                                            <Check className="h-5 w-5 text-primary flex-shrink-0" />
                                        ) : (
                                            <Book className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                        )}
                                        <div className="ml-1">
                                            <p className="font-medium">{quiz.name}</p>
                                            <p className="text-sm text-muted-foreground">{quiz.questions.length} questions {formatDate(quiz.date)}</p>
                                        </div>
                                    </div>
                                    <div className="hidden sm:flex items-center">
                                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleShowQuestions(quiz); }}>
                                          <List className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                      </Button>
                                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleShowStats(quiz); }}>
                                          <LineChart className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                      </Button>
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              This action cannot be undone. This will permanently delete the quiz "{quiz.name}".
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteQuiz(quiz.id)}>Delete</AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </div>
                                </div>
                                <div className="flex sm:hidden flex-col gap-2 mt-4 w-full">
                                  <Button variant="outline" className="w-full" size="sm" onClick={(e) => { e.stopPropagation(); handleShowQuestions(quiz); }}>
                                      <List className="h-4 w-4 mr-1" /> View Questions
                                  </Button>
                                  <Button variant="outline" className="w-full" size="sm" onClick={(e) => { e.stopPropagation(); handleShowStats(quiz); }}>
                                      <LineChart className="h-4 w-4 mr-1" /> View Stats
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className="w-full" size="sm" onClick={(e) => e.stopPropagation()}>
                                            <Trash2 className="h-4 w-4 mr-1" /> Delete Quiz
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the quiz "{quiz.name}".
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteQuiz(quiz.id)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                            </div>
                        ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">No quizzes uploaded yet.</p>
                    )}
                </div>
            </CardContent>
        </Card>

        {quizForStats && (
            <QuizStats
                quiz={quizForStats}
                open={!!quizForStats}
                onOpenChange={() => setQuizForStats(null)}
            />
        )}

        {quizForQuestions && (
            <QuizQuestionsList
                quiz={quizForQuestions}
                open={!!quizForQuestions}
                onOpenChange={() => setQuizForQuestions(null)}
            />
        )}


        <Sheet open={isSheetOpen} onOpenChange={(open) => {
            if (!open) {
                setSelectedQuizId(null);
            }
        }}>
            <SheetContent side="bottom" className="rounded-t-lg">
                <SheetHeader className="text-left">
                    <SheetTitle>Select Preferences</SheetTitle>
                    <SheetDescription>Select how you want to take the '{selectedQuiz?.name}' quiz.</SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label>Mode</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {quizModes.map(mode => (
                                <div key={mode.type} onClick={() => setSelectedModeType(mode.type)} className={cn("rounded-lg border p-4 cursor-pointer transition-all", selectedModeType === mode.type && "ring-2 ring-primary border-primary")}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <mode.icon className="h-6 w-6 text-primary" />
                                            <h3 className="font-semibold">{mode.name}</h3>
                                        </div>
                                        {selectedModeType === mode.type && <Check className="h-5 w-5 text-primary" />}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">{mode.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Quiz Length</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {quizLengths.map(len => (
                                <Button key={len.value} variant={selectedLength === len.value ? 'default' : 'outline'} onClick={() => setSelectedLength(len.value)} disabled={maxQuestions < len.value}>
                                    {len.name} ({Math.min(len.value, maxQuestions)})
                                </Button>
                            ))}
                        </div>
                        {maxQuestions === 0 && <p className="text-sm text-destructive">This quiz has no questions.</p>}
                    </div>
                </div>
                <SheetFooter>
                    <Button size="lg" onClick={handleStart} disabled={maxQuestions === 0} className="rounded-full">
                        Start Quiz
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    </div>
  );
}
