import type { Metadata } from "next";
import PaymentResult from "@/components/PaymentResult";

/* Paymooney's "success url", set on the project in their dashboard rather
   than sent with each request — so this path is fixed and must not move. */
export const metadata: Metadata = {
  title: "Payment received — Odza",
  description: "Your reservation payment has been received.",
  // Nothing here belongs in a search index.
  robots: { index: false, follow: false },
};

export default function Paid() {
  return <PaymentResult outcome="paid" />;
}
