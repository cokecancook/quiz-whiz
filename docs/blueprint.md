# **App Name**: QuizWhiz

## Core Features:

- Custom Quiz Upload: Allow users to upload their own quizzes as JSON files, which are stored locally. This removes the need for a database.
- Multiple Quiz Modes: Two modes are provided: Practice Mode shows correct answers immediately, and Test Mode presents a timed assessment.
- Interactive Quizzes: Display the multiple choice questions and render any HTML stored inside the JSON, e.g. in the question text, answers or explanation.
- AI-Powered Feedback: Employ a generative AI tool to create personalized feedback based on the user's performance in each quiz mode.
- Quiz Difficulty Badges: Provide badges with varying difficulty labels (easy, medium, hard).
- Scoring and Progress Tracking: A scoring system that tracks and displays the current score and results. Local storage saves quiz progress, including user's test mode answers.

## Style Guidelines:

- Primary color: HSL(210, 75%, 50%) converted to RGB Hex: #3282fa – chosen to evoke a sense of intelligence and focus.
- Background color: HSL(210, 20%, 95%) converted to RGB Hex: #F0F4FF – a light background that is easy on the eyes. Optional dark mode.
- Accent color: HSL(180, 60%, 40%) converted to RGB Hex: #2ab8b8 – a vibrant, cool hue to highlight important elements such as buttons and active states.
- Headline font: 'Space Grotesk' sans-serif for headlines, providing a modern, computerized aesthetic. Body font: 'Inter' sans-serif, a clean and neutral font for readability.
- Use simple, geometric icons from Lucide React to represent different quiz modes, file upload options, and settings.
- Employ a card-based layout to encapsulate individual quizzes, questions, and results, providing a structured user experience.
- Subtle transitions and animations for feedback elements such as score updates, question reveals, and correct/incorrect answer highlighting.