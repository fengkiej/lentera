import { useJwtApiClient, ApiResponse } from "./apiClient";

// Types for topics data
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

export interface TopicWithLessons extends Topic {
  lessons: Lesson[];
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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  progressPercentage?: number;
  isCompleted?: boolean;
  lastAccessed?: string;
}

// API Response interfaces
export interface TopicResponse {
  success: boolean;
  data: TopicWithLessons;
}

export interface TopicLessonsResponse {
  success: boolean;
  data: Lesson[];
}

// Service functions
export const useTopicsService = () => {
  const apiClient = useJwtApiClient();

  const getTopicById = async (topicId: number): Promise<TopicResponse> => {
    const response = await apiClient.get<TopicWithLessons>(`/topics/${topicId}`);
    return {
      success: response.success,
      data: response.data!,
    };
  };

  const getTopicLessons = async (topicId: number): Promise<TopicLessonsResponse> => {
    const response = await apiClient.get<Lesson[]>(`/topics/${topicId}/lessons`);
    return {
      success: response.success,
      data: response.data!,
    };
  };

  return {
    getTopicById,
    getTopicLessons,
  };
};

// React Query hooks
export const useTopic = (topicId: number) => {
  const { getTopicById } = useTopicsService();
  
  return {
    queryKey: ["topic", topicId],
    queryFn: () => getTopicById(topicId),
    enabled: !!topicId,
  };
};

export const useTopicLessons = (topicId: number) => {
  const { getTopicLessons } = useTopicsService();
  
  return {
    queryKey: ["topic-lessons", topicId],
    queryFn: () => getTopicLessons(topicId),
    enabled: !!topicId,
  };
};

export const useTopicWithLessons = (topicId: number) => {
  const { getTopicById } = useTopicsService();
  
  return {
    queryKey: ["topic-with-lessons", topicId],
    queryFn: () => getTopicById(topicId),
    enabled: !!topicId,
  };
};