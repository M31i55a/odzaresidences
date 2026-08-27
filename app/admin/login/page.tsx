import { redirect } from "next/navigation";
import {
  DEV_EMAIL,
  DEV_PASSWORD,
  isSignedIn,
  usingDevCredentials,
} from "@/lib/admin-auth";
import LoginForm from "@/components/admin/LoginForm";

export default async function LoginPage() {
  // Already in — no reason to ask again.
  if (await isSignedIn()) redirect("/admin");

  /* Shown on screen while the development defaults are what open the admin,
     so they can't quietly be mistaken for credentials someone chose. Never
     rendered in production, where the fallback doesn't apply. */
  const dev = usingDevCredentials();

  return (
    <LoginForm
      devEmail={dev ? DEV_EMAIL : undefined}
      devPassword={dev ? DEV_PASSWORD : undefined}
    />
  );
}
