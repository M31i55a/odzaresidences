import type { Metadata } from "next";
import { Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";
// Sets `html.lenis { height: auto }`, which has to beat globals.css's
// `html, body { height: 100% }` for Lenis to measure the page correctly.
import "lenis/dist/lenis.css";
import IntroLoader from "@/components/IntroLoader";
import SmoothScroll from "@/components/SmoothScroll";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Odza",
  description: "Warm, handcrafted web experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      {/* SmoothScroll renders first so Lenis exists before any ScrollTrigger
          inside the page builds. Lenis drives the real scroll position rather
          than transforming a wrapper, so no wrapper markup is needed. */}
      <body className="min-h-full bg-walnut font-mono text-cream">
        <SmoothScroll />
        {children}
        <IntroLoader />
      </body>
    </html>
  );
}
