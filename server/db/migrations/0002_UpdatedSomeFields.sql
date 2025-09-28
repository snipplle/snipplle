ALTER TABLE "collections" ALTER COLUMN "is_public" SET DEFAULT true;--> statement-breakpoint
ALTER TABLE "collections" ALTER COLUMN "files" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "snippets" ALTER COLUMN "path" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "snippets" ALTER COLUMN "files" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "snippets" ADD COLUMN "is_public" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "snippets" DROP COLUMN "visibility";--> statement-breakpoint
DROP TYPE "public"."snippet_visibility";