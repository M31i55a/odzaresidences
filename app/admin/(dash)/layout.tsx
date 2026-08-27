import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { signOutAction } from "../actions";
import styles from "@/components/admin.module.css";

/* The guard. Everything inside this route group is behind it; the login page
   sits outside so it can still be reached. Note that this protects rendering
   only — the Server Actions in ../actions.ts check the session again for
   themselves, because an action can be called without this ever running. */
export default async function DashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className={styles.shell}>
      <header className={styles.bar}>
        <span className={styles.brand}>Odza admin</span>
        <nav className={styles.barLinks}>
          <Link href="/admin">Listings</Link>
          <Link href="/admin/listings/new">Add listing</Link>
          <Link href="/" target="_blank">
            View site
          </Link>
          <form action={signOutAction}>
            <button type="submit">Sign out</button>
          </form>
        </nav>
      </header>

      {children}
    </div>
  );
}
