/**
 * Where uploaded photographs go.
 *
 * Vercel Blob when a store is configured. Otherwise, in development only,
 * public/uploads/ on this machine — so the admin can be used before there is
 * any cloud storage to point at.
 *
 * Read on the server and handed to the picker as a prop rather than checked
 * in the browser: BLOB_READ_WRITE_TOKEN has no NEXT_PUBLIC_ prefix, so it
 * does not exist client-side, and it must stay that way.
 */
export const localUploads =
  process.env.NODE_ENV !== "production" &&
  !process.env.BLOB_READ_WRITE_TOKEN?.trim();
