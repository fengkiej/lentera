ALTER TABLE lessons ADD `learning_objectives` text;--> statement-breakpoint
ALTER TABLE lessons ADD `prerequisites` text;--> statement-breakpoint
ALTER TABLE lessons ADD `key_concepts` text;--> statement-breakpoint
ALTER TABLE lessons ADD `practical_applications` text;--> statement-breakpoint
ALTER TABLE lessons ADD `media_content` text;--> statement-breakpoint
ALTER TABLE lessons ADD `difficulty_sub_level` integer DEFAULT 1;