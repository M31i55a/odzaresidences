"use client";

import { useActionState } from "react";
import { signInAction, type AdminState } from "@/app/admin/actions";
import styles from "../admin.module.css";

export default function LoginForm({
  devEmail,
  devPassword,
}: {
  /** Set only while the built-in development credentials are in force. */
  devEmail?: string;
  devPassword?: string;
}) {
  const [state, action, pending] = useActionState<AdminState, FormData>(
    signInAction,
    null
  );

  const isDev = Boolean(devEmail && devPassword);

  return (
    <main className={styles.login}>
      <form className={styles.loginCard} action={action}>
        <h1 className={styles.loginTitle}>Odza admin</h1>

        {isDev && (
          <p className={styles.note}>
            Development only — sign in with <strong>{devEmail}</strong> and{" "}
            <strong>{devPassword}</strong>. Set <code>ADMIN_EMAIL</code> and{" "}
            <code>ADMIN_PASSWORD</code> before deploying; without them the
            admin stays shut in production.
          </p>
        )}

        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className={styles.input}
            type="email"
            name="email"
            autoComplete="username"
            defaultValue={devEmail ?? ""}
            autoFocus
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className={styles.input}
            type="password"
            name="password"
            autoComplete="current-password"
            required
          />
        </div>

        {/* Announced, not just coloured. */}
        {state?.error && (
          <p className={styles.error} role="alert">
            {state.error}
          </p>
        )}

        <button className={styles.button} type="submit" disabled={pending}>
          {pending ? "Checking…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
