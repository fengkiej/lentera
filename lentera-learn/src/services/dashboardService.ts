import { useJwtApiClient, ApiResponse } from "./apiClient";

// New interfaces for Lentera platform
export interface Subject {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  totalTopics: number;
  completedTopics: number;
  progressPercentage: number;
  isActive: boolean;
}

export interface Topic {
  id: number;
  name: string;
  description: string;
  subjectId: number;
  subjectName: string;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  orderIndex: number;
}

export interface RecentActivity {
  id: number;
  type: "lesson_completed" | "topic_completed" | "subject_started";
  title: string;
  subjectName: string;
  topicName?: string;
  completedAt: string;
  points: number;
}

export interface LearningOverview {
  totalSubjects: number;
  activeSubjects: number;
  completedLessonsThisWeek: number;
  currentStreak: number;
  totalPoints: number;
  totalStudyTime: number; // in minutes
  level: string;
  progressPercentage: number;
}

export interface ContinueLearningItem {
  id: number;
  title: string;
  subjectName: string;
  topicName: string;
  progressPercentage: number;
  estimatedDuration: number;
  difficultyLevel: string;
  lastAccessed?: string;
  isRecommended: boolean;
}

export interface QuickStats {
  activeSubjects: number;
  completedTopics: number;
  totalAchievements: number;
  weeklyGoalProgress: number;
}

export interface DashboardData {
  user: {
    name: string;
    email: string;
  };
  learningOverview: LearningOverview;
  activeSubjects: Subject[];
  continueLearning: ContinueLearningItem[];
  quickStats: QuickStats;
  recentActivity: RecentActivity[];
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}

// Legacy interfaces for backward compatibility
export interface DashboardStats {
  totalRootWords: number;
  learnedRootWords: number;
  completedLessons: number;
  streakDays: number;
  totalTime: number; // in minutes
  points: number;
  progressPercentage: number;
}

export interface RecommendedLesson {
  id: number;
  title: string;
  difficulty: string;
  progress: number;
}

// Hook untuk dashboard service dengan JWT authentication
export const useDashboardService = () => {
  const apiClient = useJwtApiClient();

  return {
    async getDashboardData(): Promise<DashboardData> {
      const response = await apiClient.get<DashboardData>("/api/v1/learning/dashboard");
      return response.data!;
    },

    async getActiveSubjects(): Promise<Subject[]> {
      const response = await apiClient.get<Subject[]>("/api/v1/subjects/active");
      return response.data!;
    },

    async getContinueLearning(): Promise<ContinueLearningItem[]> {
      const response = await apiClient.get<ContinueLearningItem[]>("/api/v1/learning/continue");
      return response.data!;
    },

    async getRecentActivity(): Promise<RecentActivity[]> {
      const response = await apiClient.get<RecentActivity[]>("/api/v1/learning/recent-activity");
      return response.data!;
    },

    // Legacy method for backward compatibility
    async getLegacyDashboardData(): Promise<{
      user: { name: string; email: string };
      stats: DashboardStats;
      recommendedLessons: RecommendedLesson[];
    }> {
      const response = await apiClient.get<{
        user: { name: string; email: string };
        stats: DashboardStats;
        recommendedLessons: RecommendedLesson[];
      }>("/user/dashboard");
      return response.data!;
    },
  };
};
