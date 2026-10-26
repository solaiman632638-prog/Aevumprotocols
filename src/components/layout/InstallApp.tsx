"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const DISMISS_KEY = "aevum-install-dismissed-2";

type Device = "installed" | "ios" | "mac-safari" | "other";

function device(): Device {
  if (window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true) return "installed";
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
  if (/macintosh/i.test(ua) && /safari/i.test(ua) && !/chrome|chromium|edg|firefox/i.test(ua)) return "mac-safari";
  return "other";
}

const steps: Record<Exclude<Device, "installed">, string> = {
  ios: "In Safari, tap the Share button, then Add to Home Screen.",
  "mac-safari": "In Safari's menu bar, choose File, then Add to Dock.",
  other: "Open your browser's menu and choose Install app or Add to Home Screen. On iPhone, use Safari.",
};

/**
 * "Install Aevum" where the browser supports it, otherwise the steps for this
 * device. Hidden once installed. `page` shows it in full on /app, without "Not now".
 */
export function InstallApp({ page = false }: { page?: boolean }) {
  const [prompt, setPrompt] = useState<InstallEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const snapshot = useSyncExternalStore(
    () => () => undefined,
    () => {
      let stored = "";
      try {
        stored = localStorage.getItem(DISMISS_KEY) ?? "";
      } catch {
        // Storage blocked.
      }
      return `${device()}|${stored}`;
    },
    () => "installed|",
  );
  const [kind, stored] = snapshot.split("|") as [Device, string];

  useEffect(() => {
    const capture = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", capture);
    return () => window.removeEventListener("beforeinstallprompt", capture);
  }, []);

  if (kind === "installed") {
    return page ? <p className="text-mute">You&apos;re using the Aevum app. Nothing more to do.</p> : null;
  }
  if (!page && (stored || dismissed)) return null;

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Storage blocked: hidden for this visit only.
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-pine/40 bg-sheet px-4 py-3 text-sm">
      <p>
        <span className="font-medium">Get the Aevum app.</span>{" "}
        <span className="text-mute">{prompt ? "Opens full-screen from your home screen and works on a bad connection." : steps[kind]}</span>
      </p>
      <div className="flex items-center gap-3">
        {prompt ? (
          <button
            type="button"
            onClick={async () => {
              await prompt.prompt();
              await prompt.userChoice;
              setPrompt(null);
            }}
            className="btn-primary !min-h-0 !px-4 !py-2"
          >
            Install Aevum
          </button>
        ) : null}
        {page ? null : (
          <button type="button" onClick={dismiss} className="text-xs text-mute hover:text-ink">
            Not now
          </button>
        )}
      </div>
    </div>
  );
}
