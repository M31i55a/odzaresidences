import { headers } from "next/headers";
import { verifySignToken } from "../md5-crypt";

/* Paymooney's IPN — the only trustworthy word on whether money actually
   moved. The customer being redirected back to the success page proves
   nothing: they can close the tab, and the URL can be typed by anyone. This
   is where a payment becomes real.

   Their own WooCommerce plugin reads the callback and never checks the
   signature, which means anything that can POST to the notify URL can mark
   an order paid. This does check it. */

/** Documented source of their callbacks. */
const PAYMOONEY_IP = "85.236.153.138";

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

/* A near-copy of the sender in the reservation action rather than a shared
   module: that one is inside a `"use server"` file, which may only export
   async actions, so it cannot be imported here. Worth revisiting if a third
   caller ever appears. */
async function mail(subject: string, text: string, html: string) {
  const key = process.env.BREVO_API_KEY;
  const to = process.env.RESERVATIONS_TO;
  const from = process.env.RESERVATIONS_FROM;

  if (!key || !to || !from) {
    console.error(`[paymooney] mail is not configured; unsent:\n${text}`);
    return;
  }

  const match = /^\s*(.*?)\s*<([^>]+)>\s*$/.exec(from);
  const sender = match
    ? { name: match[1].replace(/^"|"$/g, "").trim(), email: match[2].trim() }
    : { email: from.trim() };

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": key,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender,
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    }),
  });

  if (!response.ok) {
    console.error(
      `[paymooney] Brevo rejected the receipt: ${response.status} ${await response.text()}`
    );
  }
}

/**
 * Read the callback whichever way it arrives.
 *
 * Their docs describe a JSON body; their plugin reads `$_POST["status"]`,
 * which only works for a form body. Rather than bet on one, this accepts
 * both — the cost is a few lines and the alternative is silently dropping
 * every payment if they are inconsistent, or change.
 */
async function fields(request: Request): Promise<Record<string, string>> {
  const type = request.headers.get("content-type") ?? "";
  const raw = await request.text();
  if (!raw) return {};

  if (type.includes("application/json")) {
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      return Object.fromEntries(
        Object.entries(parsed).map(([k, v]) => [k, v == null ? "" : String(v)])
      );
    } catch {
      return {};
    }
  }

  const form = Object.fromEntries(new URLSearchParams(raw));
  // A JSON body sent without the matching content-type would parse as one
  // long useless key, so fall back on the shape rather than on the header.
  if (Object.keys(form).length <= 1 && raw.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      return Object.fromEntries(
        Object.entries(parsed).map(([k, v]) => [k, v == null ? "" : String(v)])
      );
    } catch {
      return {};
    }
  }
  return form;
}

export async function POST(request: Request) {
  const privateKey = process.env.PAYMOONEY_PRIVATE_KEY?.trim();
  if (!privateKey) {
    console.error(
      "[paymooney] PAYMOONEY_PRIVATE_KEY is not set — a callback arrived and " +
        "could not be verified, so it was ignored."
    );
    // 500, not 200: this is our misconfiguration, and their dashboard offers
    // a manual resend for callbacks that failed. Let it be retryable.
    return new Response("not configured", { status: 500 });
  }

  const data = await fields(request);
  const signToken = data.sign_token ?? "";

  if (!signToken || !verifySignToken(privateKey, signToken)) {
    console.error(
      `[paymooney] REJECTED a callback with a bad signature (ref ${
        data.item_ref || "?"
      }). Nothing was recorded.`
    );
    return new Response("bad signature", { status: 403 });
  }

  /* The signature is the real check — it proves possession of the private
     key. The documented source address is logged rather than enforced: it is
     one hard-coded IP in a third party's docs, and the day they add a server
     an enforced check would silently swallow every payment. */
  const list = await headers();
  const from = list.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (from && from !== PAYMOONEY_IP) {
    console.warn(
      `[paymooney] callback signed correctly but came from ${from}, not the ` +
        `documented ${PAYMOONEY_IP}.`
    );
  }

  const paid = data.status === "Success";
  const ref = data.item_ref || data.ref_payment || "—";

  /* Test-mode payments move no money. They are still worth an email while
     wiring this up, but they must not read like a real one. */
  const test = data.environement === "test";
  const prefix = test ? "[TEST] " : "";

  const rows: [string, string][] = [
    ["Référence", ref],
    ["Statut", paid ? "PAIEMENT REÇU" : "Échec ou annulation"],
    ["Séjour", data.description || "—"],
    ["Résidence", data.item_name || "—"],
    ["", ""],
    ["Montant", `${data.amount || "?"} ${data.currency || ""}`.trim()],
    ["Encaissé", `${data.amount_received || "?"} ${data.currency || ""}`.trim()],
    ["Frais", data.fees || "—"],
    ["Opérateur", data.operator || "—"],
    ["N° de transaction", data.transaction_number || "—"],
    ["", ""],
    ["Client", data.name || "—"],
    ["Email", data.email || "—"],
    ["Téléphone", data.phone || data.Phone || "—"],
    ["Mode", test ? "TEST — aucun argent déplacé" : "Production"],
  ];

  if (!paid) {
    rows.push(["", ""]);
    rows.push(["Erreur", `${data.error_code || ""} ${data.error_message || ""}`.trim() || "—"]);
  }

  const text = rows
    .map(([label, value]) => (label ? `${label}: ${value}` : ""))
    .join("\n");

  const html = `<table style="font-family:system-ui,sans-serif;font-size:14px">${rows
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

  await mail(
    `${prefix}${paid ? "Paiement reçu" : "Paiement échoué"} — ${ref}`,
    text,
    html
  );

  console.info(
    `[paymooney] ${paid ? "paid" : "failed"} ${ref}` + (test ? " (test)" : "")
  );

  /* 200 whatever the payment did — the notification was received and handled,
     which is the only thing this status answers. A non-2xx here would have
     them retry a payment we have already recorded. */
  return new Response("ok", { status: 200 });
}
