"use client";

import { useActionState, useRef } from "react";
import Link from "next/link";
import {
  saveListingAction,
  setRoomImageAction,
  deleteListingAction,
  type AdminState,
} from "@/app/admin/actions";
import ImagePicker from "./ImagePicker";
import type { Listing, RoomPartId } from "@/lib/listings";
import styles from "../admin.module.css";

const PARTS: RoomPartId[] = ["parlour", "kitchen", "bedroom", "toilet"];

export default function ListingForm({ listing }: { listing: Listing | null }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(
    saveListingAction,
    null
  );

  const existing = listing !== null;

  return (
    <>
      <form className={styles.form} action={action}>
        {/* The slug is the identity. Present only when editing, so a new
            listing gets one derived from its English name instead. */}
        {existing && <input type="hidden" name="slug" value={listing.slug} />}

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name_en">
              Name (English)
            </label>
            <input
              id="name_en"
              className={styles.input}
              name="name_en"
              defaultValue={listing?.name.en ?? ""}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name_fr">
              Name (French)
            </label>
            <input
              id="name_fr"
              className={styles.input}
              name="name_fr"
              defaultValue={listing?.name.fr ?? ""}
              required
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="kind_en">
              Kind (English)
            </label>
            <input
              id="kind_en"
              className={styles.input}
              name="kind_en"
              placeholder="Villa, Studio, Penthouse…"
              defaultValue={listing?.kind.en ?? ""}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="kind_fr">
              Kind (French)
            </label>
            <input
              id="kind_fr"
              className={styles.input}
              name="kind_fr"
              placeholder="Villa, Studio, Penthouse…"
              defaultValue={listing?.kind.fr ?? ""}
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="price">
              Price in XAF, per night
            </label>
            <input
              id="price"
              className={styles.input}
              name="price"
              type="number"
              min={1}
              step={1}
              defaultValue={listing?.price ?? ""}
              required
            />
            {/* The deposit has to clear a single mobile money transaction. */}
            <p className={styles.note}>
              Keep 30% of a typical stay under 500,000 XAF or the deposit won&apos;t
              go through in one Orange Money payment.
            </p>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="area">
              Area
            </label>
            <input
              id="area"
              className={styles.input}
              name="area"
              placeholder="120 m²"
              defaultValue={listing?.area ?? ""}
              required
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="rooms">
              Rooms (or seats)
            </label>
            <input
              id="rooms"
              className={styles.input}
              name="rooms"
              type="number"
              min={1}
              step={1}
              defaultValue={listing?.rooms ?? ""}
              required
            />
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Options</span>

            <label className={styles.check}>
              <input
                type="checkbox"
                name="per_day"
                defaultChecked={listing?.perDay ?? false}
              />
              Charged by the day, not the night
            </label>

            <label className={styles.check}>
              <input
                type="checkbox"
                name="seats"
                defaultChecked={listing?.seats ?? false}
              />
              Counts seats, not rooms
            </label>

            <label className={styles.check}>
              <input
                type="checkbox"
                name="published"
                defaultChecked={listing?.published ?? true}
              />
              Visible on the site
            </label>
          </div>
        </div>

        <ImagePicker
          name="src"
          label="Main photograph"
          value={listing?.src}
        />

        <input
          type="hidden"
          name="position"
          value={listing?.position ?? 999}
        />

        {state?.error && (
          <p className={styles.error} role="alert">
            {state.error}
          </p>
        )}

        <div className={styles.actions}>
          <button className={styles.button} type="submit" disabled={pending}>
            {pending ? "Saving…" : existing ? "Save changes" : "Create listing"}
          </button>
          <Link className={styles.ghost} href="/admin">
            Cancel
          </Link>
        </div>
      </form>

      {/* Room photographs save one at a time and immediately, because they
          key on the slug — which a listing doesn't have until it exists. */}
      {existing && (
        <section className={styles.section} style={{ marginTop: "2.5rem" }}>
          <h2 className={styles.h2}>Room photographs</h2>
          <p className={styles.note} style={{ marginBottom: 14 }}>
            Each one saves as soon as it finishes uploading.
          </p>

          <div className={styles.rooms}>
            {PARTS.map((part) => (
              <RoomImage
                key={part}
                slug={listing.slug}
                part={part}
                value={listing.roomImages[part]}
              />
            ))}
          </div>
        </section>
      )}

      {existing && (
        <section className={styles.section}>
          <h2 className={styles.h2}>Danger</h2>
          <form action={deleteListingAction}>
            <input type="hidden" name="slug" value={listing.slug} />
            <button
              className={`${styles.ghost} ${styles.danger}`}
              type="submit"
            >
              Delete this listing
            </button>
          </form>
          <p className={styles.note} style={{ marginTop: 10 }}>
            Reservations already taken for it are kept — they store their own
            copy of the details.
          </p>
        </section>
      )}
    </>
  );
}

function RoomImage({
  slug,
  part,
  value,
}: {
  slug: string;
  part: RoomPartId;
  value?: string;
}) {
  const [state, action, pending] = useActionState<AdminState, FormData>(
    setRoomImageAction,
    null
  );
  const form = useRef<HTMLFormElement>(null);

  return (
    <form action={action} ref={form}>
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="part" value={part} />

      <ImagePicker
        name="url"
        label={part}
        value={value}
        /* Submitting from the upload callback keeps it to one step — pick a
           file and it saves. Deferred by a microtask so React has committed
           the new URL into the hidden input before the form is read. */
        onUploaded={() => {
          queueMicrotask(() => form.current?.requestSubmit());
        }}
      />

      {pending && <p className={styles.note}>Saving…</p>}
      {state?.error && (
        <p className={styles.error} role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
