import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { isSignedIn } from "@/lib/admin-auth";

/* Photographs go straight from the browser to Blob storage; this route only
   signs the token that permits it. A Vercel function caps request bodies at
   4.5 MB, and a photograph off a phone is routinely larger, so uploading
   through the server would reject exactly the files the agency wants.

   `onBeforeGenerateToken` is the only gate — without the session check here,
   anyone who finds this URL can fill the store. */

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        if (!(await isSignedIn())) throw new Error("Not signed in.");

        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/avif",
          ],
          /* Never overwrite: two listings can both have a "front.jpg", and a
             blob URL that changes underneath a cached page is the classic way
             to serve last week's picture. */
          addRandomSuffix: true,
        };
      },
      /* Fires from Vercel's side once the file lands. Nothing to do — the URL
         is saved when the admin submits the form, so an abandoned upload
         leaves an orphan blob rather than a half-written listing. */
      onUploadCompleted: async () => {},
    });

    return Response.json(result);
  } catch (error) {
    // 400 rather than 500: this is almost always "not signed in" or a file
    // type we don't accept, and both are the caller's to fix.
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
}
