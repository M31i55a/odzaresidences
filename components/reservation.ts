import { APARTMENTS, type Apartment } from "./apartments-data";

/* Shared by the form and the Server Action on purpose. The browser checks so
   the visitor gets a fast, friendly answer; the server checks because the
   browser's check is a courtesy and not a guarantee — a Server Action is a
   POST endpoint that anyone can hit directly. One module means the two rules
   can't drift apart, and — now that there is money on the screen — that the
   figure the visitor agreed to is the figure the agency is quoted. */

/** How the visitor chooses to settle: a deposit now, or the whole stay. */
export const PAYMENTS = ["deposit", "full"] as const;
export type Payment = (typeof PAYMENTS)[number];

/** The share of the total that holds a reservation. */
export const DEPOSIT_RATE = 0.3;

export type ReservationField =
  | "slug"
  | "name"
  | "phone"
  | "email"
  | "arrival"
  | "departure"
  | "guests"
  | "payment"
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
  | "badRange"
  | "tooLongStay"
  | "badGuests"
  | "tooManyGuests"
  | "badPayment"
  | "unknownListing";

export type FieldErrors = Partial<Record<ReservationField, ErrorCode>>;

/**
 * What the form gets back from the Server Action. Deliberately narrow — an
 * action's return value is serialised to the browser, so nothing goes in here
 * that the UI won't render, and the submission is never echoed back.
 *
 * `sent` carries the money because the confirmation screen replaces the form:
 * by then the inputs the visitor typed are gone, and the amount they owe has
 * to be the server's arithmetic rather than the browser's anyway.
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
  | {
      status: "sent";
      /** Quoted to the customer and carried on the payment, so a settled
          booking can be matched back to the email the agency was sent. */
      reference: string;
      total: number;
      due: number;
      balance: number;
      /** Paymooney's hosted checkout for this booking. Absent when no payment
          link could be opened, and then the button says so rather than
          pretending — the reservation itself still stands. */
      payUrl?: string;
    };

export const INITIAL_STATE: ReservationState = { status: "idle" };

export const LIMITS = {
  name: 80,
  phone: 30,
  email: 120,
  note: 600,
  /** How far ahead the first night of a stay can be booked. */
  aheadDays: 180,
  /** And how long that stay may run once it starts. */
  stayNights: 90,
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

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Nights between two `YYYY-MM-DD` dates — days, for a listing let by the day.
 * 0 when either date is unusable or the second doesn't come after the first,
 * which is the same "there is no stay here yet" every caller wants.
 *
 * Rounded rather than floored: both ends are local midnight, so a daylight
 * saving boundary between them makes the span 23 or 25 hours and a floor
 * would quietly lose a night. Cameroon doesn't observe it, but the visitor's
 * browser is wherever the visitor is.
 */
export function nightsBetween(arrival: string, departure: string) {
  if (!ISO_DATE.test(arrival) || !ISO_DATE.test(departure)) return 0;

  const local = (iso: string) => {
    const [year, month, day] = iso.split("-").map(Number);
    return new Date(year, month - 1, day).getTime();
  };

  const span = Math.round((local(departure) - local(arrival)) / 86_400_000);
  return span > 0 ? span : 0;
}

/** Beds, or seats when the listing is the hall. */
export function maxGuests(flat: Apartment) {
  return flat.seats ? flat.rooms : Math.max(2, flat.rooms * 2);
}

export type Quote = {
  /** Nights for a residence, days for the hall. */
  units: number;
  rate: number;
  total: number;
  /** What is taken now — the whole total when they chose to pay it. */
  due: number;
  /** And what is left to settle with the agency. */
  balance: number;
};

/**
 * The price of a stay. `null` when the dates don't yet describe one, so the
 * form can simply not render a total rather than render a zero.
 *
 * The listed price is the nightly rate; the hall's is its day rate. Same
 * arithmetic either way — only the word for it changes.
 */
export function quote(
  flat: Apartment,
  arrival: string,
  departure: string,
  payment: Payment
): Quote | null {
  const units = nightsBetween(arrival, departure);
  if (units < 1) return null;

  const total = flat.price * units;
  // Whole XAF: the currency has no subunit anyone actually hands over.
  const due = payment === "full" ? total : Math.round(total * DEPOSIT_RATE);

  return { units, rate: flat.price, total, due, balance: total - due };
}

function guestCount(value: string) {
  // Not `Number()` alone, which reads "3.5", " 3 " and even "" as numbers.
  return /^\d{1,4}$/.test(value) ? Number(value) : null;
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

  /* The slug picks which listing the email names and whose rate the total is
     built from, so it has to be one of ours rather than whatever arrived in
     the request body. */
  const listing = APARTMENTS.find((flat) => flat.slug === input.slug);
  if (!listing) errors.slug = "unknownListing";

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

  if (!input.arrival) errors.arrival = "required";
  else if (!ISO_DATE.test(input.arrival)) errors.arrival = "badDate";
  // Zero-padded ISO dates sort correctly as plain strings, so no Date needed.
  else if (input.arrival < today) errors.arrival = "pastDate";
  else if (input.arrival > shiftIsoDate(today, LIMITS.aheadDays)) {
    errors.arrival = "tooFar";
  }

  if (!input.departure) errors.departure = "required";
  else if (!ISO_DATE.test(input.departure)) errors.departure = "badDate";
  /* Only worth comparing against an arrival that parsed. A malformed arrival
     already carries its own error, and marking the departure wrong as well
     would be blaming the field the visitor got right. */
  else if (!errors.arrival) {
    const nights = nightsBetween(input.arrival, input.departure);
    if (nights < 1) errors.departure = "badRange";
    else if (nights > LIMITS.stayNights) errors.departure = "tooLongStay";
  }

  const guests = guestCount(input.guests);
  if (!input.guests) errors.guests = "required";
  else if (guests === null || guests < 1) errors.guests = "badGuests";
  else if (listing && guests > maxGuests(listing)) {
    errors.guests = "tooManyGuests";
  }

  if (!input.payment) errors.payment = "required";
  else if (!PAYMENTS.includes(input.payment as Payment)) {
    errors.payment = "badPayment";
  }

  if (input.note.length > LIMITS.note) errors.note = "tooLong";

  return errors;
}
