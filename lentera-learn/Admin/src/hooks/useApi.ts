import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { subjectService, topicService, lessonService, exampleService, practiceService, dashboardService } from "../lib/api";
import type { Subject, Topic, Lesson, Example, Practice } from "../lib/api";

// Query Keys untuk caching yang konsisten
export const queryKeys = {
  subjects: ["subjects"] as const,
  subject: (id: string) => ["subjects", id] as const,
  topics: ["topics"] as const,
  topic: (id: string) => ["topics", id] as const,
  topicsBySubject: (subjectId: string) => ["topics", "subject", subjectId] as const,
  lessons: ["lessons"] as const,
  lesson: (id: string) => ["lessons", id] as const,
  lessonsByTopic: (topicId: string) => ["lessons", "topic", topicId] as const,
  examples: ["examples"] as const,
  example: (id: string) => ["examples", id] as const,
  examplesByLesson: (lessonId: string) => ["examples", "lesson", lessonId] as const,
  practice: ["practice"] as const,
  practiceItem: (id: string) => ["practice", id] as const,
  practiceByLesson: (lessonId: string) => ["practice", "lesson", lessonId] as const,
  dashboard: ["dashboard"] as const,
};

// Subject Hooks
export const useSubjects = () => {
  return useQuery({
    queryKey: queryKeys.subjects,
    queryFn: async () => {
      const response = await subjectService.getAll();
      return response.data.data.subjects || [];
    },
  });
};

export const useSubject = (id: string) => {
  return useQuery({
    queryKey: queryKeys.subject(id),
    queryFn: async () => {
      const response = await subjectService.getById(id);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Subject, "id" | "createdAt" | "updatedAt">) => subjectService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subjects });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success("Subject berhasil dibuat!");
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Gagal membuat subject");
    },
  });
};

export const useUpdateSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Subject, "id" | "createdAt" | "updatedAt">> }) => subjectService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subjects });
      queryClient.invalidateQueries({ queryKey: queryKeys.subject(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success("Subject berhasil diperbarui!");
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Gagal memperbarui subject");
    },
  });
};

export const useDeleteSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => subjectService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subjects });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success("Subject berhasil dihapus!");
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Gagal menghapus subject");
    },
  });
};

// Topic Hooks
export const useTopics = () => {
  return useQuery({
    queryKey: queryKeys.topics,
    queryFn: async () => {
      const response = await topicService.getAll();
      return response.data.data.topics || [];
    },
  });
};

export const useTopic = (id: string) => {
  return useQuery({
    queryKey: queryKeys.topic(id),
    queryFn: async () => {
      const response = await topicService.getById(id);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useTopicsBySubject = (subjectId: string) => {
  return useQuery({
    queryKey: queryKeys.topicsBySubject(subjectId),
    queryFn: async () => {
      const response = await topicService.getBySubject(subjectId);
      return response.data.data?.topics || [];
    },
    enabled: !!subjectId,
  });
};

export const useCreateTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Topic, "id" | "createdAt" | "updatedAt">) => topicService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.topics });
      queryClient.invalidateQueries({ queryKey: queryKeys.topicsBySubject(variables.subjectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success("Topic berhasil dibuat!");
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Gagal membuat topic");
    },
  });
};

export const useUpdateTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Topic, "id" | "createdAt" | "updatedAt">> }) => topicService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.topics });
      queryClient.invalidateQueries({ queryKey: queryKeys.topic(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success("Topic berhasil diperbarui!");
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Gagal memperbarui topic");
    },
  });
};

export const useDeleteTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => topicService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.topics });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success("Topic berhasil dihapus!");
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Gagal menghapus topic");
    },
  });
};

// Lesson Hooks
export const useLessons = () => {
  return useQuery({
    queryKey: queryKeys.lessons,
    queryFn: async () => {
      const response = await lessonService.getAll();
      return response.data.data || [];
    },
  });
};

export const useLesson = (id: string) => {
  return useQuery({
    queryKey: queryKeys.lesson(id),
    queryFn: async () => {
      const response = await lessonService.getById(id);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useLessonsByTopic = (topicId: string) => {
  return useQuery({
    queryKey: queryKeys.lessonsByTopic(topicId),
    queryFn: async () => {
      const response = await lessonService.getByTopic(topicId);
      return response.data.data || [];
    },
    enabled: !!topicId,
  });
};

export const useCreateLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Lesson, "id" | "createdAt" | "updatedAt">) => lessonService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lessons });
      queryClient.invalidateQueries({ queryKey: queryKeys.lessonsByTopic(variables.topicId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success("Lesson berhasil dibuat!");
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Gagal membuat lesson");
    },
  });
};

export const useUpdateLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Lesson, "id" | "createdAt" | "updatedAt">> }) => lessonService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lessons });
      queryClient.invalidateQueries({ queryKey: queryKeys.lesson(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success("Lesson berhasil diperbarui!");
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Gagal memperbarui lesson");
    },
  });
};

export const useDeleteLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => lessonService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lessons });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success("Lesson berhasil dihapus!");
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Gagal menghapus lesson");
    },
  });
};

// Practice Hooks
export const usePractice = () => {
  return useQuery({
    queryKey: queryKeys.practice,
    queryFn: async () => {
      const response = await practiceService.getAll();
      return response.data.data || [];
    },
  });
};

export const usePracticeItem = (id: string) => {
  return useQuery({
    queryKey: queryKeys.practiceItem(id),
    queryFn: async () => {
      const response = await practiceService.getById(id);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const usePracticeByLesson = (lessonId: string) => {
  return useQuery({
    queryKey: queryKeys.practiceByLesson(lessonId),
    queryFn: async () => {
      const response = await practiceService.getByLesson(lessonId);
      return response.data.data || [];
    },
    enabled: !!lessonId,
  });
};

export const useCreatePractice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Practice, "id" | "createdAt" | "updatedAt">) => practiceService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.practice });
      queryClient.invalidateQueries({ queryKey: queryKeys.practiceByLesson(variables.lessonId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success("Soal latihan berhasil dibuat!");
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Gagal membuat soal latihan");
    },
  });
};

export const useUpdatePractice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Practice, "id" | "createdAt" | "updatedAt">> }) => practiceService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.practice });
      queryClient.invalidateQueries({ queryKey: queryKeys.practiceItem(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success("Soal latihan berhasil diperbarui!");
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Gagal memperbarui soal latihan");
    },
  });
};

export const useDeletePractice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => practiceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.practice });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success("Soal latihan berhasil dihapus!");
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Gagal menghapus soal latihan");
    },
  });
};

// Example Hooks
export const useExamples = () => {
  return useQuery({
    queryKey: queryKeys.examples,
    queryFn: async () => {
      const response = await exampleService.getAll();
      return response.data.data || [];
    },
  });
};

export const useExample = (id: string) => {
  return useQuery({
    queryKey: queryKeys.example(id),
    queryFn: async () => {
      const response = await exampleService.getById(id);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 0, // Always refetch to ensure fresh data
    refetchOnMount: true,
  });
};

export const useExamplesByLesson = (lessonId: string) => {
  return useQuery({
    queryKey: queryKeys.examplesByLesson(lessonId),
    queryFn: async () => {
      const response = await exampleService.getByLesson(lessonId);
      return response.data.data || [];
    },
    enabled: !!lessonId,
  });
};

export const useCreateExample = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Example, "id" | "createdAt" | "updatedAt">) => exampleService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.examples });
      queryClient.invalidateQueries({ queryKey: queryKeys.examplesByLesson(variables.lessonId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success("Example berhasil dibuat!");
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Gagal membuat example");
    },
  });
};

export const useUpdateExample = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Example, "id" | "createdAt" | "updatedAt">> }) => exampleService.update(id, data),
    onSuccess: (_, { id, data }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.examples });
      queryClient.invalidateQueries({ queryKey: queryKeys.example(id) });
      // Invalidate examples by lesson if lessonId is available in the data
      if (data.lessonId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.examplesByLesson(data.lessonId) });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success("Example berhasil diperbarui!");
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Gagal memperbarui example");
    },
  });
};

export const useDeleteExample = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => exampleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.examples });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success("Example berhasil dihapus!");
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Gagal menghapus example");
    },
  });
};

// Dashboard Hook
export const useDashboardStats = () => {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: dashboardService.getStats,
    refetchInterval: 5 * 60 * 1000, // Refetch setiap 5 menit
  });
};
