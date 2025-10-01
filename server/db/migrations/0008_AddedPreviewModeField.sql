CREATE TYPE "public"."preview_mode" AS ENUM('none', 'console', 'full');--> statement-breakpoint
ALTER TABLE "snippets" ADD COLUMN "preview_mode" "preview_mode" DEFAULT 'none' NOT NULL;