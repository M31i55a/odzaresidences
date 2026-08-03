"use client";

import { useRef, type ReactNode } from "react";
import { dropItemClass, dropRootClass, useDropReveal } from "./use-drop-reveal";

type DropRevealProps = {
  children: ReactNode;
  /** Applied to the hinging element — size and shape the content through it. */
  className?: string;
};

/**
 * The text reveal, applied to anything that isn't text — an image, a card, a
 * figure. Same hinge, same timing, same triggers as <TextDrop />.
 */
export default function DropReveal({ children, className }: DropRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useDropReveal(rootRef);

  return (
    <div className={dropRootClass} ref={rootRef}>
      <div className={`${dropItemClass}${className ? ` ${className}` : ""}`}>
        {children}
      </div>
    </div>
  );
}
