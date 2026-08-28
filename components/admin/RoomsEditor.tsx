"use client";

import { useActionState, useState, startTransition } from "react";
import {
  addRoomImageAction,
  deleteRoomAction,
  deleteRoomImageAction,
  saveRoomAction,
  type AdminState,
} from "@/app/admin/actions";
import ImagePicker from "./ImagePicker";
import type { Room, RoomSpec } from "@/lib/rooms";
import styles from "../admin.module.css";

/** Blank rows offered on a new room, so there is something to type into. */
const BLANK: RoomSpec[] = [
  { label: "", value: "" },
  { label: "", value: "" },
  { label: "", value: "" },
  { label: "", value: "" },
];

export default function RoomsEditor({
  slug,
  rooms,
  local = false,
}: {
  slug: string;
  rooms: Room[];
  /** Write uploads to public/uploads/ rather than Vercel Blob. */
  local?: boolean;
}) {
  const [adding, setAdding] = useState(false);

  return (
    <section className={styles.section}>
      <h2 className={styles.h2}>Rooms ({rooms.length})</h2>
      <p className={styles.note} style={{ marginBottom: 16 }}>
        Rooms describe the residence. A room price is shown as a detail — the
        stay is always priced from the listing&apos;s nightly rate.
      </p>

      {rooms.map((room) => (
        <RoomCard key={room.id} slug={slug} room={room} local={local} />
      ))}

      {adding ? (
        <RoomCard
          slug={slug}
          room={null}
          local={local}
          onDone={() => setAdding(false)}
        />
      ) : (
        <button
          type="button"
          className={styles.ghost}
          onClick={() => setAdding(true)}
        >
          Add a room
        </button>
      )}
    </section>
  );
}

function RoomCard({
  slug,
  room,
  local,
  onDone,
}: {
  slug: string;
  room: Room | null;
  local: boolean;
  onDone?: () => void;
}) {
  const [state, action, pending] = useActionState<AdminState, FormData>(
    saveRoomAction,
    null
  );

  /* Rows are held in state so the admin can add more than the four offered.
     The action drops any left blank, which is also how one is removed. */
  const [specsEn, setSpecsEn] = useState<RoomSpec[]>(
    room?.specs.en.length ? room.specs.en : BLANK
  );
  const [specsFr, setSpecsFr] = useState<RoomSpec[]>(
    room?.specs.fr.length ? room.specs.fr : BLANK
  );

  return (
    <article className={styles.roomCard}>
      <form className={styles.form} action={action}>
        {room && <input type="hidden" name="id" value={room.id} />}
        <input type="hidden" name="slug" value={slug} />

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Room name (English)</label>
            <input
              className={styles.input}
              name="name_en"
              defaultValue={room?.name.en ?? ""}
              placeholder="Master bedroom"
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Room name (French)</label>
            <input
              className={styles.input}
              name="name_fr"
              defaultValue={room?.name.fr ?? ""}
              placeholder="Chambre principale"
              required
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Price in XAF (optional)</label>
          <input
            className={styles.input}
            name="price"
            type="number"
            min={1}
            step={1}
            defaultValue={room?.price ?? ""}
            placeholder="Leave empty for no price"
            style={{ maxWidth: "14rem" }}
          />
        </div>

        <div className={styles.row}>
          <SpecRows
            title="Details (English)"
            locale="en"
            specs={specsEn}
            setSpecs={setSpecsEn}
          />
          <SpecRows
            title="Details (French)"
            locale="fr"
            specs={specsFr}
            setSpecs={setSpecsFr}
          />
        </div>

        {state?.error && (
          <p className={styles.error} role="alert">
            {state.error}
          </p>
        )}

        <div className={styles.actions}>
          <button className={styles.button} type="submit" disabled={pending}>
            {pending ? "Saving…" : room ? "Save room" : "Create room"}
          </button>
          {onDone && (
            <button type="button" className={styles.ghost} onClick={onDone}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Photographs need a room to belong to, so they only appear once it
          has been created. */}
      {room && <Gallery slug={slug} room={room} local={local} />}

      {room && (
        <form action={deleteRoomAction} style={{ marginTop: 14 }}>
          <input type="hidden" name="id" value={room.id} />
          <input type="hidden" name="slug" value={slug} />
          <button className={`${styles.ghost} ${styles.danger}`} type="submit">
            Delete room
          </button>
        </form>
      )}
    </article>
  );
}

function SpecRows({
  title,
  locale,
  specs,
  setSpecs,
}: {
  title: string;
  locale: "en" | "fr";
  specs: RoomSpec[];
  setSpecs: (specs: RoomSpec[]) => void;
}) {
  return (
    <div className={styles.field}>
      <span className={styles.label}>{title}</span>

      {specs.map((spec, i) => (
        <div className={styles.specRow} key={i}>
          <input
            className={styles.input}
            name={`spec_${locale}_label`}
            defaultValue={spec.label}
            placeholder="Dimensions"
            aria-label={`${title} — label ${i + 1}`}
          />
          <input
            className={styles.input}
            name={`spec_${locale}_value`}
            defaultValue={spec.value}
            placeholder="4.6 × 3.9 m"
            aria-label={`${title} — value ${i + 1}`}
          />
        </div>
      ))}

      <button
        type="button"
        className={styles.tiny}
        onClick={() => setSpecs([...specs, { label: "", value: "" }])}
      >
        + another detail
      </button>
      <p className={styles.note}>Clear both boxes to remove a detail.</p>
    </div>
  );
}

function Gallery({
  slug,
  room,
  local,
}: {
  slug: string;
  room: Room;
  local: boolean;
}) {
  const [state, action] = useActionState<AdminState, FormData>(
    addRoomImageAction,
    null
  );

  return (
    <div className={styles.gallery}>
      <span className={styles.label}>Photographs ({room.images.length})</span>

      <div className={styles.galleryGrid}>
        {room.images.map((image) => (
          <figure className={styles.galleryItem} key={image.id}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={styles.galleryImg} src={image.url} alt="" />
            <form action={deleteRoomImageAction}>
              <input type="hidden" name="room_id" value={room.id} />
              <input type="hidden" name="image_id" value={image.id} />
              <input type="hidden" name="slug" value={slug} />
              <button className={styles.remove} type="submit" aria-label="Remove photograph">
                Remove
              </button>
            </form>
          </figure>
        ))}
      </div>

      {/* Adding one is a single step: pick a file and it saves itself.
          The form data is built here rather than read back out of the DOM —
          submitting the form would race React's commit of the new URL into
          its hidden input, and lose the upload when it lost the race. */}
      <div>
        <ImagePicker
          name="url"
          label="Add a photograph"
          local={local}
          onUploaded={(url) => {
            const data = new FormData();
            data.set("room_id", String(room.id));
            data.set("slug", slug);
            data.set("url", url);
            startTransition(() => action(data));
          }}
        />
        {state?.error && (
          <p className={styles.error} role="alert">
            {state.error}
          </p>
        )}
      </div>
    </div>
  );
}
