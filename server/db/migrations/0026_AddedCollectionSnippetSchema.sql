CREATE TABLE "collection_snippets" (
	"collection_id" text NOT NULL,
	"snippet_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "collection_snippets_collection_id_pk" PRIMARY KEY("collection_id")
);
--> statement-breakpoint
ALTER TABLE "collection_snippets" ADD CONSTRAINT "collection_snippets_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_workspace_id_slug_unique" UNIQUE("workspace_id","slug");--> statement-breakpoint
ALTER TABLE "snippets" ADD CONSTRAINT "snippets_workspace_id_slug_unique" UNIQUE("workspace_id","slug");