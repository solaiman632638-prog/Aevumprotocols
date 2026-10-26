import type { CapacitorConfig } from "@capacitor/cli";

/**
 * The App Store and Play Store apps. They load the live site, so every push
 * to main updates the apps too; the native shell adds Apple Health / Health
 * Connect. `mobile/` is only the screen shown if the site cannot be reached.
 */
const config: CapacitorConfig = {
  appId: "ca.aevumperformance.app",
  appName: "Aevum",
  webDir: "mobile",
  backgroundColor: "#000000",
  server: {
    url: "https://www.aevumperformance.ca/today",
    errorPath: "index.html",
  },
  ios: { contentInset: "never" },
};

export default config;
