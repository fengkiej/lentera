// Core types for Lentera learning platform

export interface Subject {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  topicsCount?: number;
  completedTopics?: number;
  progressPercentage?: number;
}

export interface Topic {
  id: number;
  subjectId: number;
  name: string;
  description: string;
  orderIndex: number;
  estimatedDuration: number;
  difficultyLevel: "beginner" | "intermediate" | "advanced";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lessonsCount?: number;
  completedLessons?: number;
  progressPercentage?: number;
}

export interface Lesson {
  id: number;
  topicId: number;
  title: string;
  content: string;
  summary: string;
  orderIndex: number;
  estimatedDuration: number;
  difficultyLevel: "beginner" | "intermediate" | "advanced";
  difficultySubLevel?: string;
  learningObjectives?: string[];
  prerequisites?: string[];
  keyConcepts?: string[];
  practicalApplications?: string[];
  mediaContent?: {
    type: string;
    url: string;
    description?: string;
  } | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Additional fields from API response
  topicName?: string;
  subjectId?: number;
  subjectName?: string;
  subjectColor?: string;
  // Progress information
  progress?: {
    id: number;
    userId: string;
    lessonId: number;
    progressPercentage: number;
    isCompleted: boolean;
    completedAt: string | null;
    lastAccessed: string;
    timeSpent: number;
  } | null;
  // Legacy progress fields (for backward compatibility)
  progressPercentage?: number;
  isCompleted?: boolean;
  lastAccessed?: string;
}

export interface LessonExample {
  id: number;
  lessonId: number;
  title: string;
  content: string;
  explanation: string;
  orderIndex: number;
  exampleType: "text" | "image" | "video" | "audio";
  mediaUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PracticeQuestion {
  id: number;
  lessonId: number;
  type: "multiple_choice" | "fill_blank" | "true_false";
  question: string;
  explanation: string;
  difficultyLevel: "beginner" | "intermediate" | "advanced";
  points: number;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  options: QuestionOption[];
}

export interface QuestionOption {
  id: number;
  questionId: number;
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

// Extended types with relationships
export interface SubjectWithTopics extends Subject {
  topics: Topic[];
}

export interface TopicWithLessons extends Topic {
  lessons: Lesson[];
}

export interface LessonWithDetails extends Lesson {
  examples: LessonExample[];
  practiceQuestions: PracticeQuestion[];
}

// Learning flow types
export interface LearningStep {
  id: string;
  title: string;
  type: "content" | "examples" | "practice";
  isCompleted: boolean;
  isUnlocked: boolean;
}

export interface LearningSession {
  lessonId: number;
  currentStep: number;
  steps: LearningStep[];
  startedAt: string;
  completedAt?: string;
  score?: number;
}

// Progress tracking types
export interface UserProgress {
  id: number;
  userId: string;
  lessonId: number;
  progressPercentage: number;
  completedAt?: string;
  lastAccessed: string;
  timeSpent: number;
  createdAt: string;
  updatedAt: string;
}

export interface LearningStats {
  totalLessonsCompleted: number;
  totalTimeSpent: number;
  averageScore: number;
  currentStreak: number;
  longestStreak: number;
  subjectsProgress: Record<
    number,
    {
      subjectId: number;
      subjectName: string;
      completedLessons: number;
      totalLessons: number;
      progressPercentage: number;
    }
  >;
}

// Difficulty levels
export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

// Question types
export type QuestionType = "multiple_choice" | "fill_blank" | "true_false";

// Example types
export type ExampleType = "text" | "image" | "video" | "audio";
