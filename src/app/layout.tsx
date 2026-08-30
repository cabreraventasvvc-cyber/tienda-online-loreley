import type { Metadata, Viewport } from "next";
import "./globals.css";
import { storeConfig } from "@/config/store.config";
import { ThemeProvider } from "@/components/store/ThemeProvider";
import { CartDrawer } from "@/components/store/CartDrawer";
import { FloatingWhatsApp } from "@/components/store/FloatingWhatsApp";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import { InstallPwaBanner } from "@/components/pwa/InstallPwaBanner";

export const viewport: Viewport = {
  themeColor: storeConfig.theme.primaryColor || "#18181b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: `${storeConfig.name} - ${storeConfig.tagline}`,
  description: storeConfig.description,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: storeConfig.name,
  },
  keywords: ["indumentaria", "moda", storeConfig.name, "ropa online", "envios", "whatsapp"],
  icons: {
    icon: storeConfig.faviconUrl || "/favicon.ico",
    apple: "/icon-192.png",
  },
  openGraph: {
    title: `${storeConfig.name} - ${storeConfig.tagline}`,
    description: storeConfig.description,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="min-h-screen flex flex-col antialiased bg-stone-50 text-stone-900 font-sans selection:bg-zinc-900 selection:text-white">
        <ThemeProvider>
          {children}
          <CartDrawer />
          <FloatingWhatsApp />
          <PwaRegister />
          <InstallPwaBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}
