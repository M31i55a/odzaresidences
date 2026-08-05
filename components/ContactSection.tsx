"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CONTACT, SOCIALS } from "./contact-data";
import styles from "./contact-section.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>(`.${styles.hinge}`);

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(items, { rotateX: 0 });
        return;
      }

      // Per-element perspective, as everywhere else — the column is tall enough
      // that a shared vanishing point would skew the outer rows.
      gsap.set(items, {
        transformPerspective: 2000,
        transformOrigin: "50% 0",
      });

      items.forEach((item) => {
        gsap.fromTo(
          item,
          { rotateX: -120 },
          {
            rotateX: 0,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: item,
              start: "bottom bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.section} id="contact" ref={sectionRef}>
      <div className={styles.inner}>
        <div>
          <p className={`${styles.eyebrow} ${styles.hinge}`}>Contact</p>
          <h2 className={`${styles.title} ${styles.hinge}`}>
            Come and grab the keys.
          </h2>

          <a className={`${styles.mail} ${styles.hinge}`} href={`mailto:${CONTACT.email}`}>
            {CONTACT.email}
          </a>
        </div>

        <dl className={styles.details}>
          <div className={`${styles.row} ${styles.hinge}`}>
            <dt>Office</dt>
            <dd>
              {CONTACT.address.map((line) => (
                <span className={styles.line} key={line}>
                  {line}
                </span>
              ))}
            </dd>
          </div>

          <div className={`${styles.row} ${styles.hinge}`}>
            <dt>Phone</dt>
            <dd>
              <a className={styles.rowLink} href={`tel:${CONTACT.phoneHref}`}>
                {CONTACT.phone}
              </a>
            </dd>
          </div>

          <div className={`${styles.row} ${styles.hinge}`}>
            <dt>Hours</dt>
            <dd>
              {CONTACT.hours.map((line) => (
                <span className={styles.line} key={line}>
                  {line}
                </span>
              ))}
            </dd>
          </div>

          <div className={`${styles.row} ${styles.hinge}`}>
            <dt>Social</dt>
            <dd className={styles.socials}>
              {SOCIALS.map((social) => (
                <a className={styles.rowLink} href={social.href} key={social.label}>
                  {social.label}
                </a>
              ))}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
