"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useState } from "react";
import { AnimatePresence, motion, MotionConfig, resize } from "motion/react";
import { syncClient } from "@/lib/sync/client";
import { friendly, MIN_PASSWORD } from "@/lib/sync/errors";

/* Sign-up and sign-in as one animated surface. The password field reveals
 * itself once an email is in, and signing up stacks a verification card on
 * top of the form rather than navigating away.
 *
 * The cards overlay each other, so the container animates to whichever one
 * is showing instead of collapsing to nothing. */

type Mode = "signup" | "login";
type Status = { tone: "ok" | "error"; text: string } | null;

const CARD_VARIANTS = {
  default: { opacity: 1, scale: 1, y: 0 },
  verifying: { opacity: 0.6, scale: 0.95, y: -10 },
};

const VERIFY_VARIANTS = {
  default: { opacity: 0, y: 100 },
  verifying: { opacity: 1, y: 0 },
};

const TEXT_VARIANTS = {
  initial: { opacity: 0, filter: "blur(10px)", y: -10 },
  animate: { opacity: 1, filter: "blur(0px)", y: 0 },
  exit: { opacity: 0, filter: "blur(10px)", y: 10 },
};

function Spinner({ size = 12 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size }}>
      <div className="spinner" style={{ width: size, height: size }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="spinner__bar"
            style={{ transform: `rotate(${i * 30}deg) translate(146%)`, animationDelay: `-${1.2 - i * 0.1}s` }}
          />
        ))}
      </div>
    </div>
  );
}

/** A field that animates in only when it is needed, measuring its own height. */
function ConditionalField({
  open,
  label,
  error,
  hint,
  ...props
}: React.ComponentProps<"input"> & { open: boolean; label: string; error?: string | null; hint?: string }) {
  const [height, setHeight] = useState(0);
  const internalId = useId();
  const id = props.id || internalId;

  const measureRef = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    return resize(el, (_, { height }) => setHeight(height));
  }, []);

  return (
    <motion.div animate={{ height: open ? height : 0 }} style={{ willChange: "height", overflow: "hidden" }}>
      <div ref={measureRef} style={{ position: "relative" }}>
        <AnimatePresence mode="popLayout">
          {open && (
            <motion.div
              key="password-field"
              className="auth__field"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 0 }}
              style={{ marginTop: "0.75rem" }}
            >
              <label htmlFor={id}>{label}</label>
              <input autoFocus {...props} id={id} />
              {error ? <p className="auth__field-error">{error}</p> : hint ? <p className="auth__field-hint">{hint}</p> : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function OTPInput({ length = 6, value, onChange }: { length?: number; value: string; onChange: (code: string) => void }) {
  const activeIndex = Math.min(value.length, length - 1);
  return (
    <div className="otp">
      <input
        className="otp__input"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, length))}
        inputMode="numeric"
        autoComplete="one-time-code"
        aria-label="Verification code"
        autoFocus
      />
      <div className="otp__slots" aria-hidden="true">
        {Array.from({ length }).map((_, i) => (
          <div key={i} className="otp__slot" data-active={i === activeIndex}>
            {value[i] ?? ""}
          </div>
        ))}
      </div>
    </div>
  );
}

function ResendButton({ onResend }: { onResend: () => void }) {
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const id = setInterval(() => setCountdown((prev) => (prev <= 0 ? prev : prev - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <button
      type="button"
      className="resend"
      disabled={countdown > 0}
      onClick={() => {
        onResend();
        setCountdown(30);
      }}
    >
      Didn&apos;t get an email? Resend {countdown > 0 ? `(${countdown})` : ""}
    </button>
  );
}

export function AuthFlow({
  mode,
  onModeChange,
  onRecover,
  onMagicLink,
  onStatus,
}: {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  onRecover: () => void;
  onMagicLink: () => void;
  onStatus: (status: Status) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [cardHeight, setCardHeight] = useState(0);
  const [verifyHeight, setVerifyHeight] = useState(0);
  const [pendingEmail, setPendingEmail] = useState("");

  const measureCard = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    return resize(el, (_, { height }) => setCardHeight(height));
  }, []);

  const measureVerify = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    return resize(el, (_, { height }) => setVerifyHeight(height));
  }, []);

  // Escape backs out of the revealed password field, as in the original flow.
  useEffect(() => {
    if (!showPassword || verifying) return;
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setPassword("");
        setShowPassword(false);
        setFieldError(null);
      }
    };
    window.addEventListener("keyup", handleKeyUp);
    return () => window.removeEventListener("keyup", handleKeyUp);
  }, [showPassword, verifying]);

  function reset() {
    setVerifying(false);
    setCode("");
    setShowCode(false);
    setPassword("");
    setShowPassword(false);
    setFieldError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const supabase = syncClient();
    if (!supabase) return;

    const address = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(address)) {
      return onStatus({ tone: "error", text: "Enter a valid email address." });
    }

    // First pass with an email but no password reveals the password field.
    if (!showPassword) {
      setShowPassword(true);
      return;
    }

    if (mode === "signup" && password.length < MIN_PASSWORD) {
      return setFieldError(`At least ${MIN_PASSWORD} characters.`);
    }

    setFieldError(null);
    setLoading(true);
    onStatus(null);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: address,
          password,
          options: { emailRedirectTo: `${window.location.origin}/account` },
        });
        if (error) throw error;
        if (data.session) {
          onStatus({ tone: "ok", text: "Account created. Your data now syncs." });
        } else {
          // Confirmation is on: Supabase holds the session until the email is confirmed.
          setPendingEmail(address);
          setVerifying(true);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: address, password });
        if (error) throw error;
      }
    } catch (error) {
      onStatus({ tone: "error", text: friendly(error instanceof Error ? error.message : "Something went wrong.") });
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(event: React.FormEvent) {
    event.preventDefault();
    const supabase = syncClient();
    if (!supabase) return;
    if (code.length < 6) return onStatus({ tone: "error", text: "Enter all six digits." });

    setLoading(true);
    onStatus(null);
    const { error } = await supabase.auth.verifyOtp({ email: pendingEmail, token: code, type: "signup" });
    setLoading(false);
    if (error) {
      onStatus({
        tone: "error",
        text: `${friendly(error.message)} If the email only had a link, open that instead.`,
      });
      setCode("");
    }
    // On success the session listener swaps this whole panel for the signed-in view.
  }

  async function handleResend() {
    const supabase = syncClient();
    if (!supabase) return;
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: pendingEmail,
      options: { emailRedirectTo: `${window.location.origin}/account` },
    });
    onStatus(
      error
        ? { tone: "error", text: friendly(error.message) }
        : { tone: "ok", text: `Sent again to ${pendingEmail}.` },
    );
  }

  const signup = mode === "signup";

  return (
    <MotionConfig reducedMotion="user" transition={{ type: "spring", bounce: 0.3, visualDuration: 0.4 }}>
      <motion.div
        animate={verifying ? "verifying" : "default"}
        className="auth__container"
        style={{ height: verifying ? verifyHeight || undefined : cardHeight || undefined }}
      >
        <motion.div ref={measureCard} variants={CARD_VARIANTS} className="auth__card" initial="default">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.h2
              key={signup ? "signup-title" : "login-title"}
              className="auth__card-title font-display"
              variants={TEXT_VARIANTS}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {signup ? "Create your account" : "Welcome back"}
            </motion.h2>
          </AnimatePresence>
          <p className="auth__card-description">
            {signup
              ? "Save your goals and every check-in, on any device."
              : "Log in to pick up where you left off."}
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="auth__field">
              <label htmlFor="auth-email">Email address</label>
              <input
                id="auth-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <ConditionalField
              open={showPassword}
              label="Password"
              name="password"
              id="auth-password"
              type="password"
              required
              autoComplete={signup ? "new-password" : "current-password"}
              placeholder={signup ? "Create a password" : "Your password"}
              value={password}
              error={fieldError}
              hint={signup ? `At least ${MIN_PASSWORD} characters.` : undefined}
              onBlur={({ target }) => setShowPassword(target.value.length > 0)}
              onChange={(event) => {
                setPassword(event.target.value);
                setFieldError(null);
              }}
            />

            <button className="auth__btn auth__btn--primary" type="submit" disabled={loading}>
              {loading ? <Spinner size={12} /> : <span>Continue</span>}
            </button>
          </form>

          <div className="auth__links">
            {signup ? (
              <>
                <button type="button" onClick={() => { reset(); onModeChange("login"); }}>
                  Already have an account? Log in
                </button>
                <span>
                  By creating an account you agree to the{" "}
                  <Link href="/terms">terms</Link> and <Link href="/privacy">privacy policy</Link>.
                </span>
              </>
            ) : (
              <>
                <button type="button" onClick={() => { reset(); onModeChange("signup"); }}>
                  New here? Create an account
                </button>
                <button type="button" onClick={onRecover}>Forgot password?</button>
                <button type="button" onClick={onMagicLink}>Email me a sign-in link instead</button>
              </>
            )}
          </div>
        </motion.div>

        <AnimatePresence mode="popLayout">
          {verifying && (
            <motion.div
              ref={measureVerify}
              className="auth__card auth__card--overlay"
              variants={VERIFY_VARIANTS}
              initial="default"
              animate="verifying"
              exit="default"
            >
              <h2 className="auth__card-title font-display">Check your email</h2>
              <p className="auth__card-description">
                We sent a confirmation link to {pendingEmail}. Open it on this device and
                you are in — this page signs you in by itself.
              </p>

              <p className="auth__waiting">Waiting for you to confirm…</p>
              <ResendButton onResend={handleResend} />

              {showCode ? (
                <form onSubmit={handleVerify} noValidate>
                  <div className="auth__field" style={{ width: "min-content", marginInline: "auto" }}>
                    <OTPInput length={6} value={code} onChange={setCode} />
                  </div>
                  <button className="auth__btn auth__btn--primary" type="submit" disabled={loading}>
                    {loading ? <Spinner size={12} /> : <span>Verify</span>}
                  </button>
                </form>
              ) : (
                <button type="button" className="resend" onClick={() => setShowCode(true)} style={{ marginTop: "0.75rem" }}>
                  My email had a six-digit code instead
                </button>
              )}

              <button className="auth__btn" onClick={reset} type="button" style={{ marginTop: "0.5rem" }}>
                Start over
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <style>{`
        .auth__container {
          position: relative;
          width: 100%;
          max-width: 25rem;
        }
        .auth__card {
          position: absolute;
          inset-inline: 0;
          top: 0;
          padding: 2rem 1.5rem;
          background-color: var(--color-sheet);
          border-radius: 1.5rem;
          transform-origin: top center;
          box-shadow:
            inset 0 1px 0 0 rgb(255 255 255 / 0.04),
            0 4px 14px -10px rgb(0 0 0 / 0.8),
            0 8px 28px -10px rgb(0 0 0 / 0.6),
            0 0 0 1px var(--color-rule);
        }
        .auth__card--overlay { z-index: 10; }
        .auth__card form { margin-top: 1.75rem; }
        .auth__card-title {
          text-align: center;
          font-size: 1.5rem;
          line-height: 1.2;
          font-weight: 300;
          letter-spacing: -0.03em;
        }
        .auth__card-description {
          margin-top: 0.5rem;
          text-align: center;
          font-size: 0.875rem;
          line-height: 1.4;
          color: var(--color-mute);
        }

        .auth__field { display: flex; flex-direction: column; gap: 0.5rem; }
        .auth__field label { font-size: 0.8125rem; font-weight: 500; }
        .auth__field-error { color: var(--color-warn); font-size: 0.75rem; line-height: 1rem; }
        .auth__field-hint { color: var(--color-mute); font-size: 0.75rem; line-height: 1rem; }
        .auth__field input {
          --border-color: var(--color-rule);
          --ring: 0 0 0 0 rgb(0 0 0 / 0);
          width: 100%;
          border-radius: 0.75rem;
          background-color: var(--color-paper);
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          line-height: 1.25rem;
          color: var(--color-ink);
          border: none;
          outline: none;
          box-shadow: 0 0 0 1px var(--border-color), var(--ring);
        }
        .auth__field input::placeholder { color: var(--color-mute); }
        .auth__field input:hover { --border-color: #3d3d3d; }
        .auth__field input:focus-visible {
          --border-color: var(--color-pine);
          --ring: 0 0 0 3px color-mix(in srgb, var(--color-pine) 25%, transparent);
        }

        .auth__btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          position: relative;
          width: 100%;
          min-height: 2.75rem;
          margin-top: 1.5rem;
          border: 0;
          padding: 0 0.75rem;
          background-color: transparent;
          color: var(--color-ink);
          border-radius: 9999px;
          overflow: hidden;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
        }
        .auth__btn::after { content: ""; position: absolute; inset: 0; pointer-events: none; }
        .auth__btn:hover::after { background: rgb(255 255 255 / 0.06); }
        .auth__btn:active::after { background: rgb(255 255 255 / 0.1); }
        .auth__btn[disabled] { cursor: default; opacity: 0.7; }
        .auth__btn--primary {
          background-color: var(--color-pine);
          color: var(--color-on-accent);
        }
        .auth__btn--primary::after { background: linear-gradient(to bottom, rgb(255 255 255 / 0.12), rgb(255 255 255 / 0) 60%); }
        .auth__btn--primary:hover::after { background: rgb(255 255 255 / 0.12); }

        .auth__links {
          margin-top: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          text-align: center;
          font-size: 0.8125rem;
          color: var(--color-mute);
        }
        .auth__links button { background: none; border: 0; color: var(--color-pine-deep); cursor: pointer; font: inherit; }
        .auth__links button:hover { text-decoration: underline; }
        .auth__links a { color: var(--color-pine-deep); text-decoration: underline; text-underline-offset: 2px; }

        .otp { position: relative; width: min-content; }
        .otp__input {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: text;
          border: none;
          background: transparent;
        }
        .otp__slots { display: flex; }
        .otp__slot {
          --border-color: var(--color-rule);
          --ring: 0 0 0 0 rgb(0 0 0 / 0);
          margin-inline-start: -1px;
          position: relative;
          display: flex;
          width: 2.5rem;
          height: 2.75rem;
          align-items: center;
          justify-content: center;
          background-color: var(--color-paper);
          font-size: 1rem;
          font-weight: 500;
          font-variant-numeric: tabular-nums;
          box-shadow: 0 0 0 1px var(--border-color), var(--ring);
        }
        .otp__slot[data-active="true"] {
          --border-color: var(--color-pine);
          --ring: 0 0 0 3px color-mix(in srgb, var(--color-pine) 25%, transparent);
          z-index: 10;
        }
        .otp__slot:first-child { border-start-start-radius: 0.75rem; border-end-start-radius: 0.75rem; margin-inline-start: 0; }
        .otp__slot:last-child { border-start-end-radius: 0.75rem; border-end-end-radius: 0.75rem; }

        .auth__waiting {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.8125rem;
          color: var(--color-mute);
        }
        .auth__waiting::after {
          content: "";
          display: inline-block;
          width: 0.4rem;
          height: 0.4rem;
          margin-left: 0.5rem;
          border-radius: 9999px;
          background: currentColor;
          animation: auth-pulse 1.4s ease-in-out infinite;
        }
        @keyframes auth-pulse {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 1; }
        }

        .resend {
          display: block;
          margin: 0.75rem auto 0;
          border: 0;
          background: none;
          color: var(--color-mute);
          font-size: 0.8125rem;
          font-weight: 500;
          cursor: pointer;
        }
        .resend:hover { color: var(--color-ink); }
        .resend[disabled] { opacity: 0.5; cursor: not-allowed; }

        .spinner { position: relative; top: 50%; left: 50%; }
        .spinner__bar {
          position: absolute;
          background-color: currentColor;
          height: 8%;
          width: 24%;
          left: -10%;
          top: -3.9%;
          border-radius: 6px;
          animation: auth-spinner-fade 1.2s linear infinite;
        }
        @keyframes auth-spinner-fade {
          0% { opacity: 1; }
          100% { opacity: 0.15; }
        }
      `}</style>
    </MotionConfig>
  );
}
