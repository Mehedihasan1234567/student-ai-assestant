import { createUploadthing, type FileRouter } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  notesUploader: f({ pdf: { maxFileSize: "16MB" } })
    .onUploadComplete(async ({ file }) => {
      console.log("Upload complete!");
      console.log("File URL:", file.url);
      return { fileUrl: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
