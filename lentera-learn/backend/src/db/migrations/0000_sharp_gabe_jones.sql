CREATE TABLE `achievements` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`icon` text NOT NULL,
	`condition_type` text NOT NULL,
	`condition_value` integer NOT NULL,
	`points` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `audio_files` (
	`id` integer PRIMARY KEY NOT NULL,
	`lesson_id` integer,
	`example_id` integer,
	`user_id` text,
	`filename` text NOT NULL,
	`file_path` text NOT NULL,
	`size` integer,
	`file_type` text NOT NULL,
	`mime_type` text NOT NULL,
	`duration` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`example_id`) REFERENCES `lesson_examples`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `lesson_examples` (
	`id` integer PRIMARY KEY NOT NULL,
	`lesson_id` integer NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`explanation` text NOT NULL,
	`order_index` integer NOT NULL,
	`example_type` text DEFAULT 'text',
	`media_url` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `lessons` (
	`id` integer PRIMARY KEY NOT NULL,
	`topic_id` integer NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`summary` text NOT NULL,
	`order_index` integer NOT NULL,
	`estimated_duration` integer,
	`difficulty_level` text DEFAULT 'beginner',
	`is_active` integer DEFAULT true,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `practice_questions` (
	`id` integer PRIMARY KEY NOT NULL,
	`lesson_id` integer NOT NULL,
	`type` text NOT NULL,
	`question` text NOT NULL,
	`explanation` text NOT NULL,
	`difficulty_level` text DEFAULT 'beginner',
	`points` integer DEFAULT 10,
	`order_index` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `question_options` (
	`id` integer PRIMARY KEY NOT NULL,
	`question_id` integer NOT NULL,
	`option_text` text NOT NULL,
	`is_correct` integer NOT NULL,
	`order_index` integer NOT NULL,
	FOREIGN KEY (`question_id`) REFERENCES `practice_questions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `subjects` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`icon` text NOT NULL,
	`color` text NOT NULL,
	`order_index` integer NOT NULL,
	`is_active` integer DEFAULT true,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `topics` (
	`id` integer PRIMARY KEY NOT NULL,
	`subject_id` integer NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`order_index` integer NOT NULL,
	`estimated_duration` integer,
	`difficulty_level` text DEFAULT 'beginner',
	`is_active` integer DEFAULT true,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_achievements` (
	`user_id` text NOT NULL,
	`achievement_id` integer NOT NULL,
	`earned_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`achievement_id`) REFERENCES `achievements`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_practice_results` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`question_id` integer NOT NULL,
	`selected_option_id` integer,
	`user_answer` text,
	`is_correct` integer NOT NULL,
	`points_earned` integer DEFAULT 0,
	`time_taken` integer,
	`attempted_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`question_id`) REFERENCES `practice_questions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`selected_option_id`) REFERENCES `question_options`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_progress` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`lesson_id` integer NOT NULL,
	`progress_percentage` integer DEFAULT 0,
	`is_completed` integer DEFAULT false,
	`completed_at` text,
	`last_accessed` text DEFAULT CURRENT_TIMESTAMP,
	`time_spent` integer DEFAULT 0,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_stats` (
	`user_id` text PRIMARY KEY NOT NULL,
	`total_study_time` integer DEFAULT 0,
	`current_streak` integer DEFAULT 0,
	`longest_streak` integer DEFAULT 0,
	`total_points` integer DEFAULT 0,
	`lessons_completed` integer DEFAULT 0,
	`practice_questions_answered` integer DEFAULT 0,
	`correct_answers` integer DEFAULT 0,
	`last_study_date` text,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text NOT NULL,
	`avatar_url` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);