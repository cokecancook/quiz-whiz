
import type { StoredQuiz, QuizProgress } from "@/types/quiz";

const MANIFEST_KEY = "quiz_manifest";
const QUIZ_PREFIX = "quiz_";
const PROGRESS_PREFIX = "progress_";

// --- Public API ---

/**
 * Loads all quizzes from localStorage.
 */
export function loadQuizzes(): StoredQuiz[] {
  try {
    const manifest = getManifest();
    return manifest
      .map(id => getQuiz(id))
      .filter((q): q is StoredQuiz => q !== null)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error("Failed to load quizzes from localStorage", error);
    return [];
  }
}

/**
 * Saves the entire list of quizzes to localStorage, overwriting old data.
 * This is useful for reordering or batch updates.
 */
export function saveQuizzes(quizzes: StoredQuiz[]): void {
  try {
    const newManifest = quizzes.map(q => q.id);
    quizzes.forEach(quiz => {
        localStorage.setItem(`${QUIZ_PREFIX}${quiz.id}`, JSON.stringify(quiz));
    });
    localStorage.setItem(MANIFEST_KEY, JSON.stringify(newManifest));
  } catch (error) {
    console.error("Failed to save quizzes to localStorage", error);
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      alert("Storage limit exceeded! Could not save quiz. Please free up space by deleting other quizzes.");
    }
  }
}

/**
 * Deletes a single quiz by its ID.
 */
export function deleteQuiz(id: string): void {
    try {
        const manifest = getManifest();
        const newManifest = manifest.filter(quizId => quizId !== id);
        localStorage.setItem(MANIFEST_KEY, JSON.stringify(newManifest));
        localStorage.removeItem(`${QUIZ_PREFIX}${id}`);
    } catch (error) {
        console.error(`Failed to delete quiz ${id}`, error);
    }
}

/**
 * Loads the progress for a specific quiz.
 */
export function loadQuizProgress(quizId: string): QuizProgress {
    try {
        const progressJson = localStorage.getItem(`${PROGRESS_PREFIX}${quizId}`);
        return progressJson ? JSON.parse(progressJson) : { history: [], questionStats: {} };
    } catch (error) {
        console.error(`Failed to load progress for quiz ${quizId}`, error);
        return { history: [], questionStats: {} };
    }
}

/**
 * Saves the progress for a specific quiz.
 */
export function saveQuizProgress(quizId: string, progress: QuizProgress): void {
    try {
        localStorage.setItem(`${PROGRESS_PREFIX}${quizId}`, JSON.stringify(progress));
    } catch (error) {
        console.error(`Failed to save progress for quiz ${quizId}`, error);
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
            alert("Storage limit exceeded! Could not save quiz progress.");
        }
    }
}

/**
 * Deletes the progress for a specific quiz.
 */
export function deleteQuizProgress(quizId: string): void {
    try {
        localStorage.removeItem(`${PROGRESS_PREFIX}${quizId}`);
    } catch (error) {
        console.error(`Failed to delete progress for quiz ${quizId}`, error);
    }
}


// --- Internal Helper Functions ---

function getManifest(): string[] {
  const manifestJson = localStorage.getItem(MANIFEST_KEY);
  return manifestJson ? JSON.parse(manifestJson) : [];
}

function getQuiz(id: string): StoredQuiz | null {
  const quizJson = localStorage.getItem(`${QUIZ_PREFIX}${id}`);
  return quizJson ? JSON.parse(quizJson) : null;
}
