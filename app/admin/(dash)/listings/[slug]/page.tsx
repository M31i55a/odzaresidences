import { notFound } from "next/navigation";
import { getListing } from "@/lib/listings";
import ListingForm from "@/components/admin/ListingForm";
import styles from "@/components/admin.module.css";

export const dynamic = "force-dynamic";

/** `/admin/listings/new` is the create form; anything else edits that slug. */
export default async function EditListing({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const listing = slug === "new" ? null : await getListing(slug);
  if (slug !== "new" && !listing) notFound();

  return (
    <section className={styles.section}>
      <h2 className={styles.h2}>
        {listing ? `Edit — ${listing.name.en}` : "New listing"}
      </h2>
      <ListingForm listing={listing} />
    </section>
  );
}
