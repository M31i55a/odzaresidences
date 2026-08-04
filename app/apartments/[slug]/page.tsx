import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CloseButton from "@/components/CloseButton";
import { APARTMENTS } from "@/components/apartments-data";
import { DEFAULT_PART_ID, roomsFor } from "@/components/apartment-rooms";
import RoomGallery from "@/components/RoomGallery";
import TextDrop from "@/components/TextDrop";
import styles from "./apartment-page.module.css";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return APARTMENTS.map((flat) => ({ slug: flat.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const flat = APARTMENTS.find((item) => item.slug === slug);

  if (!flat) return {};

  return {
    title: `${flat.name} — Odza`,
    description: `${flat.kind}. ${flat.rooms}, ${flat.area}, ${flat.price}.`,
  };
}

export default async function ApartmentPage({ params }: PageProps) {
  const { slug } = await params;
  const index = APARTMENTS.findIndex((item) => item.slug === slug);

  if (index === -1) notFound();

  const flat = APARTMENTS[index];
  const parts = roomsFor(index, flat.name);

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <CloseButton />

        <header className={styles.head}>
          <div>
            <p className={styles.kind}>{flat.kind}</p>
            {/* "mount" — this is above the fold, so there's no scroll to
                scrub the hinge against. */}
            <TextDrop
              as="h1"
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

        <RoomGallery parts={parts} initialId={DEFAULT_PART_ID} />

        <p className={styles.hint}>
          Hover the large view for room details — pick a part on the right.
        </p>
      </div>
    </main>
  );
}
