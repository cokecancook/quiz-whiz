# QuizWhiz

This is a quiz application built with Next.js and Firebase Studio. It allows users to upload their own JSON-based quizzes, practice in different modes, and track their performance over time.

<img width="1359" height="851" alt="screenshot" src="https://github.com/user-attachments/assets/1b2bde37-ee47-4cda-8a9c-36968b70744c" />

## App Functionalities

QuizWhiz offers the following core features:

- **Quiz Upload**: Users can upload their own quizzes in JSON format for personalized practice.
- **Practice Modes**: Choose from different quiz modes (timed, untimed, review) to suit your learning style.
- **Performance Tracking**: Track your scores and progress over time to monitor improvement.
- **Quiz Review**: Review completed quizzes, see correct answers, and learn from mistakes.
- **Statistics Dashboard**: Visualize your quiz history and performance stats.
- **Pause & Resume**: Pause quizzes and resume later without losing progress.
- **Question List & Navigation**: Easily navigate between questions during a quiz session.
- **Theme Switcher**: Toggle between light and dark modes for comfortable viewing.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have [Node.js](https://nodejs.org/) (version 18 or later) and [npm](https://www.npmjs.com/) installed on your system.

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies**:
    This will install all the required packages defined in `package.json`.
    ```bash
    npm install
    ```

### Running the Development Server

To start the application in development mode, run the following command. This will start the Next.js development server, typically on port 9002.

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result. The page will auto-update as you edit the code.

### Building for Production

To create a production-ready build of the application, run:

```bash
npm run build
```

This command bundles the application into static files for production deployment. The optimized files will be located in the `.next` directory.

### Running in Production Mode

After building the project, you can start the application in production mode with:

```bash
npm start
```

This starts a local server to serve the production build. It's a great way to test the production version of your app locally before deploying.
