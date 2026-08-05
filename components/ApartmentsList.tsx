"use client";

import Image from "next/image";
import { APARTMENTS } from "./apartments-data";
import styles from "./apartments-list.module.css";

/** Every listing. Picking one swaps the overlay over to that apartment. */
export default function ApartmentsList({
  onSelect,
}: {
  onSelect: (slug: string) => void;
}) {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Apartments</p>
        <h2 className={styles.title}>Everything available.</h2>

        <div className={styles.grid}>
          {APARTMENTS.map((flat) => (
            <article className={styles.card} key={flat.slug}>
              <button
                type="button"
                className={styles.cardButton}
                onClick={() => onSelect(flat.slug)}
              >
                <span className={styles.shot}>
                  <Image
                    src={flat.src}
                    alt={flat.alt}
                    fill
                    sizes="(max-width: 700px) 100vw, (max-width: 1200px) 45vw, 320px"
                    className={styles.img}
                  />
                </span>

                <span className={styles.name}>{flat.name}</span>
                <span className={styles.kind}>{flat.kind}</span>
              </button>

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
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
