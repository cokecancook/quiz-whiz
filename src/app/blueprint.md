# **App Name**: QuizWhiz

## Core Features:

- **Custom Quiz Upload**: Allows users to upload their own quizzes as JSON files, which are then stored locally in the browser's local storage. This removes the need for a database.
- **Multiple Quiz Modes**:
    - **Practice Mode**: Shows correct answers and explanations immediately after each question.
    - **Test Mode**: Presents a timed assessment with a full results page at the end.
    - **Study Mode**: Helps users focus on questions based on their past performance.
- **Interactive Quizzes**: Displays multiple-choice questions and renders any HTML content stored within the JSON for questions, answers, or explanations.
- **Scoring and Progress Tracking**:
    - A dynamic scoring system that tracks and displays the current score.
    - Local storage saves quiz progress, user's answers, and a history of quiz attempts for performance tracking.
    - A dedicated stats view with charts to visualize performance over time.
- **Question Management**: Users can view all questions in a quiz and search through them.
- **Pause and Resume**: Quizzes can be paused and resumed, ensuring progress is not lost.

## Style Guidelines:

- **Primary Color**: `#3282fa` (HSL: 210, 75%, 50%) – Evokes a sense of intelligence and focus.
- **Background Color**: `#F0F4FF` (HSL: 210, 20%, 95%) – A light, easy-on-the-eyes background.
- **Accent Color**: `#2ab8b8` (HSL: 180, 60%, 40%) – A vibrant hue to highlight important elements like buttons.
- **Fonts**:
    - **Headlines**: 'Space Grotesk' for a modern, tech-inspired feel.
    - **Body**: 'Inter' for clean and readable text.
- **Icons**: Simple, geometric icons from Lucide React are used for clarity and consistency.
- **Layout**: A card-based layout organizes quizzes, questions, and results into a structured and intuitive user experience.
- **Animations**: Subtle transitions and animations for score updates, question reveals, and answer feedback enhance interactivity.
- **UI**: The interface is designed with soft shadows and rounded corners for a modern, polished aesthetic.
