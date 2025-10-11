ALTER TABLE "snippets" ADD COLUMN "path" text;--> statement-breakpoint
ALTER TABLE "snippets" DROP COLUMN "files";--> statement-breakpoint
ALTER TABLE "snippets" DROP COLUMN "preview_mode";