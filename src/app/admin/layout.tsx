"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { storeConfig } from "@/config/store.config";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Layers, 
  ClipboardList, 
  Settings, 
  TicketPercent,
  ExternalLink, 
  LogOut, 
  Menu, 
  X,
  Sparkles,
  ShieldCheck
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Prendas & Talles", href: "/admin/productos", icon: ShoppingBag },
  { name: "Categorías", href: "/admin/categorias", icon: Layers },
  { name: "Cupones", href: "/admin/cupones", icon: TicketPercent },
  { name: "Gestión de Pedidos", href: "/admin/pedidos", icon: ClipboardList },
  { name: "Configuración", href: "/admin/configuracion", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Si estamos en la página de login, renderizamos directamente sin sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
    } catch (e) {
      router.push("/admin/login");
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row text-stone-900">
      
      {/* =========================================================================
          SIDEBAR DESKTOP
         ========================================================================= */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-zinc-950 text-white p-6 border-r border-zinc-800 shrink-0 sticky top-0 h-screen">
        <div className="space-y-8">
          
          {/* Logo & Marca */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-white text-zinc-950 flex items-center justify-center font-black text-lg tracking-tighter font-mono shadow-md">
              L
            </div>
            <div>
              <span className="text-lg font-black tracking-widest uppercase font-mono block leading-tight">
                {storeConfig.name}
              </span>
              <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">
                Panel Administrador
              </span>
            </div>
          </div>

          {/* Menú de Navegación */}
          <nav className="space-y-1.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-white text-zinc-950 shadow-lg scale-105"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-zinc-950" : "text-zinc-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

        </div>

        {/* Acciones Inferiores del Sidebar */}
        <div className="space-y-3 pt-6 border-t border-zinc-800">
          
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <ExternalLink className="w-4 h-4 text-emerald-400" />
              <span>Ver Tienda Online</span>
            </div>
            <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">Live</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>

        </div>
      </aside>

      {/* =========================================================================
          HEADER MÓVIL
         ========================================================================= */}
      <div className="md:hidden bg-zinc-950 text-white p-4 border-b border-zinc-800 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white text-zinc-950 flex items-center justify-center font-black text-sm font-mono">
            L
          </div>
          <span className="font-bold text-sm uppercase font-mono tracking-wider">
            {storeConfig.name} Admin
          </span>
        </div>

        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 text-zinc-400 hover:text-white"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Menú Desplegable Móvil */}
      {isMobileOpen && (
        <div className="md:hidden bg-zinc-950 border-b border-zinc-800 p-4 space-y-2 text-xs">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className="block px-3 py-2 rounded-xl font-bold text-zinc-300 hover:bg-zinc-900"
            >
              {item.name}
            </Link>
          ))}
          <div className="pt-2 border-t border-zinc-800 flex justify-between">
            <Link href="/" target="_blank" className="text-emerald-400 font-bold py-1">
              🌐 Ver Tienda
            </Link>
            <button onClick={handleLogout} className="text-rose-400 font-bold py-1">
              🚪 Salir
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          CONTENIDO PRINCIPAL
         ========================================================================= */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 overflow-y-auto max-w-7xl">
        {children}
      </main>

    </div>
  );
}
