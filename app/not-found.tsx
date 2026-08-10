import type { Metadata } from "next";
import NotFoundView from "@/components/NotFoundView";

export const metadata: Metadata = {
  title: "Page not found — Odza",
  description: "That page has moved, or was never here.",
};

export default function NotFound() {
  return <NotFoundView />;
}
