CREATE TABLE "collection_snippets" (
	"collection_id" text NOT NULL,
	"snippet_fork_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "collection_snippets_collection_id_snippet_fork_id_pk" PRIMARY KEY("collection_id","snippet_fork_id")
);
--> statement-breakpoint
ALTER TABLE "collection_snippets" ADD CONSTRAINT "collection_snippets_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_snippets" ADD CONSTRAINT "collection_snippets_snippet_fork_id_snippet_forks_id_fk" FOREIGN KEY ("snippet_fork_id") REFERENCES "public"."snippet_forks"("id") ON DELETE no action ON UPDATE no action;