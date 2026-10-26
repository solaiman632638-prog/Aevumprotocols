import type { Metadata } from "next";
import { InstallApp } from "@/components/layout/InstallApp";

export const metadata: Metadata = {
  title: "Get the app",
  description: "Install Aevum on your phone or computer. It opens full-screen from your home screen.",
};

const devices = [
  { name: "iPhone and iPad", steps: ["Open aevumperformance.ca in Safari.", "Tap the Share button (the square with an arrow).", "Scroll down and tap Add to Home Screen, then Add."] },
  { name: "Android", steps: ["Open aevumperformance.ca in Chrome.", "Tap Install Aevum above, or open the ⋮ menu and choose Install app."] },
  { name: "Mac", steps: ["In Chrome or Edge: click Install Aevum above, or the install icon at the right of the address bar.", "In Safari: choose File, then Add to Dock."] },
  { name: "Windows", steps: ["In Chrome or Edge: click Install Aevum above, or the install icon at the right of the address bar."] },
];

export default function AppPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-5xl font-light leading-[0.95] tracking-[-0.035em] sm:text-7xl">Get the app</h1>
      <p className="mt-3 max-w-prose text-mute">
        Aevum installs straight from the website. You get an icon on your home screen, it opens full-screen like any
        other app, and your account and data come with it. The App Store version is on its way.
      </p>
      <div className="mt-8">
        <InstallApp page />
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {devices.map((device) => (
          <section key={device.name} className="rounded-3xl border border-rule bg-sheet p-5">
            <h2 className="font-display text-2xl font-light tracking-[-0.02em]">{device.name}</h2>
            <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-mute">
              {device.steps.map((step) => <li key={step}>{step}</li>)}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
