"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const DISMISS_KEY = "aevum-install-dismissed";

function installed(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
}

/** "Install Aevum" on Android and desktop Chrome; Add to Home Screen steps on iPhone. Hidden once installed. */
export function InstallApp() {
  const [prompt, setPrompt] = useState<InstallEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const client = useSyncExternalStore(
    () => () => undefined,
    () => {
      try {
        return `${installed()}|${/iphone|ipad|ipod/i.test(navigator.userAgent)}|${localStorage.getItem(DISMISS_KEY) ?? ""}`;
      } catch {
        return `${installed()}|false|`;
      }
    },
    () => "true|false|",
  );
  const [isInstalled, isIos, stored] = client.split("|");

  useEffect(() => {
    const capture = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", capture);
    return () => window.removeEventListener("beforeinstallprompt", capture);
  }, []);

  if (isInstalled === "true" || stored || dismissed || (!prompt && isIos !== "true")) return null;

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
        <span className="text-mute">
          {prompt ? "Opens full-screen from your home screen and works on a bad connection." : "Tap the Share button in Safari, then Add to Home Screen."}
        </span>
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
        <button type="button" onClick={dismiss} className="text-xs text-mute hover:text-ink">
          Not now
        </button>
      </div>
    </div>
  );
}
