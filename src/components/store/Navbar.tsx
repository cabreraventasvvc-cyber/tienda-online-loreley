"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { storeConfig } from "@/config/store.config";
import { useCartStore } from "@/store/useCartStore";
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  Phone, 
  MapPin, 
  Sparkles,
  ShieldCheck,
  UserCheck
} from "lucide-react";

interface NavbarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedCategory?: string;
  onSelectCategory?: (categoryId: string) => void;
}

export function Navbar({ 
  searchQuery = "", 
  onSearchChange,
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore((state) => state.getTotalItems());
  const toggleCart = useCartStore((state) => state.toggleCart);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-zinc-200/80 shadow-xs">
      {/* Barra superior de anuncios y beneficios */}
      <div className="bg-zinc-950 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium tracking-wide">
              {storeConfig.shipping.deliveryAreasDescription}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-4 text-zinc-300">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              <span>{storeConfig.contact.city}</span>
            </div>
            <a
              href={`https://wa.me/${storeConfig.contact.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp: {storeConfig.contact.displayPhone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Barra principal de navegación */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo / Nombre de la Marca */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-zinc-600 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 focus:outline-none"
              aria-label="Abrir menú"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link href="/" className="flex items-center gap-2 group">
              {storeConfig.logoUrl ? (
                <img
                  src={storeConfig.logoUrl}
                  alt={storeConfig.name}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div className="flex items-center gap-2.5">
                  <img
                    src="/header-mark.svg"
                    alt="TIENDA LORELEY"
                    className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl object-contain shadow-md group-hover:scale-105 transition-transform"
                  />
                  <div>
                    <span className="text-lg sm:text-2xl font-black tracking-widest text-zinc-900 block leading-tight uppercase font-mono">
                      {storeConfig.name}
                    </span>
                    <span className="text-[10px] font-semibold text-zinc-400 tracking-widest uppercase block">
                      {storeConfig.tagline}
                    </span>
                  </div>
                </div>
              )}
            </Link>
          </div>

          {/* Buscador central */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscar por prenda, buzo, jean, color..."
                value={searchQuery}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-100 border border-zinc-200 rounded-full text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 transition-all"
              />
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
            </div>
          </div>

          {/* Botones de acción derecha */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Acceso Administrador / Iniciar Sesión */}
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-zinc-800 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors border border-stone-200"
              title="Panel de Control para el dueño"
            >
              <UserCheck className="w-4 h-4 text-zinc-900" />
              <span className="hidden sm:inline">Iniciar Sesión</span>
              <span className="sm:hidden">Admin</span>
            </Link>

            {/* Enlace WhatsApp Directo */}
            <a
              href={`https://wa.me/${storeConfig.contact.whatsapp}?text=${encodeURIComponent(`¡Hola ${storeConfig.name}! Tengo una consulta sobre una prenda.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-full transition-colors border border-emerald-200"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Atención Online</span>
            </a>

            {/* Botón Carrito */}
            <button
              onClick={toggleCart}
              className="relative flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-white rounded-full font-medium text-sm shadow-md hover:bg-zinc-800 active:scale-95 transition-all cursor-pointer"
              aria-label="Abrir carrito"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline font-bold uppercase tracking-wider text-xs">Bolsa</span>
              {mounted && totalItems > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold bg-amber-500 text-zinc-950 rounded-full shadow-sm animate-bounce">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Buscador expandido para dispositivos móviles */}
        <div className="md:hidden pb-3 pt-1">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Buscar remeras, buzos, camperas..."
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-100 border border-zinc-200 rounded-full text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
            />
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-zinc-400" />
            {searchQuery && (
              <button
                onClick={() => onSearchChange && onSearchChange("")}
                className="absolute right-3.5 top-2 text-xs text-zinc-400 hover:text-zinc-600 bg-zinc-200 rounded-full w-5 h-5 flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-100 bg-white px-4 py-4 space-y-3 shadow-lg">
          <div className="space-y-2 text-sm">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg font-bold text-zinc-800 hover:bg-zinc-50"
            >
              ✨ Nueva Colección / Catálogo
            </Link>
            <div className="border-t border-zinc-100 pt-2 space-y-1 text-xs text-zinc-500">
              <div className="flex items-center gap-2 px-3 py-1">
                <MapPin className="w-4 h-4 text-zinc-700" />
                <span>{storeConfig.shipping.deliveryAreasDescription}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1">
                <MapPin className="w-4 h-4 text-zinc-700" />
                <span>{storeConfig.shipping.pickupAddress}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Cambios y devoluciones garantizados</span>
              </div>
            </div>
            <a
              href={`https://wa.me/${storeConfig.contact.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center px-4 py-2.5 mt-3 text-sm font-bold text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200"
            >
              💬 Hablar con Showroom en WhatsApp
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
