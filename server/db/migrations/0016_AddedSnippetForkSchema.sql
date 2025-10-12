CREATE TABLE "snippet_forks" (
	"id" text PRIMARY KEY NOT NULL,
	"original_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"language" text NOT NULL,
	"path" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "snippet_forks_workspace_id_name_unique" UNIQUE("workspace_id","name")
);
--> statement-breakpoint
DROP TYPE "public"."preview_mode";