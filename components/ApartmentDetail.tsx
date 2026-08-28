"use client";

import { describe, type Listing, type Room } from "./listing";
import { partsFrom } from "./apartment-rooms";
import RoomGallery from "./RoomGallery";
import TextDrop from "./TextDrop";
import { useT } from "./i18n/locale";
import styles from "./apartment-detail.module.css";

/** One listing, room by room. */
export default function ApartmentDetail({
  listing,
  rooms,
  onReserve,
}: {
  listing: Listing | null;
  rooms: Room[];
  onReserve: (slug: string) => void;
}) {
  const t = useT();

  if (!listing) return null;

  const info = describe(listing, t);
  const parts = partsFrom(rooms, info.name, t);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <div>
            <p className={styles.kind}>{info.kind}</p>
            {/* "mount" — this opens already on screen, so there's no scroll
                to scrub the hinge against. */}
            <TextDrop
              key={info.name}
              as="h2"
              lines={[info.name]}
              className={styles.title}
              trigger="mount"
            />
          </div>

          <dl className={styles.facts}>
            <div className={styles.fact}>
              <dt>{t.apartments.price}</dt>
              <dd className={styles.price}>{info.price}</dd>
            </div>
            <div className={styles.fact}>
              <dt>{t.apartments.rooms}</dt>
              <dd>{info.rooms}</dd>
            </div>
            <div className={styles.fact}>
              <dt>{t.apartments.area}</dt>
              <dd>{info.area}</dd>
            </div>
          </dl>

          <button
            type="button"
            className={styles.reserve}
            onClick={() => onReserve(listing.slug)}
          >
            {t.reserve.cta}
            <svg className={styles.reserveArrow} viewBox="0 0 16 10" aria-hidden="true">
              <path d="M1 5 H14 M10 1.5 L14 5 L10 8.5" />
            </svg>
          </button>
        </header>

        {/* Nothing to show until the admin has given a room a photograph. */}
        {parts.length > 0 && (
          <RoomGallery
            key={listing.slug}
            parts={parts}
            initialId={parts[0].id}
          />
        )}

        {/* Both lines render and the stylesheet picks one. Which is right
            depends on the input device, which the server can't know — reading
            it in JS instead would flash the wrong instruction on first paint. */}
        <p className={`${styles.hint} ${styles.hintPointer}`}>
          {t.apartments.detailHint}
        </p>
        <p className={`${styles.hint} ${styles.hintTouch}`}>
          {t.apartments.detailHintTouch}
        </p>
      </div>
    </div>
  );
}
