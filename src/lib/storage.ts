
import type { StoredQuiz } from "@/types/quiz";

const MANIFEST_KEY = "quiz_manifest";
const QUIZ_PREFIX = "quiz_";

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

// --- Internal Helper Functions ---

function getManifest(): string[] {
  const manifestJson = localStorage.getItem(MANIFEST_KEY);
  return manifestJson ? JSON.parse(manifestJson) : [];
}

function getQuiz(id: string): StoredQuiz | null {
  const quizJson = localStorage.getItem(`${QUIZ_PREFIX}${id}`);
  return quizJson ? JSON.parse(quizJson) : null;
}

    