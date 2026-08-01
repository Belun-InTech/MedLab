CREATE TABLE `appointments` (
	`id` char(36) NOT NULL,
	`doctor_id` char(36) NOT NULL,
	`parent_id` char(36) NOT NULL,
	`child_id` char(36) NOT NULL,
	`starts_at` timestamp NOT NULL,
	`duration_minutes` tinyint unsigned NOT NULL,
	`status` enum('booked','completed') NOT NULL DEFAULT 'booked',
	`reason` varchar(500),
	`consultation_id` char(36),
	`shares_history` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`),
	CONSTRAINT `appt_doctor_slot_unq` UNIQUE(`doctor_id`,`starts_at`)
);
--> statement-breakpoint
CREATE TABLE `clinical_notes` (
	`id` char(36) NOT NULL,
	`appointment_id` char(36) NOT NULL,
	`doctor_id` char(36) NOT NULL,
	`child_id` char(36) NOT NULL,
	`assessment` text NOT NULL,
	`plan` text NOT NULL,
	`follow_up_days` tinyint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clinical_notes_id` PRIMARY KEY(`id`),
	CONSTRAINT `note_appointment_unq` UNIQUE(`appointment_id`)
);
--> statement-breakpoint
CREATE TABLE `doctor_availability_rules` (
	`id` char(36) NOT NULL,
	`doctor_id` char(36) NOT NULL,
	`weekday` tinyint unsigned NOT NULL,
	`start_minute` int unsigned NOT NULL,
	`end_minute` int unsigned NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `doctor_availability_rules_id` PRIMARY KEY(`id`),
	CONSTRAINT `availability_rule_unq` UNIQUE(`doctor_id`,`weekday`,`start_minute`)
);
--> statement-breakpoint
CREATE TABLE `doctor_profiles` (
	`user_id` char(36) NOT NULL,
	`specialty` enum('Pediatrician','General Practitioner') NOT NULL,
	`license_number` varchar(64) NOT NULL,
	`facility_id` int unsigned,
	`facility_name` varchar(160) NOT NULL,
	`phone` varchar(32),
	`photo_url` varchar(512),
	`bio` text,
	`languages` json NOT NULL,
	`slot_minutes` tinyint unsigned NOT NULL DEFAULT 30,
	`status` enum('pending','approved','rejected','suspended') NOT NULL DEFAULT 'pending',
	`rejection_reason` varchar(255),
	`rating_avg` decimal(3,2),
	`rating_count` int unsigned NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `doctor_profiles_user_id` PRIMARY KEY(`user_id`),
	CONSTRAINT `doctor_license_unq` UNIQUE(`license_number`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `role` enum('parent','doctor','admin') DEFAULT 'parent' NOT NULL;--> statement-breakpoint
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_doctor_id_doctor_profiles_user_id_fk` FOREIGN KEY (`doctor_id`) REFERENCES `doctor_profiles`(`user_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_parent_id_users_id_fk` FOREIGN KEY (`parent_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_child_id_children_id_fk` FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_consultation_id_consultations_id_fk` FOREIGN KEY (`consultation_id`) REFERENCES `consultations`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clinical_notes` ADD CONSTRAINT `clinical_notes_appointment_id_appointments_id_fk` FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clinical_notes` ADD CONSTRAINT `clinical_notes_doctor_id_doctor_profiles_user_id_fk` FOREIGN KEY (`doctor_id`) REFERENCES `doctor_profiles`(`user_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clinical_notes` ADD CONSTRAINT `clinical_notes_child_id_children_id_fk` FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `doctor_availability_rules` ADD CONSTRAINT `doctor_availability_rules_doctor_id_doctor_profiles_user_id_fk` FOREIGN KEY (`doctor_id`) REFERENCES `doctor_profiles`(`user_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `doctor_profiles` ADD CONSTRAINT `doctor_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `appt_parent_time_idx` ON `appointments` (`parent_id`,`starts_at`);--> statement-breakpoint
CREATE INDEX `appt_child_idx` ON `appointments` (`child_id`,`starts_at`);--> statement-breakpoint
CREATE INDEX `note_child_idx` ON `clinical_notes` (`child_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `availability_doctor_idx` ON `doctor_availability_rules` (`doctor_id`,`weekday`);--> statement-breakpoint
CREATE INDEX `doctor_status_specialty_idx` ON `doctor_profiles` (`status`,`specialty`);--> statement-breakpoint
CREATE INDEX `users_role_idx` ON `users` (`role`);