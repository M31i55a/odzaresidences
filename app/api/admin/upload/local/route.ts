import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { isSignedIn } from "@/lib/admin-auth";

/* Development-only upload. Vercel Blob needs BLOB_READ_WRITE_TOKEN, which
   means a cloud store before you can put a picture on a listing; this writes
   the file to public/uploads/ instead so the admin is usable straight away.

   Never in production: a serverless filesystem is per-instance and wiped on
   every deploy, so a file saved here would vanish and take the listing's
   photograph with it. There, Blob is the only path — see ../route.ts. */

const TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
};

const MAX_BYTES = 15 * 1024 * 1024;

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    // Not "forbidden" — in production this route has no reason to exist.
    return Response.json({ error: "Not available." }, { status: 404 });
  }

  if (!(await isSignedIn())) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "No file was sent." }, { status: 400 });
  }

  const extension = TYPES[file.type];
  if (!extension) {
    return Response.json(
      { error: "Only JPEG, PNG, WebP and AVIF images can be uploaded." },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return Response.json(
      { error: `That image is larger than ${MAX_BYTES / 1024 / 1024} MB.` },
      { status: 400 }
    );
  }

  /* The name is generated rather than taken from the upload, so nothing the
     browser sends can steer the write out of this directory — and two photos
     called "front.jpg" can't overwrite each other. */
  const name = `${randomUUID()}${extension}`;
  const directory = join(process.cwd(), "public", "uploads");

  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, name), Buffer.from(await file.arrayBuffer()));

  // Same shape as Vercel Blob's response, so the picker treats both alike.
  return Response.json({ url: `/uploads/${name}` });
}
