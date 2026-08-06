"use client";

import { APARTMENTS, describe } from "./apartments-data";
import { DEFAULT_PART_ID, roomsFor } from "./apartment-rooms";
import RoomGallery from "./RoomGallery";
import TextDrop from "./TextDrop";
import { useT } from "./i18n/locale";
import styles from "./apartment-detail.module.css";

/** One listing, room by room. */
export default function ApartmentDetail({ slug }: { slug: string }) {
  const t = useT();

  const index = APARTMENTS.findIndex((item) => item.slug === slug);
  if (index === -1) return null;

  const info = describe(APARTMENTS[index], t);
  const parts = roomsFor(index, info.name, t);

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
        </header>

        <RoomGallery key={slug} parts={parts} initialId={DEFAULT_PART_ID} />

        <p className={styles.hint}>{t.apartments.detailHint}</p>
      </div>
    </div>
  );
}
