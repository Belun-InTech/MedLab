CREATE TABLE `child_vaccinations` (
	`id` char(36) NOT NULL,
	`child_id` char(36) NOT NULL,
	`dose_id` varchar(32) NOT NULL,
	`given_at` date NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `child_vaccinations_id` PRIMARY KEY(`id`),
	CONSTRAINT `child_dose_unq` UNIQUE(`child_id`,`dose_id`)
);
--> statement-breakpoint
CREATE TABLE `children` (
	`id` char(36) NOT NULL,
	`user_id` char(36) NOT NULL,
	`name` varchar(120) NOT NULL,
	`dob` date NOT NULL,
	`sex` enum('Male','Female') NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `children_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `consultation_conditions` (
	`id` char(36) NOT NULL,
	`consultation_id` char(36) NOT NULL,
	`position` tinyint unsigned NOT NULL,
	`name` varchar(255) NOT NULL,
	`probability` enum('High','Moderate','Low') NOT NULL,
	`description` text NOT NULL,
	`reasoning` text NOT NULL,
	`recommended_action` text NOT NULL,
	`suggested_medications` json NOT NULL,
	CONSTRAINT `consultation_conditions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `consultations` (
	`id` char(36) NOT NULL,
	`child_id` char(36) NOT NULL,
	`user_id` char(36) NOT NULL,
	`age_months` tinyint unsigned NOT NULL,
	`weight_kg` decimal(5,2),
	`language` enum('en','tet','id') NOT NULL,
	`symptom_onset` varchar(255) NOT NULL,
	`symptoms` text NOT NULL,
	`had_image` boolean NOT NULL DEFAULT false,
	`emergency_alert` boolean NOT NULL DEFAULT false,
	`emergency_message` text,
	`general_advice` json NOT NULL,
	`recommended_specialist` varchar(64) NOT NULL,
	`disclaimer` text NOT NULL,
	`provider` varchar(32) NOT NULL,
	`model` varchar(96) NOT NULL,
	`latency_ms` int unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `consultations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` char(36) NOT NULL,
	`name` varchar(120) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`dob` date NOT NULL,
	`subscribed` boolean NOT NULL DEFAULT false,
	`subscribed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unq` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `child_vaccinations` ADD CONSTRAINT `child_vaccinations_child_id_children_id_fk` FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `children` ADD CONSTRAINT `children_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `consultation_conditions` ADD CONSTRAINT `consultation_conditions_consultation_id_consultations_id_fk` FOREIGN KEY (`consultation_id`) REFERENCES `consultations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `consultations` ADD CONSTRAINT `consultations_child_id_children_id_fk` FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `consultations` ADD CONSTRAINT `consultations_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `children_user_idx` ON `children` (`user_id`);--> statement-breakpoint
CREATE INDEX `conditions_consultation_idx` ON `consultation_conditions` (`consultation_id`,`position`);--> statement-breakpoint
CREATE INDEX `conditions_name_idx` ON `consultation_conditions` (`name`);--> statement-breakpoint
CREATE INDEX `consultations_child_idx` ON `consultations` (`child_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `consultations_user_idx` ON `consultations` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `consultations_emergency_idx` ON `consultations` (`emergency_alert`,`created_at`);