
export interface Question {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

export interface QuizData {
  questions: Question[];
}

export interface QuizMode {
  name: string;
  description: string;
  type: 'practice' | 'test' | 'study';
  icon: React.ComponentType<{ className?: string }>;
}

export interface QuizAttempt {
  date: string; // ISO string date
  questionsAnswered: number;
  correctAnswers: number;
}

export interface StoredQuiz {
  id: string;
  name: string;
  questions: Question[];
  date: string;
}

export interface QuestionStats {
  correct: number;
  total: number;
}

export interface QuizProgress {
  history: QuizAttempt[];
  questionStats: {
    [questionText: string]: QuestionStats;
  };
}
