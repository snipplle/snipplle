ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_workspace_id_unique";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_workspace_id_workspaces_id_fk";
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "workspace_id";