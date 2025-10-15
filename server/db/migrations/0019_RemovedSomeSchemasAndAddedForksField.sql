DROP TABLE "collection_snippets" CASCADE;--> statement-breakpoint
DROP TABLE "collection_versions" CASCADE;--> statement-breakpoint
DROP TABLE "snippet_versions" CASCADE;--> statement-breakpoint
DROP TABLE "snippet_forks" CASCADE;--> statement-breakpoint
ALTER TABLE "snippets" ADD COLUMN "forks" integer DEFAULT 0 NOT NULL;