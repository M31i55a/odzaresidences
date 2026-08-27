"use client";

import Link from "next/link";
import { useT } from "./i18n/locale";
import styles from "./reservation-form.module.css";

/**
 * Where Paymooney returns the customer once they're done with its checkout.
 *
 * Deliberately says nothing definite about the booking. The redirect only
 * means the customer left Paymooney's page — the callback to
 * app/api/paymooney/notify is what actually confirms money moved, and it
 * arrives on its own schedule. Anyone can type this URL.
 */
export default function PaymentResult({
  outcome,
}: {
  outcome: "paid" | "cancelled";
}) {
  const t = useT();
  const paid = outcome === "paid";

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Odza</p>
        <h1 className={styles.title}>
          {paid ? t.reserve.paidTitle : t.reserve.cancelledTitle}
        </h1>
        <p className={styles.sentBody}>
          {paid ? t.reserve.paidBody : t.reserve.cancelledBody}
        </p>

        <Link className={styles.back} href="/">
          {t.reserve.backHome}
        </Link>
      </div>
    </main>
  );
}
