"use client";

import React, { useEffect, useState } from "react";
import { storeConfig } from "@/config/store.config";
import { Download, X, Smartphone, Sparkles, Share } from "lucide-react";

export function InstallPwaBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // 1. Verificar si la app ya está instalada en modo standalone
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
    if (isStandalone) {
      return; // Ya está instalada, no mostrar banner
    }

    // 2. Verificar si el usuario ya cerró el banner en esta sesión
    const dismissed = sessionStorage.getItem("pwa_banner_dismissed");
    if (dismissed) {
      return;
    }

    // 3. Capturar el evento de instalación nativo en Android / Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 4. Detección de Safari en iOS / iPhone
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    if (isIosDevice && !isStandalone) {
      setIsIos(true);
      // Mostrar banner en iOS luego de unos segundos de navegación
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("El usuario aceptó instalar la PWA de LORELEY");
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem("pwa_banner_dismissed", "true");
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Banner Flotante Inferior en Celular */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-slideUp">
        <div className="bg-zinc-950 text-white p-4 sm:p-5 rounded-3xl border border-zinc-800 shadow-2xl flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white text-zinc-950 flex items-center justify-center font-black text-xl font-mono shrink-0 shadow-md">
              L
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xs uppercase tracking-wider font-mono">
                  App de {storeConfig.name}
                </span>
                <span className="bg-amber-500 text-zinc-950 font-black text-[9px] px-1.5 py-0.2 rounded uppercase">
                  PWA
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-tight">
                Instalá la tienda en tu celular para comprar en 1 toque.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-4 py-2.5 bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar</span>
            </button>

            <button
              onClick={handleDismiss}
              className="p-2 text-zinc-500 hover:text-white rounded-full"
              title="Cerrar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Modal Guía de Instalación para iPhone / iPad (iOS) */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xs">
          <div className="bg-white text-zinc-900 rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-4 shadow-2xl border border-stone-200 text-center">
            <div className="w-14 h-14 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto text-zinc-900">
              <Smartphone className="w-7 h-7" />
            </div>

            <h3 className="font-black text-lg uppercase font-mono">
              Instalar en tu iPhone
            </h3>

            <p className="text-xs text-stone-600 leading-relaxed text-left space-y-2">
              <span className="block">1. Tocá el botón de <strong>Compartir</strong> <Share className="w-3.5 h-3.5 inline mx-1 text-sky-600" /> en la barra inferior de Safari.</span>
              <span className="block">2. Desplazate hacia abajo y seleccioná <strong>"Agregar a Inicio"</strong> (Add to Home Screen ➕).</span>
              <span className="block">3. ¡Listo! Ya podés acceder a LORELEY directamente desde la pantalla de inicio de tu celular como una app nativa.</span>
            </p>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-3 bg-zinc-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
