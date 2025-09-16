import { useJwtApiClient, ApiResponse } from "./apiClient";

// Types for progress data
export interface LessonProgress {
  id: string;
  lessonId: string;
  userId: string;
  progressPercentage: number;
  completed: boolean;
  score?: number;
  timeSpent: number; // in minutes
  completedAt?: string;
  lastAccessed: string;
  createdAt: string;
  updatedAt: string;
  lesson?: {
    id: string;
    title: string;
    difficulty: "Mudah" | "Sedang" | "Sulit";
    rootWord: string;
    arabicText: string;
    transliteration: string;
    meaning: string;
  };
}

export interface ProgressSummary {
  // General learning statistics
  totalLessons: number;
  startedLessons: number;
  completedLessons: number;
  totalSubjects: number;
  totalTopics: number;
  completedTopics: number;

  // Progress metrics
  completionRate: number;
  progressPercentage: number;
  averageProgress: number;
  averageScore: number; // Placeholder for future implementation

  // User engagement metrics
  totalTimeSpent: number; // in minutes
  streakDays: number;
  currentStreak: number;
  level: string; // Placeholder for level system
  points: number;

  // Activity data
  recentActivity: Array<{
    id: number;
    type: string;
    title: string;
    completedAt: string;
    points: number;
  }>;
}

export interface PaginatedProgressResponse {
  success: boolean;
  data: {
    progress: LessonProgress[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ProgressSummaryResponse {
  success: boolean;
  data: ProgressSummary;
}

export interface LessonProgressResponse {
  success: boolean;
  data: {
    lesson: {
      id: number;
      rootWord: string;
      arabicText: string;
      meaning: string;
      difficulty: string;
      orderIndex: number;
    };
    progress: LessonProgress | null;
  };
}

export interface UpdateProgressRequest {
  lessonId: number;
  progressPercentage: number;
  completed?: boolean;
}

export interface UpdateProgressResponse {
  success: boolean;
  message: string;
  data: LessonProgress;
}

export interface ProgressQueryParams {
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt" | "score" | "timeSpent";
  sortOrder?: "asc" | "desc";
  completed?: boolean;
}

export interface ContinueLearningLesson {
  id: number;
  title: string;
  content: string;
  summary: string;
  progressPercentage: number;
  orderIndex: number;
  subjectName: string;
  topicName: string;
  difficulty: "Mudah" | "Sedang" | "Sulit";
  estimatedDuration: number; // in minutes
}

export interface ContinueLearningResponse {
  success: boolean;
  data: ContinueLearningLesson[];
}

// Hook untuk progress service dengan JWT authentication
export const useProgressService = () => {
  const apiClient = useJwtApiClient();

  return {
    async getProgress(params?: ProgressQueryParams): Promise<PaginatedProgressResponse> {
      const queryParams = new URLSearchParams();

      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);
      if (params?.completed !== undefined) queryParams.append("completed", params.completed.toString());

      const endpoint = `/progress${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await apiClient.get<{ progress: LessonProgress[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(endpoint);
      return {
        success: response.success,
        data: response.data!,
      };
    },

    async getProgressSummary(): Promise<ProgressSummaryResponse> {
      const response = await apiClient.get<ProgressSummary>("/progress/summary");
      return {
        success: response.success,
        data: response.data!,
      };
    },

    async getLessonProgress(lessonId: string): Promise<LessonProgressResponse> {
      const response = await apiClient.get<{ lesson: { id: number; rootWord: string; arabicText: string; meaning: string; difficulty: string; orderIndex: number }; progress: LessonProgress | null }>(`/progress/lesson/${lessonId}`);
      return {
        success: response.success,
        data: response.data!,
      };
    },

    async updateProgress(data: UpdateProgressRequest): Promise<UpdateProgressResponse> {
      try {
        const response = await apiClient.post<LessonProgress>("/progress/update", data);
        return {
          success: response.success,
          message: response.message || "Progress updated successfully",
          data: response.data!,
        };
      } catch (error) {
        console.error("❌ API call failed:", error);
        throw error;
      }
    },

    async resetLessonProgress(lessonId: string): Promise<{ success: boolean; message: string }> {
      const response = await apiClient.delete<Record<string, unknown>>(`/progress/lesson/${lessonId}`);
      return {
        success: response.success,
        message: response.message || "Progress reset successfully",
      };
    },

    async getContinueLearningLessons(limit: number = 3): Promise<ContinueLearningResponse> {
      const response = await apiClient.get<ContinueLearningLesson[]>(`/progress/continue-learning?limit=${limit}`);
      return {
        success: response.success,
        data: response.data!,
      };
    },
  };
};
