import { useJwtApiClient, ApiResponse } from "./apiClient";

// Types for voice data
export interface VoiceRecording {
  id: string;
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  duration?: number; // in seconds
  uploadedAt: string;
  analysisResults?: VoiceAnalysisResult[];
}

export interface VoiceAnalysisResult {
  id: string;
  audioId: string;
  targetWord: string;
  targetTransliteration: string;
  recognizedText?: string;
  pronunciationScore: number; // 0-100
  accuracyScore: number; // 0-100
  fluencyScore: number; // 0-100
  completenessScore: number; // 0-100
  overallScore: number; // 0-100
  feedback: string;
  suggestions?: string[];
  phonemeAnalysis?: {
    phoneme: string;
    expected: string;
    actual: string;
    score: number;
  }[];
  createdAt: string;
}

export interface UploadAudioResponse {
  success: boolean;
  message: string;
  data: {
    audioId: string;
    filename: string;
    uploadedAt: string;
  };
}

export interface AnalyzeAudioRequest {
  targetWord: string;
  targetTransliteration: string;
}

export interface AnalyzeAudioResponse {
  success: boolean;
  message: string;
  data: VoiceAnalysisResult;
}

export interface UserRecordingsResponse {
  success: boolean;
  data: {
    recordings: VoiceRecording[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface DeleteAudioResponse {
  success: boolean;
  message: string;
}

export interface UserRecordingsQueryParams {
  page?: number;
  limit?: number;
  sortBy?: "uploadedAt" | "filename" | "duration";
  sortOrder?: "asc" | "desc";
}

// Hook untuk voice service dengan JWT authentication
export const useVoiceService = () => {
  const apiClient = useJwtApiClient();

  return {
    async uploadAudio(audioBlob: Blob, lessonId?: string): Promise<UploadAudioResponse> {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.wav");
      if (lessonId) {
        formData.append("lessonId", lessonId);
      }

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/voice/upload`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      return response.json();
    },

    async analyzeAudio(audioId: string, data: AnalyzeAudioRequest): Promise<AnalyzeAudioResponse> {
      const response = await apiClient.post<VoiceAnalysisResult>(`/voice/analyze/${audioId}`, data);
      return {
        success: response.success,
        message: response.message || "Analysis completed",
        data: response.data!,
      };
    },

    async getUserRecordings(params?: UserRecordingsQueryParams): Promise<UserRecordingsResponse> {
      const queryParams = new URLSearchParams();

      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

      const endpoint = `/voice/user-recordings${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await apiClient.get<{ recordings: VoiceRecording[]; pagination: { page: number; limit: number; total: number; totalPages: number; } }>(endpoint);
      return {
        success: response.success,
        data: response.data!,
      };
    },

    async deleteAudio(id: string): Promise<DeleteAudioResponse> {
      const response = await apiClient.delete<Record<string, unknown>>(`/voice/audio/${id}`);
      return {
        success: response.success,
        message: response.message || "Audio deleted successfully",
      };
    },

    // Helper method for complete voice analysis workflow
    async uploadAndAnalyze(
      audioFile: File,
      targetWord: string,
      targetTransliteration: string
    ): Promise<{
      uploadResult: UploadAudioResponse;
      analysisResult: AnalyzeAudioResponse;
    }> {
      // First upload the audio
      const uploadResult = await this.uploadAudio(audioFile);

      // Then analyze it
      const analysisResult = await this.analyzeAudio(uploadResult.data.audioId, {
        targetWord,
        targetTransliteration,
      });

      return {
        uploadResult,
        analysisResult,
      };
    },
  };
};
