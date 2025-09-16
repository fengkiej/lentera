import { useJwtApiClient, ApiResponse } from "./apiClient";

// Types for user data
export interface UserStats {
  totalRootWords: number;
  learnedRootWords: number;
  lessonsCompleted: number;
  currentStreak: number;
  totalTime: number; // in minutes
  level: string;
  totalPoints: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  level: string;
  points: number;
  joinDate: string;
  preferences?: {
    dailyGoal?: number;
    reminderTime?: string;
    language?: string;
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  current: number;
  unlocked: boolean;
  category: string;
  points: number;
  unlockedAt?: string;
}

export interface UserStatsResponse {
  success: boolean;
  data: UserStats;
}

export interface UserProfileResponse {
  success: boolean;
  data: UserProfile;
}

export interface UserAchievementsResponse {
  success: boolean;
  data: {
    achievements: Achievement[];
    totalPoints: number;
    unlockedCount: number;
  };
}

export interface UpdateProfileRequest {
  name?: string;
  preferences?: {
    dailyGoal?: number;
    reminderTime?: string;
    language?: string;
  };
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: UserProfile;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

// User service
// Hook untuk user service dengan Clerk authentication
export const useUserService = () => {
  const apiClient = useJwtApiClient();

  return {
    async getProfile(): Promise<UserProfileResponse> {
      const response = await apiClient.get<UserProfile>("/user/profile");
      return {
        success: response.success,
        data: response.data!,
      };
    },

    async updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
      const response = await apiClient.put<UserProfile>("/user/profile", data);
      return {
        success: response.success,
        message: response.message || "Profile updated successfully",
        data: response.data!,
      };
    },

    async getStats(): Promise<UserStatsResponse> {
      const response = await apiClient.get<UserStats>("/user/stats");
      return {
        success: response.success,
        data: response.data!,
      };
    },

    async getAchievements(): Promise<UserAchievementsResponse> {
      const response = await apiClient.get<{ achievements: Achievement[]; totalPoints: number; unlockedCount: number }>("/user/achievements");
      return {
        success: response.success,
        data: response.data!,
      };
    },

    async deleteAccount(): Promise<{ success: boolean; message: string }> {
      const response = await apiClient.delete<Record<string, unknown>>("/user/account");
      return {
        success: response.success,
        message: response.message || "Account deleted successfully",
      };
    },

    async changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
      const response = await apiClient.post<Record<string, unknown>>("/auth/change-password", data);
      return {
        success: response.success,
        message: response.message || "Password berhasil diubah",
      };
    },
  };
};
