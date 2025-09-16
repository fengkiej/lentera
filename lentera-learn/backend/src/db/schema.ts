import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Users & Authentication
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Subjects (Mata Pelajaran)
export const subjects = sqliteTable("subjects", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  orderIndex: integer("order_index").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Topics (Topik dalam Mata Pelajaran)
export const topics = sqliteTable("topics", {
  id: integer("id").primaryKey(),
  subjectId: integer("subject_id")
    .notNull()
    .references(() => subjects.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  orderIndex: integer("order_index").notNull(),
  estimatedDuration: integer("estimated_duration"), // dalam menit
  difficultyLevel: text("difficulty_level").default("beginner"), // 'beginner', 'intermediate', 'advanced'
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Lessons (Unit Pembelajaran)
export const lessons = sqliteTable("lessons", {
  id: integer("id").primaryKey(),
  topicId: integer("topic_id")
    .notNull()
    .references(() => topics.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  summary: text("summary").notNull(),
  learningObjectives: text("learning_objectives"), // JSON array of learning objectives
  prerequisites: text("prerequisites"), // JSON array of prerequisite concepts
  keyConcepts: text("key_concepts"), // JSON array of key concepts covered
  practicalApplications: text("practical_applications"), // JSON array of real-world applications
  mediaContent: text("media_content"), // JSON object with media URLs (images, diagrams, etc.)
  orderIndex: integer("order_index").notNull(),
  estimatedDuration: integer("estimated_duration"), // dalam menit
  difficultyLevel: text("difficulty_level").default("beginner"),
  difficultySubLevel: integer("difficulty_sub_level").default(1), // 1-3 for granular difficulty
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Lesson Examples (Contoh dalam Pelajaran)
export const lessonExamples = sqliteTable("lesson_examples", {
  id: integer("id").primaryKey(),
  lessonId: integer("lesson_id")
    .notNull()
    .references(() => lessons.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  explanation: text("explanation").notNull(),
  orderIndex: integer("order_index").notNull(),
  exampleType: text("example_type").default("text"), // 'text', 'image', 'video', 'audio'
  mediaUrl: text("media_url"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Practice Questions (Soal Latihan)
export const practiceQuestions = sqliteTable("practice_questions", {
  id: integer("id").primaryKey(),
  lessonId: integer("lesson_id")
    .notNull()
    .references(() => lessons.id),
  type: text("type").notNull(), // 'multiple_choice', 'true_false', 'fill_blank'
  question: text("question").notNull(),
  explanation: text("explanation").notNull(),
  difficultyLevel: text("difficulty_level").default("beginner"),
  points: integer("points").default(10),
  orderIndex: integer("order_index").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Question Options (Pilihan Jawaban)
export const questionOptions = sqliteTable("question_options", {
  id: integer("id").primaryKey(),
  questionId: integer("question_id")
    .notNull()
    .references(() => practiceQuestions.id),
  optionText: text("option_text").notNull(),
  isCorrect: integer("is_correct", { mode: "boolean" }).notNull(),
  orderIndex: integer("order_index").notNull(),
});

// User Progress (Progress Pembelajaran)
export const userProgress = sqliteTable("user_progress", {
  id: integer("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  lessonId: integer("lesson_id")
    .notNull()
    .references(() => lessons.id),
  progressPercentage: integer("progress_percentage").default(0),
  isCompleted: integer("is_completed", { mode: "boolean" }).default(false),
  completedAt: text("completed_at"),
  lastAccessed: text("last_accessed").default(sql`CURRENT_TIMESTAMP`),
  timeSpent: integer("time_spent").default(0), // dalam detik
});

// User Practice Results (Hasil Latihan)
export const userPracticeResults = sqliteTable("user_practice_results", {
  id: integer("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  questionId: integer("question_id")
    .notNull()
    .references(() => practiceQuestions.id),
  selectedOptionId: integer("selected_option_id").references(() => questionOptions.id),
  userAnswer: text("user_answer"), // untuk fill_blank
  isCorrect: integer("is_correct", { mode: "boolean" }).notNull(),
  pointsEarned: integer("points_earned").default(0),
  timeTaken: integer("time_taken"), // dalam detik
  attemptedAt: text("attempted_at").default(sql`CURRENT_TIMESTAMP`),
});

// User Stats (Statistik Pengguna)
export const userStats = sqliteTable("user_stats", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id),
  totalStudyTime: integer("total_study_time").default(0), // dalam menit
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  totalPoints: integer("total_points").default(0),
  lessonsCompleted: integer("lessons_completed").default(0),
  practiceQuestionsAnswered: integer("practice_questions_answered").default(0),
  correctAnswers: integer("correct_answers").default(0),
  lastStudyDate: text("last_study_date"),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Achievements (Pencapaian)
export const achievements = sqliteTable("achievements", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  conditionType: text("condition_type").notNull(), // 'lessons_completed', 'streak', 'points', 'accuracy'
  conditionValue: integer("condition_value").notNull(),
  points: integer("points").default(0),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// User Achievements (Pencapaian Pengguna)
export const userAchievements = sqliteTable("user_achievements", {
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  achievementId: integer("achievement_id")
    .notNull()
    .references(() => achievements.id),
  earnedAt: text("earned_at").default(sql`CURRENT_TIMESTAMP`),
});

// Audio Files (File Multimedia)
export const audioFiles = sqliteTable("audio_files", {
  id: integer("id").primaryKey(),
  lessonId: integer("lesson_id").references(() => lessons.id),
  exampleId: integer("example_id").references(() => lessonExamples.id),
  userId: text("user_id").references(() => users.id),
  filename: text("filename").notNull(),
  filePath: text("file_path").notNull(),
  size: integer("size"),
  fileType: text("file_type").notNull(), // 'lesson', 'example', 'user_recording'
  mimeType: text("mime_type").notNull(),
  duration: integer("duration"), // dalam detik
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;
export type Topic = typeof topics.$inferSelect;
export type NewTopic = typeof topics.$inferInsert;
export type Lesson = typeof lessons.$inferSelect;
export type NewLesson = typeof lessons.$inferInsert;
export type LessonExample = typeof lessonExamples.$inferSelect;
export type NewLessonExample = typeof lessonExamples.$inferInsert;
export type PracticeQuestion = typeof practiceQuestions.$inferSelect;
export type NewPracticeQuestion = typeof practiceQuestions.$inferInsert;
export type QuestionOption = typeof questionOptions.$inferSelect;
export type NewQuestionOption = typeof questionOptions.$inferInsert;
export type UserProgress = typeof userProgress.$inferSelect;
export type NewUserProgress = typeof userProgress.$inferInsert;
export type UserPracticeResult = typeof userPracticeResults.$inferSelect;
export type NewUserPracticeResult = typeof userPracticeResults.$inferInsert;
export type UserStats = typeof userStats.$inferSelect;
export type NewUserStats = typeof userStats.$inferInsert;
export type Achievement = typeof achievements.$inferSelect;
export type NewAchievement = typeof achievements.$inferInsert;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type NewUserAchievement = typeof userAchievements.$inferInsert;
export type AudioFile = typeof audioFiles.$inferSelect;
export type NewAudioFile = typeof audioFiles.$inferInsert;
