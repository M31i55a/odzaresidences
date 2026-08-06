"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SiteNav from "./SiteNav";
import { useLocale } from "./i18n/locale";
import styles from "./site-header.module.css";

gsap.registerPlugin(ScrollTrigger);

/** Below this the bar is simply "at the top" and never hides. */
const TOP_THRESHOLD = 90;

type HeaderState = "top" | "shown" | "hidden";

export default function SiteHeader() {
  const headerRef = useRef<HTMLElement>(null);
  const locale = useLocale();

  /* Swapping language changes how tall every block of copy is, which leaves
     every scroll trigger measuring the old layout. Re-measure once React has
     painted the new text. */
  useEffect(() => {
    document.documentElement.lang = locale;
    ScrollTrigger.refresh();
  }, [locale]);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    let current: HeaderState = "top";

    const apply = (next: HeaderState) => {
      if (next === current) return; // don't touch the DOM every frame
      current = next;
      header.dataset.state = next;
    };

    const trigger = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        if (self.scroll() < TOP_THRESHOLD) apply("top");
        // direction is -1 going up, 1 going down
        else apply(self.direction === -1 ? "shown" : "hidden");
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    <header className={styles.header} ref={headerRef} data-state="top">
      {/* Same mask/inner pair the hero copy uses, so the intro loader's
          staggered reveal brings the bar in first. */}
      <div className="line-mask">
        <div className="line-inner" data-line="1">
          <SiteNav />
        </div>
      </div>
    </header>
  );
}
