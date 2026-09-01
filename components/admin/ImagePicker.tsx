"use client";

import { upload } from "@vercel/blob/client";
import { useRef, useState } from "react";
import styles from "../admin.module.css";

/**
 * Pick a photograph and get back a URL for it.
 *
 * Two routes to storage, decided on the server and passed down as `local`:
 *
 * - Vercel Blob, the real one. The file goes straight from the browser to the
 *   store, because Vercel caps a function's request body at 4.5 MB and a
 *   phone photograph is routinely larger. /api/admin/upload signs the token
 *   after checking the session.
 * - Local disk, when there is no BLOB_READ_WRITE_TOKEN in development. The
 *   file is posted to the server and written under public/uploads/, so the
 *   admin works without a cloud store to test against.
 *
 * The resulting URL is kept in a hidden input, so the surrounding form
 * submits it like any other field and an upload with no save changes nothing.
 */
export default function ImagePicker({
  name,
  label,
  value,
  compact = false,
  local = false,
  onUploaded,
}: {
  name: string;
  label: string;
  value?: string;
  /** Drop the empty frame — for adding to a gallery that already shows its
      pictures. The chosen file still previews once it uploads. */
  compact?: boolean;
  /** Write to public/uploads/ instead of Vercel Blob. Development only. */
  local?: boolean;
  /** Set when the URL should be saved on its own rather than with a form. */
  onUploaded?: (url: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(value ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function choose(file: File) {
    setBusy(true);
    setError("");

    try {
      let uploaded: string;

      if (local) {
        const body = new FormData();
        body.set("file", file);
        const response = await fetch("/api/admin/upload/local", {
          method: "POST",
          body,
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result?.error ?? "The upload failed.");
        uploaded = result.url;
      } else {
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/admin/upload",
        });
        uploaded = blob.url;
      }

      setUrl(uploaded);
      onUploaded?.(uploaded);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The upload failed.");
    } finally {
      setBusy(false);
      // Let the same file be picked again after a failure.
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className={styles.picker}>
      <span className={styles.label}>{label}</span>

      {url ? (
        /* Sources are arbitrary Blob URLs and this is an internal tool, so
           next/image's remote-pattern config would buy nothing here. */
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.preview} src={url} alt="" />
      ) : (
        /* An empty frame only where one is useful — on a listing's main
           photograph, where it shows there isn't one yet. In a gallery the
           pictures are already on screen above, so a second empty box is
           just height. */
        !compact && <p className={styles.emptyPreview}>No photograph yet</p>
      )}

      <input
        ref={input}
        className={styles.file}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        disabled={busy}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) choose(file);
        }}
      />

      <input type="hidden" name={name} value={url} />

      {busy && <p className={styles.note}>Uploading…</p>}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      {/* The address is only worth showing where there is room for it. */}
      {url && !busy && !compact && <p className={styles.note}>{url}</p>}
    </div>
  );
}
