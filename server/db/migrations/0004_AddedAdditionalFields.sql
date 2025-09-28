ALTER TABLE "snippets" ADD COLUMN "preview" text;--> statement-breakpoint
ALTER TABLE "snippets" ADD COLUMN "downloads" integer DEFAULT 0 NOT NULL;