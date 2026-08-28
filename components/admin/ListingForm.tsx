"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  saveListingAction,
  deleteListingAction,
  type AdminState,
} from "@/app/admin/actions";
import ImagePicker from "./ImagePicker";
import { FEATURED_COUNT, type Listing } from "../listing";
import styles from "../admin.module.css";

export default function ListingForm({
  listing,
  local = false,
  nextPosition,
}: {
  listing: Listing | null;
  /** Write uploads to public/uploads/ rather than Vercel Blob. */
  local?: boolean;
  /** Where a new listing would land, so the running order isn't a guess. */
  nextPosition?: number;
}) {
  const [state, action, pending] = useActionState<AdminState, FormData>(
    saveListingAction,
    null
  );

  const existing = listing !== null;
  const position = listing?.position ?? nextPosition ?? 0;
  // The home page strip is the first few; the rest wait behind "Visit more".
  const onHomePage = position < FEATURED_COUNT;

  return (
    <>
      <form className={styles.form} action={action}>
        {/* The slug is the identity. Present only when editing, so a new
            listing gets one derived from its English name instead. */}
        {existing && <input type="hidden" name="slug" value={listing.slug} />}

        {/* ---------------- what it is ---------------- */}
        <fieldset className={styles.group}>
          <legend className={styles.groupTitle}>Name</legend>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="name_en">
                English
              </label>
              <input
                id="name_en"
                className={styles.input}
                name="name_en"
                defaultValue={listing?.name.en ?? ""}
                placeholder="Garden Villa"
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="name_fr">
                French
              </label>
              <input
                id="name_fr"
                className={styles.input}
                name="name_fr"
                defaultValue={listing?.name.fr ?? ""}
                placeholder="Villa Jardin"
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

          {existing && (
            <p className={styles.note}>
              Address on the site: <code>{listing.slug}</code>. It comes from
              the English name and never changes, so links keep working.
            </p>
          )}
        </fieldset>

        {/* ---------------- what it costs ---------------- */}
        <fieldset className={styles.group}>
          <legend className={styles.groupTitle}>Price and size</legend>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="price">
                Price in XAF
              </label>
              <input
                id="price"
                className={styles.input}
                name="price"
                type="number"
                min={1}
                step={1}
                defaultValue={listing?.price ?? ""}
                placeholder="145000"
                required
              />
              {/* The deposit has to clear a single mobile money transaction. */}
              <p className={styles.note}>
                Per night, or per day if you tick that below. Keep 30% of a
                typical stay under 500,000 XAF or the deposit won&apos;t go
                through in one Orange Money payment.
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
                placeholder="340 m²"
                defaultValue={listing?.area ?? ""}
                required
              />

              <label className={styles.label} htmlFor="rooms">
                Rooms
              </label>
              <input
                id="rooms"
                className={styles.input}
                name="rooms"
                type="number"
                min={1}
                step={1}
                defaultValue={listing?.rooms ?? ""}
                placeholder="6"
                required
              />
              <p className={styles.note}>
                The figure shown on the card. It also sets how many guests may
                book — twice the rooms, or exactly this many for a hall.
              </p>
            </div>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Unusual cases</span>
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
              Counts seats rather than rooms — a hall, not a home
            </label>
          </div>
        </fieldset>

        {/* ---------------- how it looks ---------------- */}
        <fieldset className={styles.group}>
          <legend className={styles.groupTitle}>Photograph</legend>
          <ImagePicker
            name="src"
            label="Shown on the card and above the residence"
            value={listing?.src}
            local={local}
          />
        </fieldset>

        {/* ---------------- where it appears ---------------- */}
        <fieldset className={styles.group}>
          <legend className={styles.groupTitle}>Where it appears</legend>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="position">
                Order
              </label>
              <input
                id="position"
                className={styles.input}
                name="position"
                type="number"
                min={0}
                step={1}
                defaultValue={position}
                style={{ maxWidth: "8rem" }}
              />
              {/* Exactly what went wrong before: new listings were given a
                  hidden 999 and quietly landed past the strip. */}
              <p className={styles.note}>
                Lowest first. The home page shows only the first{" "}
                {FEATURED_COUNT} — anything after that is still on the site,
                behind <strong>Visit more</strong>.
              </p>
            </div>

            <div className={styles.field}>
              <span className={styles.label}>Visibility</span>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  name="published"
                  defaultChecked={listing?.published ?? true}
                />
                Visible on the site
              </label>

              <p className={`${styles.note} ${onHomePage ? "" : styles.warn}`}>
                {onHomePage
                  ? `At ${position}, this one shows on the home page.`
                  : `At ${position}, this one falls past the first ${FEATURED_COUNT}, so it will NOT be on the home page. Lower the order to bring it forward.`}
              </p>
            </div>
          </div>
        </fieldset>

        {/* Only when creating. An existing listing already has whatever rooms
            it has, and adding four more on every save would be a surprise. */}
        {!existing && (
          <fieldset className={styles.group}>
            <legend className={styles.groupTitle}>Rooms</legend>
            <label className={styles.check}>
              <input type="checkbox" name="standard_rooms" defaultChecked />
              Start with the usual four — parlour, kitchen, bedroom, toilet
            </label>
            <p className={styles.note}>
              You can rename them, add more, or remove them afterwards. Without
              this the residence starts with no rooms and its detail view stays
              empty until you add some.
            </p>
          </fieldset>
        )}

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
            Its rooms and photographs go with it. Reservations already taken
            are kept — they store their own copy of the details.
          </p>
        </section>
      )}
    </>
  );
}
