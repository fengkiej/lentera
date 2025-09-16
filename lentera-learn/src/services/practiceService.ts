import { useJwtApiClient, ApiResponse } from "./apiClient";

// Types for practice data
export interface PracticeQuestion {
  id: number;
  lessonId: number;
  questionType: "multiple_choice" | "fill_blank" | "true_false" | "pronunciation" | "translation" | "arrange-words";
  difficulty?: "Mudah" | "Sedang" | "Sulit";
  questionText: string;
  arabicText?: string;
  transliteration?: string;
  audioUrl?: string;
  options?: {
    id: number;
    optionText: string;
    isCorrect: boolean;
    questionId: number;
  }[];
  correctAnswer?: string;
  explanation?: string;
  points?: number;
  timeLimit?: number; // in seconds
  // Fields specific to arrange-words questions
  targetWord?: string;
  availableLetters?: string; // JSON string
  scrambledLetters?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PracticeAnswer {
  questionId: string;
  selectedOptionId?: string;
  userInput?: string;
  timeSpent?: number; // in seconds
}

export interface PracticeSession {
  lessonId: string;
  questionType?: "multiple_choice" | "fill_blank" | "true_false" | "pronunciation" | "translation";
  answers: PracticeAnswer[];
}

export interface PracticeResult {
  questionId: string;
  isCorrect: boolean;
  score: number;
  explanation?: string;
  correctAnswer?: string;
  userAnswer?: string;
}

export interface PracticeHistory {
  id: string;
  userId: string;
  lessonId: string;
  questionType: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // in minutes
  completedAt: string;
  lesson?: {
    id: string;
    title: string;
    difficulty: string;
    rootWord: string;
  };
}

export interface PracticeStats {
  overall: {
    totalSessions: number;
    averageScore: number;
    totalTimeSpent: number; // in minutes
    totalQuestions: number;
    correctAnswers: number;
    accuracy: number; // percentage
  };
  byQuestionType: {
    [key: string]: {
      totalSessions: number;
      averageScore: number;
      accuracy: number;
    };
  };
  byDifficulty: {
    [key: string]: {
      totalSessions: number;
      averageScore: number;
      accuracy: number;
    };
  };
}

export interface PracticeQuestionsResponse {
  success: boolean;
  data: {
    questions: PracticeQuestion[];
    total: number;
    filters: {
      lessonId?: string;
      questionType?: string;
      difficulty?: string;
      limit?: number;
    };
  };
}

export interface PracticeQuestionResponse {
  success: boolean;
  data: PracticeQuestion;
}

export interface SubmitAnswerResponse {
  success: boolean;
  data: {
    result: PracticeResult;
    nextQuestionId?: string;
  };
}

export interface SubmitSessionResponse {
  success: boolean;
  data: {
    sessionId: string;
    results: PracticeResult[];
    totalScore: number;
    accuracy: number;
    timeSpent: number;
  };
}

export interface PracticeHistoryResponse {
  success: boolean;
  data: {
    history: PracticeHistory[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface PracticeStatsResponse {
  success: boolean;
  data: PracticeStats;
}

export interface PracticeQueryParams {
  lessonId?: string;
  questionType?: "multiple_choice" | "fill_blank" | "true_false" | "pronunciation" | "translation";
  difficulty?: "Mudah" | "Sedang" | "Sulit";
  limit?: number;
}

export interface PracticeHistoryQueryParams {
  page?: number;
  limit?: number;
}

// Practice service
// Hook untuk practice service dengan JWT authentication
export const usePracticeService = () => {
  const apiClient = useJwtApiClient();

  return {
    async getQuestions(params?: PracticeQueryParams): Promise<PracticeQuestionsResponse> {
      const queryParams = new URLSearchParams();
      if (params?.lessonId) queryParams.append("lessonId", params.lessonId);
      if (params?.questionType) queryParams.append("questionType", params.questionType);
      if (params?.difficulty) queryParams.append("difficulty", params.difficulty);
      if (params?.limit) queryParams.append("limit", params.limit.toString());

      const endpoint = `/practice/questions${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await apiClient.get<{ questions: PracticeQuestion[]; total: number; filters: { lessonId?: string; questionType?: string; difficulty?: string; limit?: number } }>(endpoint);
      return {
        success: response.success,
        data: response.data!,
      };
    },

    async getQuestionById(id: string): Promise<PracticeQuestionResponse> {
      const response = await apiClient.get<PracticeQuestion>(`/practice/questions/${id}`);
      return {
        success: response.success,
        data: response.data!,
      };
    },

    async submitAnswer(questionId: string, answer: PracticeAnswer): Promise<SubmitAnswerResponse> {
      const response = await apiClient.post<{ result: PracticeResult; nextQuestionId?: string }>(`/practice/questions/${questionId}/submit`, answer);
      return {
        success: response.success,
        data: response.data!,
      };
    },

    async submitSession(session: PracticeSession): Promise<SubmitSessionResponse> {
      const response = await apiClient.post<{ sessionId: string; results: PracticeResult[]; totalScore: number; accuracy: number; timeSpent: number }>("/practice/sessions", session);
      return {
        success: response.success,
        data: response.data!,
      };
    },

    async getHistory(params?: PracticeHistoryQueryParams): Promise<PracticeHistoryResponse> {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());

      const endpoint = `/practice/history${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await apiClient.get<{ history: PracticeHistory[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(endpoint);
      return {
        success: response.success,
        data: response.data!,
      };
    },

    async getStats(): Promise<PracticeStatsResponse> {
      const response = await apiClient.get<PracticeStats>("/practice/stats");
      return {
        success: response.success,
        data: response.data!,
      };
    },
  };
};
