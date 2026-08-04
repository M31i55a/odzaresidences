"use client";

import { useRef } from "react";
import styles from "./text-drop.module.css";
import { dropItemClass, dropRootClass, useDropReveal } from "./use-drop-reveal";

type TextDropProps = {
  /** One entry per line. Line breaks are deliberate — each one hinges alone. */
  lines: string[];
  /** Element to render the copy as. Pick for document outline, not for looks. */
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "div";
  /** Applied to the text element, so callers can override the type scale. */
  className?: string;
  /** "mount" for copy that's already on screen when the page loads. */
  trigger?: "scroll" | "mount";
};

/**
 * The site's reveal for headings and display copy.
 *
 * <TextDrop as="h2" lines={["Your life's changing.", "Find what's next."]} />
 */
export default function TextDrop({
  lines,
  as: Tag = "div",
  className,
  trigger = "scroll",
}: TextDropProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useDropReveal(rootRef, lines.join("\n"), { trigger });

  return (
    <div className={dropRootClass} ref={rootRef}>
      <Tag className={`${styles.text}${className ? ` ${className}` : ""}`}>
        {lines.map((line, i) => (
          <span key={`${i}-${line}`} className={dropItemClass}>
            {line}
          </span>
        ))}
      </Tag>
    </div>
  );
}
