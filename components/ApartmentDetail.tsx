"use client";

import { APARTMENTS } from "./apartments-data";
import { DEFAULT_PART_ID, roomsFor } from "./apartment-rooms";
import RoomGallery from "./RoomGallery";
import TextDrop from "./TextDrop";
import styles from "./apartment-detail.module.css";

/** One listing, room by room. */
export default function ApartmentDetail({ slug }: { slug: string }) {
  const index = APARTMENTS.findIndex((item) => item.slug === slug);
  if (index === -1) return null;

  const flat = APARTMENTS[index];
  const parts = roomsFor(index, flat.name);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <div>
            <p className={styles.kind}>{flat.kind}</p>
            {/* "mount" — this opens already on screen, so there's no scroll
                to scrub the hinge against. */}
            <TextDrop
              as="h2"
              lines={[flat.name]}
              className={styles.title}
              trigger="mount"
            />
          </div>

          <dl className={styles.facts}>
            <div className={styles.fact}>
              <dt>Price</dt>
              <dd className={styles.price}>{flat.price}</dd>
            </div>
            <div className={styles.fact}>
              <dt>Rooms</dt>
              <dd>{flat.rooms}</dd>
            </div>
            <div className={styles.fact}>
              <dt>Area</dt>
              <dd>{flat.area}</dd>
            </div>
          </dl>
        </header>

        <RoomGallery
          key={slug}
          parts={parts}
          initialId={DEFAULT_PART_ID}
        />

        <p className={styles.hint}>
          Hover the large view for room details — pick a part on the right.
        </p>
      </div>
    </div>
  );
}
