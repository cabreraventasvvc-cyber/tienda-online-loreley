"use client";

import { useEffect } from "react";

/**
 * Componente que registra el Service Worker en segundo plano para habilitar PWA
 */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("✅ PWA Service Worker registrado con éxito:", reg.scope);
          })
          .catch((err) => {
            console.warn("Service Worker registration failed:", err);
          });
      });
    }
  }, []);

  return null;
}
