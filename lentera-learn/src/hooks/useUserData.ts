import { useQuery } from "@tanstack/react-query";
import { useUserService, UserStats, UserProfile, Achievement } from "@/services/userService";
import { useProgressService, ProgressSummary } from "@/services/progressService";
import { useLessonsService } from "@/services/lessonsService";

// Hook for user profile
export const useUserProfile = () => {
  const userService = useUserService();

  return useQuery({
    queryKey: ["user", "profile"],
    queryFn: async () => {
      const response = await userService.getProfile();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for user stats
export const useUserStats = () => {
  const userService = useUserService();

  return useQuery({
    queryKey: ["user", "stats"],
    queryFn: async () => {
      const response = await userService.getStats();
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

// Hook for progress summary
export const useProgressSummary = () => {
  const progressService = useProgressService();

  return useQuery({
    queryKey: ["progress", "summary"],
    queryFn: async () => {
      const response = await progressService.getProgressSummary();
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for user achievements
export const useUserAchievements = () => {
  const userService = useUserService();

  return useQuery({
    queryKey: ["user", "achievements"],
    queryFn: async () => {
      const response = await userService.getAchievements();
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

// Hook for recommended lessons (easy difficulty)
export const useRecommendedLessons = () => {
  const lessonsService = useLessonsService();

  return useQuery({
    queryKey: ["lessons", "recommended"],
    queryFn: async () => {
      const response = await lessonsService.getAllLessons();
      // Filter for beginner lessons and limit to 3
      const beginnerLessons = response.data.lessons
        .filter((lesson) => lesson.difficultyLevel === "beginner")
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .slice(0, 3);
      return beginnerLessons;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for continue learning lessons
export const useContinueLearningLessons = () => {
  const progressService = useProgressService();

  return useQuery({
    queryKey: ["progress", "continue-learning"],
    queryFn: async () => {
      try {
        const response = await progressService.getContinueLearningLessons(3);
        return response.data;
      } catch (error) {
        console.warn("Failed to fetch continue learning lessons:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Combined hook for dashboard data
export const useDashboardData = () => {
  const userProfile = useUserProfile();
  const userStats = useUserStats();
  const progressSummary = useProgressSummary();
  const recommendedLessons = useRecommendedLessons();
  const continueLearningLessons = useContinueLearningLessons();

  // Only consider core data for loading state (user profile and stats)
  // Other data can load in background without blocking the UI
  const coreDataLoading = userProfile.isLoading || userStats.isLoading || progressSummary.isLoading;
  const hasAnyCoreData = userProfile.data || userStats.data || progressSummary.data;

  // Only show error if core data fails AND we have no cached data
  const hasCriticalError = userProfile.isError && userStats.isError && progressSummary.isError && !hasAnyCoreData;

  return {
    userProfile,
    userStats,
    progressSummary,
    recommendedLessons,
    continueLearningLessons,
    isLoading: coreDataLoading && !hasAnyCoreData,
    isError: hasCriticalError,
    error: userProfile.error || userStats.error || progressSummary.error || recommendedLessons.error || continueLearningLessons.error,
  };
};
