CREATE TABLE "documents" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"title" text,
	"content" text
);
--> statement-breakpoint
CREATE TABLE "pdf_texts" (
	"id" serial PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
