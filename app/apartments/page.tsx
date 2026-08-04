import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { APARTMENTS } from "@/components/apartments-data";
import CloseButton from "@/components/CloseButton";
import styles from "./apartments-page.module.css";

export const metadata: Metadata = {
  title: "Apartments — Odza",
  description: "Every Odza residence currently available.",
};

export default function ApartmentsPage() {
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <CloseButton />

        <p className={styles.eyebrow}>Apartments</p>
        <h1 className={styles.title}>Everything available.</h1>

        <div className={styles.grid}>
          {APARTMENTS.map((flat) => (
            <article className={styles.card} key={flat.slug} id={flat.slug}>
              <Link className={styles.shotLink} href={`/apartments/${flat.slug}`}>
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
              </Link>
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
