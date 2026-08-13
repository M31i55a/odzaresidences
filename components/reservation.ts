import { APARTMENTS } from "./apartments-data";

/* Shared by the form and the Server Action on purpose. The browser checks so
   the visitor gets a fast, friendly answer; the server checks because the
   browser's check is a courtesy and not a guarantee — a Server Action is a
   POST endpoint that anyone can hit directly. One module means the two rules
   can't drift apart. */

/** The two windows the agency shows properties in. */
export const SLOTS = ["morning", "afternoon"] as const;
export type Slot = (typeof SLOTS)[number];

export type ReservationField =
  | "slug"
  | "name"
  | "phone"
  | "email"
  | "date"
  | "slot"
  | "note";

/* Codes rather than sentences: the server has no idea which language the
   visitor is reading, so the form looks the wording up in the dictionary. */
export type ErrorCode =
  | "required"
  | "tooShort"
  | "tooLong"
  | "badEmail"
  | "badPhone"
  | "badDate"
  | "pastDate"
  | "tooFar"
  | "badSlot"
  | "unknownListing";

export type FieldErrors = Partial<Record<ReservationField, ErrorCode>>;

/**
 * What the form gets back from the Server Action. Deliberately narrow — an
 * action's return value is serialised to the browser, so nothing goes in here
 * that the UI won't render, and the submission is never echoed back.
 *
 * This lives here rather than beside the action because a `"use server"` file
 * may only export async functions. `INITIAL_STATE` is a plain object, so
 * exporting it from there is a runtime error: "A 'use server' file can only
 * export async functions, found object."
 */
export type ReservationState =
  | { status: "idle" }
  | { status: "invalid"; errors: FieldErrors }
  | { status: "throttled" }
  | { status: "failed" }
  | { status: "sent" };

export const INITIAL_STATE: ReservationState = { status: "idle" };

export const LIMITS = {
  name: 80,
  phone: 30,
  email: 120,
  note: 600,
  /** How far ahead a viewing can be booked. */
  aheadDays: 180,
};

export type ReservationInput = Record<ReservationField, string>;

/** `YYYY-MM-DD` in local time. `toISOString()` would shift the day for anyone
    east or west of UTC, which is how "today" becomes "yesterday" at 1am. */
export function isoDate(date: Date) {
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Built from local parts for the same reason — `new Date("2026-08-11")` is
    parsed as UTC midnight, which lands on the 10th for anyone behind it. */
export function shiftIsoDate(iso: string, days: number) {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return isoDate(date);
}

/**
 * Everything wrong with a submission, keyed by field. An empty object means
 * it's good to send.
 *
 * `today` is passed in rather than read here so the caller decides whose clock
 * counts — the visitor's on the client, the server's on the server.
 */
export function validateReservation(
  input: ReservationInput,
  today: string
): FieldErrors {
  const errors: FieldErrors = {};

  // The slug picks which listing the email names, so it has to be one of ours
  // rather than whatever arrived in the request body.
  if (!APARTMENTS.some((flat) => flat.slug === input.slug)) {
    errors.slug = "unknownListing";
  }

  const name = input.name.trim();
  if (!name) errors.name = "required";
  else if (name.length < 2) errors.name = "tooShort";
  else if (name.length > LIMITS.name) errors.name = "tooLong";

  const phone = input.phone.trim();
  const digits = phone.replace(/\D/g, "");
  if (!phone) errors.phone = "required";
  else if (phone.length > LIMITS.phone) errors.phone = "tooLong";
  /* Deliberately loose. 8 digits covers a local Cameroonian number written
     without its country code, 15 is the E.164 ceiling. Anything stricter
     starts rejecting real customers over a space or a dash. */
  else if (digits.length < 8 || digits.length > 15) errors.phone = "badPhone";

  // Optional — plenty of people here would rather be called than emailed.
  const email = input.email.trim();
  if (email) {
    if (email.length > LIMITS.email) errors.email = "tooLong";
    /* Not RFC 5322. A full-fidelity email regex is famously enormous and still
       can't tell you whether the address exists; this only catches typos and,
       importantly, forbids the whitespace that would let someone smuggle a
       header into the reply-to. */
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      errors.email = "badEmail";
    }
  }

  if (!input.date) errors.date = "required";
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) errors.date = "badDate";
  // Zero-padded ISO dates sort correctly as plain strings, so no Date needed.
  else if (input.date < today) errors.date = "pastDate";
  else if (input.date > shiftIsoDate(today, LIMITS.aheadDays)) {
    errors.date = "tooFar";
  }

  if (!input.slot) errors.slot = "required";
  else if (!SLOTS.includes(input.slot as Slot)) errors.slot = "badSlot";

  if (input.note.length > LIMITS.note) errors.note = "tooLong";

  return errors;
}
