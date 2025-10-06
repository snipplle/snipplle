CREATE TABLE "collection_snippets" (
	"collection_id" text NOT NULL,
	"snippet_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "collection_snippets_collection_id_snippet_id_pk" PRIMARY KEY("collection_id","snippet_id")
);
--> statement-breakpoint
ALTER TABLE "collection_snippets" ADD CONSTRAINT "collection_snippets_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_snippets" ADD CONSTRAINT "collection_snippets_snippet_id_snippets_id_fk" FOREIGN KEY ("snippet_id") REFERENCES "public"."snippets"("id") ON DELETE cascade ON UPDATE no action;