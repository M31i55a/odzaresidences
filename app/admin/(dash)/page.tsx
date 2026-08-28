import Link from "next/link";
import { getAllListings } from "@/lib/listings";
import { hasDatabase } from "@/lib/db";
import styles from "@/components/admin.module.css";

/* Always fresh — an admin that shows yesterday's prices is worse than a slow
   one, and this page is seen by one person a few times a day. */
export const dynamic = "force-dynamic";

export default async function AdminHome() {
  if (!hasDatabase) return <NoDatabase />;

  const listings = await getAllListings();

  return (
    <>
      <section className={styles.section}>
        <h2 className={styles.h2}>Listings ({listings.length})</h2>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th />
                <th>Name</th>
                <th>Price</th>
                <th>Rooms</th>
                <th>Area</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing.slug}>
                  <td>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className={styles.thumb} src={listing.src} alt="" />
                  </td>
                  <td>
                    <Link href={`/admin/listings/${listing.slug}`}>
                      {listing.name.en}
                    </Link>
                    <br />
                    <span style={{ opacity: 0.45 }}>{listing.kind.en}</span>
                  </td>
                  <td>
                    {listing.price.toLocaleString("en-US")} XAF
                    <br />
                    <span style={{ opacity: 0.45 }}>
                      per {listing.perDay ? "day" : "night"}
                    </span>
                  </td>
                  <td>
                    {listing.rooms} {listing.seats ? "seats" : "rooms"}
                  </td>
                  <td>{listing.area}</td>
                  <td>
                    <span
                      className={`${styles.pill} ${
                        listing.published ? styles.pillOk : styles.pillOff
                      }`}
                    >
                      {listing.published ? "live" : "hidden"}
                    </span>
                  </td>
                  {/* The name is a link too, but a named action is easier to
                      find than a link that looks like a heading. */}
                  <td>
                    <Link
                      className={styles.rowAction}
                      href={`/admin/listings/${listing.slug}`}
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {listings.length === 0 && (
            <p className={styles.empty}>
              No listings yet. Run <code>db/seed.sql</code> to load the ten the
              site shipped with, or add one.
            </p>
          )}
        </div>

        <div className={styles.actions}>
          <Link className={styles.button} href="/admin/listings/new">
            Add listing
          </Link>
        </div>
      </section>
    </>
  );
}

function NoDatabase() {
  return (
    <section className={styles.section}>
      <h2 className={styles.h2}>No database connected</h2>
      <p className={styles.note} style={{ maxWidth: "60ch", lineHeight: 1.8 }}>
        <code>DATABASE_URL</code> isn&apos;t set, so there are no listings to
        manage yet.
        <br />
        <br />
        1. Vercel dashboard → Storage → Marketplace → <strong>Neon</strong>,
        and connect it to this project.
        <br />
        2. <code>vercel env pull</code> to bring the URL into{" "}
        <code>.env.local</code>.
        <br />
        3. <code>psql &quot;$DATABASE_URL&quot; -f db/schema.sql</code>
        <br />
        4. <code>psql &quot;$DATABASE_URL&quot; -f db/seed.sql</code>
        <br />
        <br />
        Then restart the dev server.
      </p>
    </section>
  );
}
