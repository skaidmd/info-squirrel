CREATE TABLE `scraping_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`url` text NOT NULL,
	`status` text NOT NULL,
	`error` text,
	`content` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
