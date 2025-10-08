ALTER TABLE "collection_snippets" RENAME COLUMN "collection_id" TO "collection_version_id";--> statement-breakpoint
ALTER TABLE "collection_snippets" RENAME COLUMN "snippet_id" TO "snippet_version_id";--> statement-breakpoint
ALTER TABLE "collection_snippets" DROP CONSTRAINT "collection_snippets_collection_id_collections_id_fk";
--> statement-breakpoint
ALTER TABLE "collection_snippets" DROP CONSTRAINT "collection_snippets_snippet_id_snippets_id_fk";
--> statement-breakpoint
ALTER TABLE "collection_snippets" DROP CONSTRAINT "collection_snippets_collection_id_snippet_id_pk";--> statement-breakpoint
ALTER TABLE "collection_versions" ALTER COLUMN "version" TYPE integer USING "version"::integer;--> statement-breakpoint
ALTER TABLE "collection_snippets" ADD CONSTRAINT "collection_snippets_collection_version_id_snippet_version_id_pk" PRIMARY KEY("collection_version_id","snippet_version_id");--> statement-breakpoint
ALTER TABLE "collection_snippets" ADD CONSTRAINT "collection_snippets_collection_version_id_collection_versions_id_fk" FOREIGN KEY ("collection_version_id") REFERENCES "public"."collection_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_snippets" ADD CONSTRAINT "collection_snippets_snippet_version_id_snippet_versions_id_fk" FOREIGN KEY ("snippet_version_id") REFERENCES "public"."snippet_versions"("id") ON DELETE cascade ON UPDATE no action;