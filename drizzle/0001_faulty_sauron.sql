ALTER TABLE "products" ALTER COLUMN "badge" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."badge";--> statement-breakpoint
CREATE TYPE "public"."badge" AS ENUM('new', 'sale', 'exclusive');--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "badge" SET DATA TYPE "public"."badge" USING "badge"::"public"."badge";