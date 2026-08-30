import { MetadataRoute } from "next";
import { storeConfig } from "@/config/store.config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${storeConfig.name} - ${storeConfig.tagline}`,
    short_name: storeConfig.name,
    description: storeConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: storeConfig.theme.primaryColor || "#18181b",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
