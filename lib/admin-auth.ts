import { createHash, createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/* One shared account — an email and a password, both from the environment.
   No user table, no reset flow. The simplest thing that locks the door.

   The cookie holds an expiry, a fingerprint of the credentials in force when
   it was issued, and a signature over both. There is no session store, so
   changing either the email or the password invalidates every session that
   was already open. That is the revoke button.

   If more than one person ever needs in, or you want to know who changed a
   price, this is the file to replace with Auth.js. */

const COOKIE = "odza_admin";
const MAX_AGE_SECONDS = 60 * 60 * 12;

/* On a developer's own machine the admin opens with the values below, so it
   can be looked at without configuring anything. `next build`, `next start`
   and Vercel all set NODE_ENV to production, so this never applies to a
   deployment — preview URLs included. */
const DEV_FALLBACK = process.env.NODE_ENV !== "production";
export const DEV_EMAIL = "admin@odza.local";
export const DEV_PASSWORD = "admin";

const configured = (name: string) => process.env[name]?.trim() ?? "";

const email = () =>
  configured("ADMIN_EMAIL") || (DEV_FALLBACK ? DEV_EMAIL : "");

const password = () =>
  configured("ADMIN_PASSWORD") || (DEV_FALLBACK ? DEV_PASSWORD : "");

/**
 * Key for signing session cookies.
 *
 * Set ADMIN_SESSION_SECRET and that is used. Left unset, one is derived from
 * the credentials — which keeps deployment to two variables, and means the
 * signing key is exactly as strong as the password chosen. Derived or not,
 * changing the password changes the key and drops every open session.
 */
const secret = () => {
  const explicit = configured("ADMIN_SESSION_SECRET");
  if (explicit) return explicit;

  const pair = `${email()}:${password()}`;
  return pair === ":"
    ? ""
    : createHash("sha256").update(`odza-admin-session|${pair}`).digest("hex");
};

/** True while the built-in development credentials are what open the admin. */
export const usingDevCredentials = () =>
  DEV_FALLBACK && !configured("ADMIN_EMAIL") && !configured("ADMIN_PASSWORD");

/** Both must resolve, or the admin refuses to open at all. In production that
    means ADMIN_EMAIL and ADMIN_PASSWORD really are required. */
export const adminConfigured = () => Boolean(email() && password());

const sign = (value: string) =>
  createHmac("sha256", secret()).update(value).digest("base64url");

/** Constant time, length-checked first: timingSafeEqual throws when the two
    buffers differ in length rather than returning false. */
function sameString(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/** Short, stable stamp of the credentials, carried inside the cookie. */
const fingerprint = () =>
  createHash("sha256").update(`${email()}:${password()}`).digest("base64url").slice(0, 12);

/**
 * Both halves are always compared, even when the email is already wrong, so
 * the time taken doesn't reveal which half matched.
 */
export function checkCredentials(inputEmail: string, inputPassword: string) {
  if (!adminConfigured()) return false;

  const emailOk = sameString(inputEmail.trim().toLowerCase(), email().toLowerCase());
  const passwordOk = sameString(inputPassword, password());
  return emailOk && passwordOk;
}

function issue() {
  const expires = String(Date.now() + MAX_AGE_SECONDS * 1000);
  const payload = `${expires}.${fingerprint()}`;
  return `${payload}.${sign(payload)}`;
}

function valid(token: string) {
  const [expires, stamp, mac] = token.split(".");
  if (!expires || !stamp || !mac) return false;
  if (!sameString(mac, sign(`${expires}.${stamp}`))) return false;
  // Credentials changed since this was issued — treat it as signed out.
  if (!sameString(stamp, fingerprint())) return false;
  return Number(expires) > Date.now();
}

export async function signIn() {
  const jar = await cookies();
  jar.set(COOKIE, issue(), {
    httpOnly: true,
    sameSite: "lax",
    // Not `secure` on localhost, or the cookie is dropped over plain http.
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function signOut() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function isSignedIn() {
  if (!adminConfigured()) return false;
  const token = (await cookies()).get(COOKIE)?.value;
  return Boolean(token && valid(token));
}

/**
 * Guard for anything that reads or writes admin data.
 *
 * Called from the protected layout AND from every Server Action. A layout
 * only guards rendering — a Server Action is a POST endpoint that anyone can
 * hit directly, whatever page it was defined on.
 */
export async function requireAdmin() {
  if (!(await isSignedIn())) redirect("/admin/login");
}
