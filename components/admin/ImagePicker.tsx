"use client";

import { upload } from "@vercel/blob/client";
import { useRef, useState } from "react";
import styles from "../admin.module.css";

/**
 * Pick a photograph and put it in Blob storage, straight from the browser.
 *
 * The file never passes through our server — Vercel functions reject bodies
 * over 4.5 MB and phone photographs are routinely bigger. /api/admin/upload
 * only signs a token after checking the admin session.
 *
 * The resulting URL is kept in a hidden input, so the surrounding form
 * submits it like any other field and an upload with no save changes nothing.
 */
export default function ImagePicker({
  name,
  label,
  value,
  onUploaded,
}: {
  name: string;
  label: string;
  value?: string;
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
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
      });
      setUrl(blob.url);
      onUploaded?.(blob.url);
    } catch (cause) {
      // Nearly always a signed-out session or a rejected file type.
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
        <div className={styles.preview} />
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
      {url && !busy && <p className={styles.note}>{url}</p>}
    </div>
  );
}
