// Export JWT-based services (hooks)
export { useJwtApiClient } from "./apiClient";
export { useUserService } from "./userService";
export { useProgressService } from "./progressService";
export { usePracticeService } from "./practiceService";
export { useVoiceService } from "./voiceService";
export { useDashboardService } from "./dashboardService";
export { useLessonsService } from "./lessonsService";

// Export commonly used types
export type { UserProfile, UserStats } from "./userService";
export type { ProgressSummary } from "./progressService";
export type { Lesson, LessonExample } from "./lessonsService";
export type { PracticeQuestion, PracticeSession } from "./practiceService";
export type { VoiceRecording, VoiceAnalysisResult, UploadAudioResponse } from "./voiceService";
export type { DashboardData } from "./dashboardService";
