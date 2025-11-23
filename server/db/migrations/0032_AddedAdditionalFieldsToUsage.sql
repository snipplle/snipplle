ALTER TABLE "usages" RENAME COLUMN "snippets" TO "public_snippets";--> statement-breakpoint
ALTER TABLE "usages" RENAME COLUMN "collections" TO "public_collections";--> statement-breakpoint
ALTER TABLE "usages" ADD COLUMN "private_snippets" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "usages" ADD COLUMN "private_collections" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "usages" DROP COLUMN "snippet_versions";