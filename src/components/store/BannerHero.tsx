import React from "react";
import { storeConfig } from "@/config/store.config";
import { Truck, Store, ShieldCheck, ArrowDown, Sparkles } from "lucide-react";

interface BannerHeroProps {
  onExploreClick?: () => void;
}

export function BannerHero({ onExploreClick }: BannerHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8 rounded-3xl mx-4 sm:mx-6 lg:mx-8 my-6 shadow-2xl">
      {/* Elementos visuales de fondo */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-80 h-80 bg-zinc-800/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto text-center space-y-6">
        {/* Badge de Ofertas de Temporada */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-semibold text-amber-300 shadow-inner">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Colección Otoño - Invierno 2026</span>
        </div>

        {/* Título Principal */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight sm:leading-tight uppercase font-mono">
          {storeConfig.texts.heroTitle}
        </h1>

        {/* Subtítulo descriptivo */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base lg:text-lg text-zinc-300 leading-relaxed font-normal">
          {storeConfig.texts.heroSubtitle}
        </p>

        {/* Botón de llamada a la acción */}
        <div className="pt-3">
          <button
            onClick={() => {
              if (onExploreClick) {
                onExploreClick();
              } else {
                const el = document.getElementById("catalogo-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="inline-flex items-center gap-2.5 px-8 py-4 bg-white text-zinc-950 hover:bg-zinc-100 font-black text-sm uppercase tracking-widest rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all"
          >
            <span>{storeConfig.texts.heroCtaText}</span>
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </button>
        </div>

        {/* Grid de Beneficios Clave */}
        <div className="pt-10 sm:pt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/10 text-left">
          
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Envíos a todo el país</h4>
              <p className="text-[11px] sm:text-xs text-zinc-400">
                {storeConfig.shipping.deliveryAreasDescription}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-zinc-700/50 text-white flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Retiro en Showroom</h4>
              <p className="text-[11px] sm:text-xs text-zinc-400">
                {storeConfig.shipping.pickupAddress.slice(0, 34)}...
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Compra 100% Segura</h4>
              <p className="text-[11px] sm:text-xs text-zinc-400">
                Cambios fáciles y atención personalizada
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
