"use client";

import Image from "next/image";
import { APARTMENTS, describe } from "./apartments-data";
import { useT } from "./i18n/locale";
import styles from "./apartments-list.module.css";

/** Every listing. Picking one swaps the overlay over to that apartment. */
export default function ApartmentsList({
  onSelect,
}: {
  onSelect: (slug: string) => void;
}) {
  const t = useT();

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>{t.apartments.eyebrow}</p>
        <h2 className={styles.title}>{t.apartments.listTitle}</h2>

        <div className={styles.grid}>
          {APARTMENTS.map((flat) => {
            const info = describe(flat, t);
            return (
            <article className={styles.card} key={flat.slug}>
              <button
                type="button"
                className={styles.cardButton}
                onClick={() => onSelect(flat.slug)}
              >
                <span className={styles.shot}>
                  <Image
                    src={flat.src}
                    alt={info.alt}
                    fill
                    sizes="(max-width: 700px) 100vw, (max-width: 1200px) 45vw, 320px"
                    className={styles.img}
                  />
                </span>

                <span className={styles.name}>{info.name}</span>
                <span className={styles.kind}>{info.kind}</span>
              </button>

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
            </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
