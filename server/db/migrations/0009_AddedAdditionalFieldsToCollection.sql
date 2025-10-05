ALTER TABLE "collections" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "collections" ADD COLUMN "language" text NOT NULL;--> statement-breakpoint
ALTER TABLE "collections" ADD COLUMN "downloads" integer DEFAULT 0 NOT NULL;