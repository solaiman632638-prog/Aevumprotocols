import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aevum",
    short_name: "Aevum",
    id: "/today",
    description: "Daily check-ins, training, supplements, and peptides in one place.",
    start_url: "/today",
    scope: "/",
    orientation: "portrait",
    categories: ["health", "fitness", "lifestyle"],
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    shortcuts: [
      { name: "Today's check-in", short_name: "Today", url: "/today" },
      { name: "Log a workout", short_name: "Training", url: "/train" },
      { name: "Supplements", url: "/supplements" },
    ],
    icons: [
      { src: "/app-icon/192", sizes: "192x192", type: "image/png" },
      { src: "/app-icon/512", sizes: "512x512", type: "image/png" },
      { src: "/app-icon/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
