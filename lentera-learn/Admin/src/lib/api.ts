import axios from "axios";

// Konfigurasi base URL dari environment variable
const baseURL = import.meta.env.VITE_API_BASE_URL;

// Buat instance axios dengan konfigurasi default
export const api = axios.create({
  baseURL,
  timeout: 10000, // 10 detik timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor untuk logging dan auth (jika diperlukan di masa depan)
api.interceptors.request.use(
  (config) => {
    // Log request untuk debugging
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor untuk error handling
api.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    // Log error response
    console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}`);

    // Handle common errors
    if (error.response?.status === 404) {
      console.error("Resource not found");
    } else if (error.response?.status === 500) {
      console.error("Server error");
    } else if (error.code === "ECONNABORTED") {
      console.error("Request timeout");
    }

    return Promise.reject(error);
  }
);

// Types untuk API responses
export interface ApiResponse<T> {
  data: T;
  message?: string;
  total?: number;
}

export interface SubjectResponse {
  subjects: Subject[];
  total: number;
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TopicResponse {
  topics: Topic[];
  total: number;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  subjectId: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  topicId: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Example {
  id: string;
  title: string;
  content: string;
  explanation: string;
  lessonId: string;
  orderIndex: number;
  exampleType: string;
  mediaUrl?: string;
  createdAt: string;
}

export interface PracticeOption {
  id: number;
  questionId: number;
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface Practice {
  id: string;
  question: string;
  questionType: "multiple_choice" | "true_false" | "short_answer" | "essay" | "fill_blank";
  options?: PracticeOption[];
  correctAnswer: string;
  explanation?: string;
  lessonId: string;
  orderIndex: number;
  difficultyLevel: "easy" | "medium" | "hard";
  points: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Services
export const subjectService = {
  getAll: () => api.get<ApiResponse<SubjectResponse>>("/admin/subjects"),
  getById: (id: string) => api.get<ApiResponse<Subject>>(`/admin/subjects/${id}`),
  create: (data: Omit<Subject, "id" | "createdAt" | "updatedAt">) => api.post<ApiResponse<Subject>>("/admin/subjects", data),
  update: (id: string, data: Partial<Omit<Subject, "id" | "createdAt" | "updatedAt">>) => api.put<ApiResponse<Subject>>(`/admin/subjects/${id}`, data),
  delete: (id: string) => api.delete(`/admin/subjects/${id}`),
};

export const topicService = {
  getAll: () => api.get<ApiResponse<TopicResponse>>("/admin/topics"),
  getById: (id: string) => api.get<ApiResponse<Topic>>(`/admin/topics/${id}`),
  getBySubject: (subjectId: string) => api.get<ApiResponse<TopicResponse>>(`/admin/topics?subjectId=${subjectId}`),
  create: (data: Omit<Topic, "id" | "createdAt" | "updatedAt">) => api.post<ApiResponse<Topic>>("/admin/topics", data),
  update: (id: string, data: Partial<Omit<Topic, "id" | "createdAt" | "updatedAt">>) => api.put<ApiResponse<Topic>>(`/admin/topics/${id}`, data),
  delete: (id: string) => api.delete(`/admin/topics/${id}`),
};

export const lessonService = {
  getAll: () => api.get<ApiResponse<Lesson[]>>("/admin/lessons"),
  getById: (id: string) => api.get<ApiResponse<Lesson>>(`/admin/lessons/${id}`),
  getByTopic: (topicId: string) => api.get<ApiResponse<Lesson[]>>(`/admin/lessons/topic/${topicId}`),
  create: (data: Omit<Lesson, "id" | "createdAt" | "updatedAt">) => api.post<ApiResponse<Lesson>>("/admin/lessons", data),
  update: (id: string, data: Partial<Omit<Lesson, "id" | "createdAt" | "updatedAt">>) => api.put<ApiResponse<Lesson>>(`/admin/lessons/${id}`, data),
  delete: (id: string) => api.delete(`/admin/lessons/${id}`),
};

export const exampleService = {
  getAll: () => api.get<ApiResponse<Example[]>>("/admin/examples"),
  getById: (id: string) => api.get<ApiResponse<Example>>(`/admin/examples/${id}`),
  getByLesson: (lessonId: string) => api.get<ApiResponse<Example[]>>(`/admin/examples?lessonId=${lessonId}`),
  create: (data: Omit<Example, "id" | "createdAt" | "updatedAt">) => api.post<ApiResponse<Example>>("/admin/examples", data),
  update: (id: string, data: Partial<Omit<Example, "id" | "createdAt" | "updatedAt">>) => api.put<ApiResponse<Example>>(`/admin/examples/${id}`, data),
  delete: (id: string) => api.delete(`/admin/examples/${id}`),
};

export const practiceService = {
  getAll: () => api.get<ApiResponse<Practice[]>>("/admin/practice"),
  getById: (id: string) => api.get<ApiResponse<Practice>>(`/admin/practice/${id}`),
  getByLesson: (lessonId: string) => api.get<ApiResponse<Practice[]>>(`/admin/practice?lessonId=${lessonId}`),
  create: (data: Omit<Practice, "id" | "createdAt" | "updatedAt">) => {
    const { questionType, ...rest } = data;
    return api.post<ApiResponse<Practice>>("/admin/practice", { ...rest, type: questionType });
  },
  update: (id: string, data: Partial<Omit<Practice, "id" | "createdAt" | "updatedAt">>) => {
    const { questionType, ...rest } = data;
    const updateData = questionType ? { ...rest, type: questionType } : rest;
    return api.put<ApiResponse<Practice>>(`/admin/practice/${id}`, updateData);
  },
  delete: (id: string) => api.delete(`/admin/practice/${id}`),
};

// Dashboard service untuk statistik
export const dashboardService = {
  getStats: async () => {
    const [subjects, topics, lessons, examples, practice] = await Promise.all([subjectService.getAll(), topicService.getAll(), lessonService.getAll(), exampleService.getAll(), practiceService.getAll()]);

    console.log("subjects", subjects.data.data?.total);
    console.log("topics", topics.data.data?.total);
    console.log("lessons", lessons.data.data?.length);
    console.log("examples", examples.data.data?.length);
    console.log("practice", practice.data.data?.length);

    return {
      totalSubjects: subjects.data.data?.total || 0,
      totalTopics: topics.data.data?.total || 0,
      totalLessons: lessons.data.data?.length || 0,
      totalExamples: examples.data.data?.length || 0,
      totalPracticeQuestions: practice.data.data?.length || 0,
      // Mock data untuk sekarang
      activeUsers: Math.floor(Math.random() * 100) + 50,
      completionRate: Math.floor(Math.random() * 30) + 70,
    };
  },
};
