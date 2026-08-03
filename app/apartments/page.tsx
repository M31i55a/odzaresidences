import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { APARTMENTS } from "@/components/apartments-data";
import styles from "./apartments-page.module.css";

export const metadata: Metadata = {
  title: "Apartments — Odza",
  description: "Every Odza residence currently available.",
};

export default function ApartmentsPage() {
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        {/* Lands back on the strip they came from, not the top of the page. */}
        <Link className={styles.back} href="/#apartments">
          <svg className={styles.backArrow} viewBox="0 0 16 10" aria-hidden="true">
            <path d="M1 5 H14 M10 1.5 L14 5 L10 8.5" />
          </svg>
          Back to apartments
        </Link>

        <p className={styles.eyebrow}>Apartments</p>
        <h1 className={styles.title}>Everything available.</h1>

        <div className={styles.grid}>
          {APARTMENTS.map((flat) => (
            <article className={styles.card} key={flat.slug} id={flat.slug}>
              <div className={styles.shot}>
                <Image
                  src={flat.src}
                  alt={flat.alt}
                  fill
                  sizes="(max-width: 700px) 100vw, (max-width: 1200px) 45vw, 320px"
                  className={styles.img}
                />
              </div>

              <h2 className={styles.name}>{flat.name}</h2>
              <p className={styles.kind}>{flat.kind}</p>

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
    </main>
  );
}
