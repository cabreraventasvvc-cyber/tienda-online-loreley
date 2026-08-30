"use client";

import React, { useEffect } from "react";
import { storeConfig } from "@/config/store.config";
import { useCartStore } from "@/store/useCartStore";

/**
 * Inyecta dinámicamente las variables de color del tema configurado en el documento
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    const { theme } = storeConfig;

    root.style.setProperty("--color-primary", theme.primaryColor);
    root.style.setProperty("--color-primary-hover", theme.primaryHover);
    root.style.setProperty("--color-primary-light", theme.primaryLight);
    root.style.setProperty("--color-secondary", theme.secondaryColor);
    root.style.setProperty("--color-accent", theme.accentColor);
    root.style.setProperty("--color-dark", theme.darkColor);
    root.style.setProperty("--color-light", theme.lightColor);

    useCartStore.persist.rehydrate();
  }, []);

  return <>{children}</>;
}
