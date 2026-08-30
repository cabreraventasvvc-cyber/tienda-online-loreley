"use client";

import React, { useState } from "react";
import { storeConfig } from "@/config/store.config";
import { MessageCircle, X } from "lucide-react";

export function FloatingWhatsApp() {
  const [showTooltip, setShowTooltip] = useState(true);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
      
      {/* Tooltip de Bienvenida */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 bg-white text-slate-800 text-xs font-semibold py-2 px-3.5 rounded-2xl shadow-xl border border-slate-100 animate-bounce">
          <span>¿Tenés dudas? ¡Escribinos por WhatsApp!</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="text-slate-400 hover:text-slate-700 p-0.5 rounded"
            aria-label="Cerrar aviso"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Botón Flotante */}
      <a
        href={`https://wa.me/${storeConfig.contact.whatsapp}?text=${encodeURIComponent("¡Hola! Tengo una consulta sobre un producto de la tienda.")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 hover:scale-110 active:scale-95 transition-all duration-300 group"
        aria-label="Chatear por WhatsApp"
      >
        <MessageCircle className="w-7 h-7 fill-white group-hover:rotate-12 transition-transform" />
      </a>
    </div>
  );
}
