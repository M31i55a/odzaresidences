import type { Metadata } from "next";
import PaymentResult from "@/components/PaymentResult";

/* Paymooney's "cancel url" — see the note in ../paid/page.tsx. */
export const metadata: Metadata = {
  title: "Payment cancelled — Odza",
  description: "The payment was cancelled. Nothing has been taken.",
  robots: { index: false, follow: false },
};

export default function Cancelled() {
  return <PaymentResult outcome="cancelled" />;
}
