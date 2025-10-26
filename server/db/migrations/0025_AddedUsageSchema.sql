CREATE TABLE "usages" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"snippets" integer DEFAULT 0 NOT NULL,
	"snippet_versions" integer DEFAULT 0 NOT NULL,
	"collections" integer DEFAULT 0 NOT NULL,
	"team_members" integer DEFAULT 0 NOT NULL,
	"ai_requests" integer DEFAULT 0 NOT NULL,
	"ai_tokens" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "usages" ADD CONSTRAINT "usages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;