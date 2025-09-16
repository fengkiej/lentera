// Types for learning components

export interface QuestionOption {
  id: string;
  text: string;
  correct: boolean;
}

export interface Question {
  id: string;
  type: "multiple_choice" | "fill_blank" | "true_false";
  question: string;
  options: QuestionOption[];
  explanation: string;
}

export interface PracticeSession {
  questions: Question[];
  currentQuestion: number;
  score: number;
  answers: Record<string, string>;
  startedAt: Date;
  completedAt?: Date;
}

export interface LearningProgress {
  lessonId: number;
  currentStep: "content" | "examples" | "practice";
  practiceScore?: number;
  isCompleted: boolean;
  completedAt?: Date;
}
