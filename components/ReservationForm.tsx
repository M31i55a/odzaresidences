"use client";

import { useActionState, useId, useState } from "react";
import { requestReservation } from "@/app/actions/reservations";
import { describe, type Listing } from "./listing";
import {
  DEPOSIT_RATE,
  INITIAL_STATE,
  LIMITS,
  PAYMENTS,
  isoDate,
  maxGuests,
  quote,
  shiftIsoDate,
  type ErrorCode,
  type Payment,
} from "./reservation";
import { useLocale, useT } from "./i18n/locale";
import styles from "./reservation-form.module.css";

/** Reserve one listing for a set of dates. Opened from the detail view. */
export default function ReservationForm({
  listing,
  onBack,
}: {
  listing: Listing | null;
  onBack: () => void;
}) {
  const t = useT();
  const locale = useLocale();
  const fieldId = useId();
  const [state, formAction, pending] = useActionState(
    requestReservation,
    INITIAL_STATE
  );

  /* The overlay only ever mounts after a click, so this never renders on the
     server and can't disagree with itself at hydration. */
  const [today] = useState(() => isoDate(new Date()));

  /* Every field is controlled, dates and money because the total has to move
     as they do — and the rest because React clears an uncontrolled form once
     its action settles. Without this a visitor who mistyped their phone
     number would get the error and an empty form to retype. */
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [arrival, setArrival] = useState("");
  const [departure, setDeparture] = useState("");
  const [guests, setGuests] = useState("2");
  const [payment, setPayment] = useState<Payment>("deposit");
  const [note, setNote] = useState("");

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

  const money = t.apartments.money;
  const percent = Math.round(DEPOSIT_RATE * 100);

  if (state.status === "sent") {
    /* The honeypot answers "sent" with nothing behind it, so there is no bill
       to show a bot and no button to offer it. */
    const owed = state.due > 0;

    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>{info.name}</p>
          <h2 className={styles.title}>{t.reserve.sentTitle}</h2>
          <p className={styles.sentBody}>
            {owed && state.payUrl ? t.reserve.sentBodyPay : t.reserve.sentBody}
          </p>

          {/* The figures come back from the action rather than from the state
              above: the server priced the stay, and by now the inputs that
              would have priced it here are gone. */}
          {owed && (
            <dl className={`${styles.lines} ${styles.sentLines}`}>
              {/* Quote this and the agency can find the booking, whether the
                  customer pays now or rings up about it next week. */}
              <div className={styles.line}>
                <dt>{t.reserve.reference}</dt>
                <dd>{state.reference}</dd>
              </div>
              <div className={styles.line}>
                <dt>{t.reserve.total}</dt>
                <dd>{money(state.total)}</dd>
              </div>
              <div className={`${styles.line} ${styles.lineDue}`}>
                <dt>{t.reserve.dueNow}</dt>
                <dd>{money(state.due)}</dd>
              </div>
              {state.balance > 0 && (
                <div className={styles.line}>
                  <dt>{t.reserve.balance}</dt>
                  <dd>{money(state.balance)}</dd>
                </div>
              )}
            </dl>
          )}

          <div className={styles.actions}>
            {/* Shown only when there is somewhere to pay. A dead button
                carrying the amount reads as a broken site, and it contradicts
                the paragraph above, which already says the agency will
                arrange payment when no link could be opened. The reservation
                stands either way — it is in the agency's inbox. */}
            {owed && state.payUrl && (
              <a className={styles.pay} href={state.payUrl}>
                {t.reserve.pay(money(state.due))}
              </a>
            )}

            <button type="button" className={styles.back} onClick={onBack}>
              {t.reserve.back}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* Nights, unless it's the hall — nobody sleeps in a conference room. */
  const stayLength = (count: number) =>
    listing.perDay ? t.reserve.days(count) : t.reserve.nights(count);

  const seats = listing.seats === true;
  const capacity = maxGuests(listing);

  /* The same arithmetic the action runs, for the same dates. Shown so nobody
     agrees to a figure they only find out afterwards; the server's own copy
     is the one that ends up in the email. `null` until there are two dates
     that make a stay. */
  const price = quote(listing, arrival, departure, payment);

  /* A departure has to land after its arrival, so the second picker starts the
     day after the first and runs as far as a stay is allowed to. The server
     checks all of this again — these bounds only keep the native calendar
     from offering days it would reject. */
  const firstNight = arrival || today;
  const lastNight = shiftIsoDate(firstNight, LIMITS.stayNights);

  const pickArrival = (value: string) => {
    setArrival(value);
    // Moving the arrival past the departure would leave an impossible stay on
    // screen. Clearing it asks for the one field that's now wrong.
    if (value && departure && departure <= value) setDeparture("");
  };

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
              again on the server — a hidden input is only a suggestion, and
              the slug decides whose rate the total is built from. */}
          <input type="hidden" name="slug" value={listing.slug} />
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
              value={name}
              onChange={(event) => setName(event.target.value)}
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
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
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
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                maxLength={LIMITS.email}
                autoComplete="email"
                {...invalid("email")}
              />
              {errorFor("email")}
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor={id("arrival")}>
                {t.reserve.arrival}
              </label>
              <input
                id={id("arrival")}
                className={styles.input}
                type="date"
                name="arrival"
                value={arrival}
                onChange={(event) => pickArrival(event.target.value)}
                min={today}
                max={shiftIsoDate(today, LIMITS.aheadDays)}
                required
                {...invalid("arrival")}
              />
              {errorFor("arrival")}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor={id("departure")}>
                {t.reserve.departure}
              </label>
              <input
                id={id("departure")}
                className={styles.input}
                type="date"
                name="departure"
                value={departure}
                onChange={(event) => setDeparture(event.target.value)}
                min={shiftIsoDate(firstNight, 1)}
                max={lastNight}
                required
                {...invalid("departure")}
              />
              {errorFor("departure")}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor={id("guests")}>
              {seats ? t.reserve.attendees : t.reserve.guests}
              <span className={styles.optional}>{t.reserve.upTo(capacity)}</span>
            </label>
            <input
              id={id("guests")}
              className={`${styles.input} ${styles.guests}`}
              type="number"
              name="guests"
              value={guests}
              onChange={(event) => setGuests(event.target.value)}
              min={1}
              max={capacity}
              step={1}
              inputMode="numeric"
              required
              {...invalid("guests")}
            />
            {errorFor("guests")}
          </div>

          {/* ---------------- what it comes to ---------------- */}
          <section className={styles.summary} aria-live="polite">
            <p className={styles.summaryTitle}>{t.reserve.summary}</p>

            {price ? (
              <dl className={styles.lines}>
                <div className={styles.line}>
                  <dt>
                    {t.reserve.total}
                    <span className={styles.lineNote}>
                      {stayLength(price.units)} × {money(price.rate)}
                    </span>
                  </dt>
                  <dd>{money(price.total)}</dd>
                </div>

                <div className={`${styles.line} ${styles.lineDue}`}>
                  <dt>{t.reserve.dueNow}</dt>
                  <dd>{money(price.due)}</dd>
                </div>

                {price.balance > 0 && (
                  <div className={styles.line}>
                    <dt>{t.reserve.balance}</dt>
                    <dd>{money(price.balance)}</dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className={styles.summaryEmpty}>{t.reserve.pickDates}</p>
            )}
          </section>

          <fieldset className={styles.field}>
            <legend className={styles.label}>{t.reserve.payment}</legend>
            <div className={styles.choices}>
              {PAYMENTS.map((option) => (
                <label className={styles.choice} key={option}>
                  <input
                    className={styles.choiceInput}
                    type="radio"
                    name="payment"
                    value={option}
                    checked={payment === option}
                    onChange={() => setPayment(option)}
                  />
                  <span className={styles.choiceLabel}>
                    {option === "deposit"
                      ? t.reserve.deposit(percent)
                      : t.reserve.full}
                  </span>
                </label>
              ))}
            </div>
            {errorFor("payment")}
          </fieldset>

          {/* Until the payment step exists, saying so here is the honest
              version of a "pay now" button that doesn't take anything. */}
          <p className={`${styles.notice} ${styles.noticeTight}`}>
            {t.reserve.paymentSoon}
          </p>

          <div className={styles.field}>
            <label className={styles.label} htmlFor={id("note")}>
              {t.reserve.note}
              <span className={styles.optional}>{t.reserve.optional}</span>
            </label>
            <textarea
              id={id("note")}
              className={`${styles.input} ${styles.note}`}
              name="note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
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
