"use client";

import { useActionState, useId, useState } from "react";
import { requestViewing } from "@/app/actions/reservations";
import { APARTMENTS, describe } from "./apartments-data";
import {
  INITIAL_STATE,
  LIMITS,
  isoDate,
  shiftIsoDate,
  type ErrorCode,
} from "./reservation";
import { useLocale, useT } from "./i18n/locale";
import styles from "./reservation-form.module.css";

/** Request a viewing of one listing. Opened from the detail view. */
export default function ReservationForm({
  slug,
  onBack,
}: {
  slug: string;
  onBack: () => void;
}) {
  const t = useT();
  const locale = useLocale();
  const fieldId = useId();
  const [state, formAction, pending] = useActionState(
    requestViewing,
    INITIAL_STATE
  );

  /* The overlay only ever mounts after a click, so this never renders on the
     server and can't disagree with itself at hydration. */
  const [today] = useState(() => isoDate(new Date()));

  const listing = APARTMENTS.find((flat) => flat.slug === slug);
  if (!listing) return null;

  const info = describe(listing, t);
  const errors = state.status === "invalid" ? state.errors : {};
  const id = (field: string) => `${fieldId}-${field}`;

  const errorFor = (field: keyof typeof errors) => {
    const code = errors[field] as ErrorCode | undefined;
    if (!code) return null;
    return (
      <p className={styles.error} id={id(`${field}-error`)}>
        {t.reserve.errors[code]}
      </p>
    );
  };

  // Wired onto every input so the browser announces and outlines the bad one.
  const invalid = (field: keyof typeof errors) =>
    errors[field]
      ? ({ "aria-invalid": true, "aria-describedby": id(`${field}-error`) } as const)
      : {};

  if (state.status === "sent") {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>{info.name}</p>
          <h2 className={styles.title}>{t.reserve.sentTitle}</h2>
          <p className={styles.sentBody}>{t.reserve.sentBody}</p>

          <button type="button" className={styles.back} onClick={onBack}>
            {t.reserve.back}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>
          {info.name} · {info.kind}
        </p>
        <h2 className={styles.title}>{t.reserve.title}</h2>
        <p className={styles.intro}>{t.reserve.intro}</p>

        <form className={styles.form} action={formAction} noValidate>
          {/* Which listing, and which language to reply in. Both are checked
              again on the server — a hidden input is only a suggestion. */}
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="locale" value={locale} />

          {/* The honeypot. Off-screen, out of the tab order and hidden from
              assistive tech, so no person ever meets it; bots fill every field
              they find and give themselves away. Not `display: none`, which
              the better bots know to skip. */}
          <div className={styles.trap} aria-hidden="true">
            <label htmlFor={id("company")}>Company</label>
            <input
              id={id("company")}
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor={id("name")}>
              {t.reserve.name}
            </label>
            <input
              id={id("name")}
              className={styles.input}
              type="text"
              name="name"
              maxLength={LIMITS.name}
              autoComplete="name"
              required
              {...invalid("name")}
            />
            {errorFor("name")}
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor={id("phone")}>
                {t.reserve.phone}
              </label>
              <input
                id={id("phone")}
                className={styles.input}
                type="tel"
                name="phone"
                maxLength={LIMITS.phone}
                autoComplete="tel"
                inputMode="tel"
                required
                {...invalid("phone")}
              />
              {errorFor("phone")}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor={id("email")}>
                {t.reserve.email}
                <span className={styles.optional}>{t.reserve.optional}</span>
              </label>
              <input
                id={id("email")}
                className={styles.input}
                type="email"
                name="email"
                maxLength={LIMITS.email}
                autoComplete="email"
                {...invalid("email")}
              />
              {errorFor("email")}
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor={id("date")}>
                {t.reserve.date}
              </label>
              {/* The range is enforced again on the server; these just stop the
                  native picker offering days that would be rejected. */}
              <input
                id={id("date")}
                className={styles.input}
                type="date"
                name="date"
                min={today}
                max={shiftIsoDate(today, LIMITS.aheadDays)}
                required
                {...invalid("date")}
              />
              {errorFor("date")}
            </div>

            <fieldset className={styles.field}>
              <legend className={styles.label}>{t.reserve.slot}</legend>
              <div className={styles.slots}>
                {(["morning", "afternoon"] as const).map((slot) => (
                  <label className={styles.slot} key={slot}>
                    <input
                      className={styles.slotInput}
                      type="radio"
                      name="slot"
                      value={slot}
                      defaultChecked={slot === "morning"}
                    />
                    <span className={styles.slotLabel}>{t.reserve[slot]}</span>
                  </label>
                ))}
              </div>
              {errorFor("slot")}
            </fieldset>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor={id("note")}>
              {t.reserve.note}
              <span className={styles.optional}>{t.reserve.optional}</span>
            </label>
            <textarea
              id={id("note")}
              className={`${styles.input} ${styles.note}`}
              name="note"
              rows={3}
              maxLength={LIMITS.note}
              {...invalid("note")}
            />
            {errorFor("note")}
          </div>

          {/* Announced rather than just shown — a failure that only exists as
              a colour is invisible to anyone using a screen reader. */}
          <p className={styles.status} role="status" aria-live="polite">
            {state.status === "failed" && t.reserve.failed}
            {state.status === "throttled" && t.reserve.throttled}
          </p>

          <div className={styles.actions}>
            <button className={styles.submit} type="submit" disabled={pending}>
              {pending ? t.reserve.sending : t.reserve.submit}
            </button>

            <button type="button" className={styles.back} onClick={onBack}>
              {t.reserve.back}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
