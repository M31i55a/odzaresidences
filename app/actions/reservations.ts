"use server";

import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { describe } from "@/components/listing";
import { getListing } from "@/lib/listings";
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

/** Where this site is answering from, so Paymooney can fetch our logo. Read
    from the request rather than configured, so it is right in development,
    on a preview deploy and in production without three different values. */
async function origin() {
  const list = await headers();
  const host = list.get("x-forwarded-host") ?? list.get("host") ?? "";
  const proto =
    list.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return host ? `${proto}://${host}` : "";
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

/**
 * `Odza <reservations@odza.cm>` — one env var in the form every mail client
 * writes — split into the two fields Brevo asks for. A bare address with no
 * name is accepted too, and sends without a display name rather than failing.
 */
function sender(value: string) {
  const match = /^\s*(.*?)\s*<([^>]+)>\s*$/.exec(value);
  if (!match) return { email: value.trim() };

  // `"Odza" <…>` is just as legal a way to write it.
  const name = match[1].replace(/^"|"$/g, "").trim();
  return name ? { name, email: match[2].trim() } : { email: match[2].trim() };
}

async function deliver({ subject, text, html, replyTo }: Delivery) {
  const key = process.env.BREVO_API_KEY;
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
        "[reservations] BREVO_API_KEY / RESERVATIONS_TO / RESERVATIONS_FROM " +
          "are not set — the request was NOT delivered."
      );
      return false;
    }

    console.info(`[reservations] no mail configured; would have sent:\n${text}`);
    return true;
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      /* Brevo's own header, and it is not a bearer token: an
         `Authorization: Bearer …` here is ignored and the call comes back 401
         with nothing to explain why. */
      "api-key": key,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: sender(from),
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
      ...(replyTo ? { replyTo: { email: replyTo } } : {}),
    }),
  });

  /* A send answers 201, a scheduled one 202 — `ok` covers both, so there's no
     status to match exactly. */
  if (!response.ok) {
    console.error(
      `[reservations] Brevo rejected the send: ${response.status} ${await response.text()}`
    );
    return false;
  }

  return true;
}

/* ---------------- payment ----------------
   Paymooney hosts the checkout: we ask for a payment URL, send the customer
   to it, and they enter their Orange Money number or card details on
   Paymooney's side. Nothing sensitive ever reaches this server, which is the
   reason to do it this way round.

   Two things in their documentation are wrong, and both were checked against
   their own WooCommerce plugin, which is the only public code known to work:

   1. The docs require `Authorization: Bearer base64(email:secret_key)`. The
      plugin builds that header and then never passes it to the request — the
      call authenticates on `public_key` in the body alone. The curl example
      in the same docs also sends no header. So none is sent here.
   2. The docs say the parameters are JSON. Every working sample — curl
      `--form`, PHP, Python, the plugin — sends a form body, so that is what
      this sends.

   If Paymooney ever answers 84 ("No project found for this credentials"),
   the header is the first thing to try adding back. */
const PAYMOONEY_ENDPOINT = "https://paymooney.com/api/v1.0/payment_url";

/** Their documented failures, so the log says what went wrong rather than 96. */
const PAYMOONEY_ERRORS: Record<string, string> = {
  "90": "some required fields are not specified",
  "91": "amount is not a numeric value",
  "92": "currency code incorrect",
  "93": "amount outside the range allowed for that currency",
  "94": "email invalid",
  "95": "public_key not found",
  "96": "something wrong — contact Paymooney",
  "97": "item_ref already used",
  "84": "no project found for these credentials",
};

type Checkout = {
  reference: string;
  /** Whole XAF. Paymooney is told the amount actually being collected now. */
  amount: number;
  itemName: string;
  /** Echoed back verbatim on the callback, so the stay travels with the money. */
  description: string;
  input: ReservationInput;
  locale: "fr" | "en";
  origin: string;
};

async function paymentLink(checkout: Checkout) {
  const publicKey = process.env.PAYMOONEY_PUBLIC_KEY?.trim();
  if (!publicKey) {
    /* Said out loud in development too, unlike `deliver`. A missing mail key
       there is harmless — the message goes to the terminal and the form still
       behaves. A missing payment key leaves a disabled button and no
       explanation anywhere, which is a much worse thing to debug in silence. */
    console.error(
      "[paymooney] PAYMOONEY_PUBLIC_KEY is not set — no payment link was " +
        "created, so the Pay button stays disabled. Set it in .env.local for " +
        "local testing, or in the Vercel dashboard for the deployed site."
    );
    return undefined;
  }

  // Their `first_name` / `last_name` are both optional and only decorate the
  // receipt, so a single-word name simply leaves the surname empty.
  const [first, ...rest] = checkout.input.name.split(/\s+/);

  const testing = process.env.PAYMOONEY_MODE?.trim() === "test";

  /* Live, a stay is billed in XAF, which reaches Orange Money and nothing
     else — their table gives card and PayPal USD, CAD and EUR only.

     That makes test mode a dead end left alone: Orange Money is the one
     method XAF can reach, and Paymooney publish no test data for it ("il
     n'existe pas de données de test pour orange"). So in test mode the
     currency and amount are swapped for ones a test CARD can pay, which is
     what makes the whole path — payment page, callback, signature, email —
     exercisable without moving real money.

     Both are ignored unless PAYMOONEY_MODE is exactly "test", so production
     always bills the real amount in XAF. */
  const currency = testing
    ? process.env.PAYMOONEY_TEST_CURRENCY?.trim() || "EUR"
    : "XAF";

  const amount = testing
    ? process.env.PAYMOONEY_TEST_AMOUNT?.trim() || "1"
    : String(checkout.amount);

  if (testing) {
    console.info(
      `[paymooney] TEST MODE — billing ${amount} ${currency} instead of ` +
        `${checkout.amount} XAF for ${checkout.reference}. Pay with a test ` +
        `card (4242 4242 4242 4242). No money moves.`
    );
  }

  const body = new URLSearchParams({
    amount,
    currency_code: currency,
    ccode: "CM",
    lang: checkout.locale,
    item_ref: checkout.reference,
    item_name: checkout.itemName,
    description: checkout.description,
    phone: checkout.input.phone,
    first_name: first ?? "",
    last_name: rest.join(" "),
    public_key: publicKey,
    logo: `${checkout.origin}/odza-logo.png`,
  });

  // Optional for them, but it is how the customer gets their receipt.
  if (checkout.input.email) body.set("email", checkout.input.email);

  /* Their docs are explicit that sending this parameter at all puts the
     payment in test mode, so it must be absent in production rather than set
     to "live". */
  if (testing) body.set("environement", "test");

  let payload: { response?: string; payment_url?: string; error_code?: number | string; message?: string };

  let response: Response;
  let raw: string;

  try {
    response = await fetch(PAYMOONEY_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        // Ask for JSON explicitly, in case the endpoint content-negotiates.
        accept: "application/json",
      },
      body,
    });
    /* Read as text, not `.json()`. Their API sometimes answers with an HTML
       page — an error page, or a firewall challenge — and `.json()` throws a
       parse error that says nothing about what actually came back. The body
       is the only evidence of what went wrong, so it must survive. */
    raw = await response.text();
  } catch (error) {
    // A reservation that can't be paid for online is still a reservation —
    // the agency already has the email, so this must not throw the request away.
    console.error("[paymooney] could not reach the payment API:", error);
    return undefined;
  }

  try {
    payload = JSON.parse(raw);
  } catch {
    console.error(
      `[paymooney] expected JSON for ${checkout.reference} but got ` +
        `${response.status} ${response.headers.get("content-type") ?? "?"} — ` +
        `first 400 characters follow:\n${raw.slice(0, 400)}`
    );
    return undefined;
  }

  if (payload?.response !== "success" || !payload.payment_url) {
    const code = String(payload?.error_code ?? "");
    console.error(
      `[paymooney] no payment link for ${checkout.reference}: ` +
        `${code || "?"} ${PAYMOONEY_ERRORS[code] ?? payload?.message ?? "unknown error"}`
    );
    return undefined;
  }

  return payload.payment_url;
}

/** Unique per attempt — Paymooney rejects a repeated `item_ref` with code 97. */
function reference() {
  return `ODZA-${Date.now().toString(36).toUpperCase()}-${randomUUID()
    .slice(0, 6)
    .toUpperCase()}`;
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
    return { status: "sent", reference: "", total: 0, due: 0, balance: 0 };
  }

  const input = read(form);

  /* Read from the database rather than trusted from the form, and read
     before validation because validation needs it: the rate a stay is priced
     at comes from this row, not from anything the browser sent. */
  const listing = await getListing(input.slug);

  // The server's own clock — the client's is whatever the visitor set it to.
  const errors = validateReservation(input, isoDate(new Date()), listing);
  if (Object.keys(errors).length > 0) return { status: "invalid", errors };

  /* Unreachable — validation rejects a slug with no listing behind it. Said
     out loud anyway so everything below has a listing rather than a maybe. */
  if (!listing) return { status: "invalid", errors: { slug: "unknownListing" } };

  if (!withinRate(await callerKey())) return { status: "throttled" };

  /* The agency reads its mail in French; the visitor's own language is
     recorded separately below so they get replied to in it. */
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

  /* One reference ties the three things together: this email, the payment the
     customer is about to make, and the callback Paymooney sends afterwards.
     There is no database, so it travels with the money instead — Paymooney
     echoes `item_ref` and `description` back on the callback, which is enough
     to rebuild the booking without storing it. */
  const ref = reference();
  const stay = `${info.name} · ${input.arrival} → ${input.departure} · ${unit} · ${input.guests} ${people.toLowerCase()}`;

  const lines: [string, string][] = [
    ["Référence", ref],
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

  /* The email and the payment link are independent of each other, and both
     take a round trip to somebody else's server — so they go together rather
     than one after the other. */
  const [ok, payUrl] = await Promise.all([
    deliver({
      subject,
      text,
      html,
      // Validation forbids whitespace in the address, so this can't smuggle a
      // second header in through a newline.
      replyTo: input.email || undefined,
    }),
    paymentLink({
      reference: ref,
      // What is being collected now — the deposit, or the whole stay.
      amount: money.due,
      itemName: `${info.name} — ${info.kind}`,
      description: stay,
      input,
      locale,
      origin: await origin(),
    }),
  ]);

  /* A missing payment link is not a failed reservation. The agency has the
     request either way, and the confirmation screen falls back to settling by
     phone — which is exactly what it did before any of this existed. */
  return ok
    ? {
        status: "sent",
        reference: ref,
        total: money.total,
        due: money.due,
        balance: money.balance,
        payUrl,
      }
    : { status: "failed" };
}
