"use server";

import { headers } from "next/headers";
import { APARTMENTS, describe } from "@/components/apartments-data";
import { DICTIONARIES } from "@/components/i18n/dictionary";
import {
  DEPOSIT_RATE,
  isoDate,
  quote,
  validateReservation,
  type Payment,
  type ReservationField,
  type ReservationInput,
  type ReservationState,
} from "@/components/reservation";

/* A reservation. No database: the agency works out of an inbox, so the whole
   feature is "validate it, price it, then email it". Swapping the send for a
   database insert later means changing `deliver` and nothing else.

   Nothing is charged here yet. The visitor picks how they want to settle and
   the amount is quoted and mailed, but no card is taken — the payment step
   goes in between the quote and the send, once a provider is wired up. Until
   then the mail says so in as many words, so nobody in the office reads a
   reservation as money already in the account.

   `requestReservation` is the ONLY export here, and that is a hard rule
   rather than a preference: a `"use server"` file may only export async
   functions. The state type and its initial value live in
   components/reservation.ts — exporting the plain object from here fails at
   runtime with "A 'use server' file can only export async functions, found
   object". */

/* ---------------- rate limiting ----------------
   A fixed window held in memory. Being in memory means it is per-instance and
   it resets on every deploy, so treat it as a speed bump against someone
   holding down the submit button rather than as a wall against a determined
   flood. If this site ever runs more than one instance, move it to Redis
   (Upstash's rate limiter is a drop-in) — the shape of the check stays. */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const seen = new Map<string, number[]>();

function withinRate(key: string) {
  const now = Date.now();
  const fresh = (seen.get(key) ?? []).filter((at) => now - at < WINDOW_MS);

  if (fresh.length >= MAX_PER_WINDOW) {
    seen.set(key, fresh);
    return false;
  }

  fresh.push(now);
  seen.set(key, fresh);

  // Keep the map from growing forever on a long-lived server.
  if (seen.size > 5000) {
    for (const [id, hits] of seen) {
      if (hits.every((at) => now - at >= WINDOW_MS)) seen.delete(id);
    }
  }

  return true;
}

/** Best-effort caller identity. Spoofable, which is fine for a speed bump. */
async function callerKey() {
  const list = await headers();
  const forwarded = list.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || list.get("x-real-ip") || "unknown";
}

/* ---------------- delivery ---------------- */

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char] as string
  );
}

type Delivery = {
  subject: string;
  text: string;
  html: string;
  /** Set only when the visitor left an address, so the agency can hit reply. */
  replyTo?: string;
};

async function deliver({ subject, text, html, replyTo }: Delivery) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.RESERVATIONS_TO;
  const from = process.env.RESERVATIONS_FROM;

  /* Without a key configured there is nowhere to send. In development that
     shouldn't stop anyone working on the form, so the request goes to the
     terminal and the UI carries on as though it sent. In production the same
     situation is a misconfiguration and has to fail loudly — quietly telling
     a customer "we'll be in touch" when nothing was sent is far worse than
     showing them an error. */
  if (!key || !to || !from) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[reservations] RESEND_API_KEY / RESERVATIONS_TO / RESERVATIONS_FROM " +
          "are not set — the request was NOT delivered."
      );
      return false;
    }

    console.info(`[reservations] no mail configured; would have sent:\n${text}`);
    return true;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  if (!response.ok) {
    console.error(
      `[reservations] Resend rejected the send: ${response.status} ${await response.text()}`
    );
    return false;
  }

  return true;
}

/* ---------------- the action ---------------- */

const FIELDS: ReservationField[] = [
  "slug",
  "name",
  "phone",
  "email",
  "arrival",
  "departure",
  "guests",
  "payment",
  "note",
];

function read(form: FormData): ReservationInput {
  const input = {} as ReservationInput;
  for (const field of FIELDS) {
    const value = form.get(field);
    // Anything that isn't a plain string (a file, a missing field) becomes "",
    // so validation sees a consistent shape rather than null | File | string.
    input[field] = typeof value === "string" ? value.trim() : "";
  }
  return input;
}

export async function requestReservation(
  _previous: ReservationState,
  form: FormData
): Promise<ReservationState> {
  /* The honeypot. `company` is off-screen and out of the tab order, so a
     person never fills it in and a bot that fills every field does. Answering
     "sent" rather than an error is the point: a bot that's told it failed
     tries again with a different shape. The figures are zeroed because there
     is no booking behind them. */
  const trap = form.get("company");
  if (typeof trap === "string" && trap.trim()) {
    return { status: "sent", total: 0, due: 0, balance: 0 };
  }

  const input = read(form);

  // The server's own clock — the client's is whatever the visitor set it to.
  const errors = validateReservation(input, isoDate(new Date()));
  if (Object.keys(errors).length > 0) return { status: "invalid", errors };

  if (!withinRate(await callerKey())) return { status: "throttled" };

  /* Resolve the listing from our own data rather than trusting anything in
     the request. Validation proved the slug exists, so this can't miss. The
     agency reads its mail in French; the visitor's own language is recorded
     separately below so they get replied to in it. */
  const listing = APARTMENTS.find((flat) => flat.slug === input.slug)!;
  const fr = DICTIONARIES.fr;
  const info = describe(listing, fr);
  const locale = form.get("locale") === "en" ? "en" : "fr";

  /* Priced here, from our own rate and the dates validation just approved —
     never from a total the browser posted. The form works the same figure out
     for the visitor to look at; this is the one that counts. Validation
     proved the range is a real stay, so this can't be null either. */
  const payment = input.payment as Payment;
  const money = quote(listing, input.arrival, input.departure, payment)!;

  // The hall is booked by the day and seats its guests; the rest are let by
  // the night and sleep them.
  const unit = listing.seats
    ? `${money.units} jour${money.units > 1 ? "s" : ""}`
    : `${money.units} nuit${money.units > 1 ? "s" : ""}`;
  const people = listing.seats ? "Participants" : "Personnes";

  const lines: [string, string][] = [
    ["Résidence", `${info.name} — ${info.kind}`],
    ["Tarif", `${info.price}`],
    ["Surface", info.area],
    ["", ""],
    ["Nom", input.name],
    ["Téléphone", input.phone],
    ["Email", input.email || "—"],
    ["Langue du visiteur", locale === "fr" ? "Français" : "English"],
    ["", ""],
    ["Arrivée", input.arrival],
    ["Départ", input.departure],
    ["Durée", unit],
    [people, input.guests],
    ["", ""],
    ["Total du séjour", fr.apartments.money(money.total)],
    [
      "Règlement choisi",
      payment === "full"
        ? "Paiement intégral"
        : `Acompte ${Math.round(DEPOSIT_RATE * 100)} %`,
    ],
    ["À régler", fr.apartments.money(money.due)],
    ["Solde à l'arrivée", fr.apartments.money(money.balance)],
    /* Loud on purpose. Until the payment step exists, a reservation mail is a
       request for money, not a receipt for it. */
    ["Paiement", "NON ENCAISSÉ — paiement en ligne à venir"],
    ["", ""],
    ["Message", input.note || "—"],
  ];

  const subject = `Réservation — ${info.name} — ${input.arrival} → ${input.departure} (${unit})`;

  const text = lines
    .map(([label, value]) => (label ? `${label}: ${value}` : ""))
    .join("\n");

  /* Every value here came from the form, so it is escaped before going near
     an HTML email. The labels are ours and the listing details come from our
     own data, but escaping the lot is cheaper than remembering which is which
     the next time someone edits this. */
  const html = `<table style="font-family:system-ui,sans-serif;font-size:14px">${lines
    .filter(([label]) => label)
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 16px 4px 0;color:#666">${escapeHtml(
          label
        )}</td><td style="padding:4px 0"><strong>${escapeHtml(
          value
        )}</strong></td></tr>`
    )
    .join("")}</table>`;

  const ok = await deliver({
    subject,
    text,
    html,
    // Validation forbids whitespace in the address, so this can't smuggle a
    // second header in through a newline.
    replyTo: input.email || undefined,
  });

  return ok
    ? {
        status: "sent",
        total: money.total,
        due: money.due,
        balance: money.balance,
      }
    : { status: "failed" };
}
