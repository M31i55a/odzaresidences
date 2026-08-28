import { notFound } from "next/navigation";
import { getListing, nextPosition } from "@/lib/listings";
import { getRooms } from "@/lib/rooms";
import { localUploads } from "@/lib/uploads";
import ListingForm from "@/components/admin/ListingForm";
import RoomsEditor from "@/components/admin/RoomsEditor";
import styles from "@/components/admin.module.css";

export const dynamic = "force-dynamic";

/** `/admin/listings/new` is the create form; anything else edits that slug. */
export default async function EditListing({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const creating = slug === "new";

  const listing = creating ? null : await getListing(slug);
  if (!creating && !listing) notFound();

  // Rooms hang off a listing, so there are none to show until it exists.
  const rooms = listing ? await getRooms(listing.slug) : [];
  // Shown on the create form so a new residence's place in the running order
  // is visible rather than assigned behind the scenes.
  const nextOrder = creating ? await nextPosition() : undefined;

  return (
    <>
      <section className={styles.section}>
        <h2 className={styles.h2}>
          {listing ? `Edit — ${listing.name.en}` : "New listing"}
        </h2>
        <ListingForm
          listing={listing}
          local={localUploads}
          nextPosition={nextOrder}
        />
      </section>

      {listing && <RoomsEditor slug={listing.slug} rooms={rooms} local={localUploads} />}
    </>
  );
}
