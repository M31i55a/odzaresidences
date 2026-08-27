import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Odza",
  // Never let this near a search index, signed in or not.
  robots: { index: false, follow: false },
};

/* Shell only — deliberately no session check here, because the login page
   lives under /admin too and a guard at this level would redirect it to
   itself forever. The guard is in (dash)/layout.tsx, which wraps every page
   except the login. */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
