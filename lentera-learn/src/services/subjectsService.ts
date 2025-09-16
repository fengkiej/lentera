import { useJwtApiClient, ApiResponse } from "./apiClient";

// Types for subjects data
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

export interface SubjectWithTopics extends Subject {
  topics: Topic[];
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

// API Response interfaces
export interface SubjectsResponse {
  success: boolean;
  data: {
    subjects: Subject[];
  };
}

export interface SubjectResponse {
  success: boolean;
  data: SubjectWithTopics;
}

export interface SubjectTopicsResponse {
  success: boolean;
  data: {
    topics: Topic[];
  };
}

export interface AllTopicsResponse {
  success: boolean;
  data: {
    topics: (Topic & { subjectName: string; subjectColor: string })[];
  };
}

// Service functions
export const useSubjectsService = () => {
  const apiClient = useJwtApiClient();

  const getAllSubjects = async (): Promise<SubjectsResponse> => {
    const response = await apiClient.get<{ subjects: Subject[] }>("/subjects");
    return response as SubjectsResponse;
  };

  const getSubjectById = async (subjectId: number): Promise<SubjectResponse> => {
    const response = await apiClient.get<SubjectWithTopics>(`/subjects/${subjectId}`);
    return response as SubjectResponse;
  };

  const getSubjectTopics = async (subjectId: number): Promise<SubjectTopicsResponse> => {
    const response = await apiClient.get<{ topics: Topic[] }>(`/subjects/${subjectId}/topics`);
    return response as SubjectTopicsResponse;
  };

  const getAllTopics = async (): Promise<AllTopicsResponse> => {
    const response = await apiClient.get<{ topics: (Topic & { subjectName: string; subjectColor: string })[] }>("/topics");
    return response as AllTopicsResponse;
  };

  return {
    getAllSubjects,
    getSubjectById,
    getSubjectTopics,
    getAllTopics,
  };
};

// React Query hooks
export const useSubjects = () => {
  const { getAllSubjects } = useSubjectsService();
  
  return {
    queryKey: ["subjects"],
    queryFn: getAllSubjects,
  };
};

export const useSubject = (subjectId: number) => {
  const { getSubjectById } = useSubjectsService();
  
  return {
    queryKey: ["subject", subjectId],
    queryFn: () => getSubjectById(subjectId),
    enabled: !!subjectId,
  };
};

export const useSubjectTopics = (subjectId: number) => {
  const { getSubjectTopics } = useSubjectsService();
  
  return {
    queryKey: ["subject-topics", subjectId],
    queryFn: () => getSubjectTopics(subjectId),
    enabled: !!subjectId,
  };
};

export const useAllTopics = () => {
  const { getAllTopics } = useSubjectsService();
  
  return {
    queryKey: ["all-topics"],
    queryFn: getAllTopics,
  };
};