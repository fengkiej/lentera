import { useJwtApiClient, ApiResponse } from "./apiClient";

// Types for lessons data
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
  progressPercentage?: number;
  isCompleted?: boolean;
  lastAccessed?: string;
}

export interface LessonWithDetails extends Lesson {
  examples: LessonExample[];
  questions: PracticeQuestion[];
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

// API Response interfaces
export interface LessonWithTopicSubject {
  id: number;
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
  topicId: number;
  topicName: string;
  subjectId: number;
  subjectName: string;
  subjectColor: string;
  // Progress information from backend
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
}

export interface UserProgress {
  id: number;
  userId: number;
  lessonId: number;
  isCompleted: boolean;
  completedAt: string | null;
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface LessonResponse {
  success: boolean;
  data: {
    lesson: Lesson;
    examples: LessonExample[];
    questions: PracticeQuestion[];
    progress: UserProgress | null;
  };
}

export interface AllLessonsResponse {
  success: boolean;
  data: {
    lessons: LessonWithTopicSubject[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    filters?: {
      search: string | null;
      subjectIds: string | null;
      difficultyLevel: string | null;
      sortBy: string;
      sortOrder: string;
    };
  };
}

// Service functions
export const useLessonsService = () => {
  const apiClient = useJwtApiClient();

  const getAllLessons = async (params?: {
    search?: string;
    subjectIds?: number[];
    difficultyLevel?: string;
    sortBy?: "title" | "difficulty" | "duration" | "created";
    sortOrder?: "asc" | "desc";
    page?: number;
    limit?: number;
  }): Promise<AllLessonsResponse> => {
    interface RawLessonsResponse {
      lessons: Array<
        Omit<LessonWithTopicSubject, "learningObjectives" | "prerequisites" | "keyConcepts" | "practicalApplications" | "mediaContent"> & {
          learningObjectives?: string;
          prerequisites?: string;
          keyConcepts?: string;
          practicalApplications?: string;
          mediaContent?: string;
        }
      >;
    }

    // Build query parameters
    const queryParams = new URLSearchParams();

    if (params?.search) {
      queryParams.append("search", params.search);
    }

    if (params?.subjectIds && params.subjectIds.length > 0) {
      queryParams.append("subjectIds", params.subjectIds.join(","));
    }

    if (params?.difficultyLevel) {
      queryParams.append("difficultyLevel", params.difficultyLevel);
    }

    if (params?.sortBy) {
      queryParams.append("sortBy", params.sortBy);
    }

    if (params?.sortOrder) {
      queryParams.append("sortOrder", params.sortOrder);
    }

    if (params?.page) {
      queryParams.append("page", params.page.toString());
    }

    if (params?.limit) {
      queryParams.append("limit", params.limit.toString());
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/lessons?${queryString}` : "/lessons";

    const response = await apiClient.get<RawLessonsResponse>(url);

    // Parse JSON fields from backend with error handling
    const safeJsonParse = (jsonString: string | undefined | null | object | unknown[]): string[] | undefined => {
      if (!jsonString) {
        return undefined;
      }

      // If it's already an array, return it
      if (Array.isArray(jsonString)) {
        return jsonString as string[];
      }

      // If it's an object but not array, return undefined
      if (typeof jsonString === "object") {
        return undefined;
      }

      // If it's a string, try to parse it as JSON first
      if (typeof jsonString === "string") {
        try {
          const parsed = JSON.parse(jsonString);
          if (Array.isArray(parsed)) {
            return parsed;
          }
          return undefined;
        } catch (error) {
          // If JSON parsing fails, treat as comma-separated string and convert to array
          if (jsonString.includes(',')) {
            return jsonString.split(',').map((item: string) => item.trim()).filter((item: string) => item.length > 0);
          }
          // If no comma, return as single item array
          return jsonString.trim() ? [jsonString.trim()] : [];
        }
      }

      return undefined;
    };

    const safeMediaContentParse = (jsonString: string | undefined | null | object | unknown[]): { type: string; url: string; description?: string; } | null => {
      if (!jsonString) {
        return null;
      }

      // If it's already an object with the right structure, return it
       if (typeof jsonString === "object" && jsonString !== null && !Array.isArray(jsonString)) {
         const obj = jsonString as Record<string, unknown>;
         if (typeof obj.type === 'string' && typeof obj.url === 'string') {
           return {
             type: obj.type,
             url: obj.url,
             description: typeof obj.description === 'string' ? obj.description : undefined
           };
         }
       }

      // If it's a string, try to parse it as JSON
      if (typeof jsonString === "string") {
        try {
          const parsed = JSON.parse(jsonString);
          if (parsed && typeof parsed === "object" && parsed.type && parsed.url) {
            return parsed;
          }
        } catch (error) {
          // If parsing fails, return null
        }
      }

      return null;
    };

    const parsedLessons = response.data!.lessons.map((lesson) => ({
      ...lesson,
      learningObjectives: safeJsonParse(lesson.learningObjectives),
      prerequisites: safeJsonParse(lesson.prerequisites),
      keyConcepts: safeJsonParse(lesson.keyConcepts),
      practicalApplications: safeJsonParse(lesson.practicalApplications),
      mediaContent: safeMediaContentParse(lesson.mediaContent),
    }));

    return {
      success: response.success,
      data: {
        lessons: parsedLessons,
      },
    };
  };

  const getLessonById = async (lessonId: number): Promise<LessonResponse> => {
    interface RawLessonResponse {
      lesson: Omit<Lesson, "learningObjectives" | "prerequisites" | "keyConcepts" | "practicalApplications" | "mediaContent"> & {
        learningObjectives?: string;
        prerequisites?: string;
        keyConcepts?: string;
        practicalApplications?: string;
        mediaContent?: string;
      };
      examples: LessonExample[];
      questions: PracticeQuestion[];
      progress: UserProgress | null;
    }

    const response = await apiClient.get<RawLessonResponse>(`/lessons/${lessonId}`);

    // Parse JSON fields from backend with error handling
    const lesson = response.data!.lesson;

    const safeJsonParse = (jsonString: string | undefined | null | object | unknown[]) => {
      if (!jsonString) return undefined;

      // If it's already an object or array, return it as is
      if (typeof jsonString === "object") {
        return jsonString;
      }

      // If it's a string, try to parse it
      if (typeof jsonString === "string") {
        try {
          return JSON.parse(jsonString);
        } catch (error) {
          console.warn("Failed to parse JSON:", jsonString, error);
          return undefined;
        }
      }

      return undefined;
    };

    const parsedLesson: Lesson = {
      ...lesson,
      learningObjectives: safeJsonParse(lesson.learningObjectives),
      prerequisites: safeJsonParse(lesson.prerequisites),
      keyConcepts: safeJsonParse(lesson.keyConcepts),
      practicalApplications: safeJsonParse(lesson.practicalApplications),
      mediaContent: safeJsonParse(lesson.mediaContent),
    };

    return {
      success: response.success,
      data: {
        ...response.data!,
        lesson: parsedLesson,
      },
    };
  };

  return {
    getAllLessons,
    getLessonById,
  };
};

// React Query hooks
export const useAllLessons = (params?: { search?: string; subjectIds?: number[]; difficultyLevel?: string; sortBy?: "title" | "difficulty" | "duration" | "created"; sortOrder?: "asc" | "desc"; page?: number; limit?: number }) => {
  const { getAllLessons } = useLessonsService();

  return {
    queryKey: ["lessons", "all", params],
    queryFn: () => getAllLessons(params),
  };
};

export const useLesson = (lessonId: number) => {
  const { getLessonById } = useLessonsService();

  return {
    queryKey: ["lesson", lessonId],
    queryFn: () => getLessonById(lessonId),
    enabled: !!lessonId,
  };
};
