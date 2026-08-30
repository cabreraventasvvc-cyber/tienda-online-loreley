"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { storeConfig } from "@/config/store.config";
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Sparkles } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@loreley.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/admin/dashboard");
      } else {
        setError(data.message || "Credenciales incorrectas.");
      }
    } catch (err) {
      setError("Error de conexión al servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 px-4">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-12 h-12 rounded-2xl bg-white text-zinc-950 flex items-center justify-center font-black text-2xl tracking-tighter shadow-2xl group-hover:scale-105 transition-transform font-mono">
            L
          </div>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-widest font-mono text-white">
          {storeConfig.name} Admin
        </h1>
        <p className="text-xs text-zinc-400 font-medium">
          Panel de Control y Gestión de Indumentaria
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-zinc-900/90 py-8 px-6 sm:px-10 rounded-3xl border border-zinc-800 shadow-2xl space-y-6">
          
          {/* Mensaje de Error */}
          {error && (
            <div className="p-3.5 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-2xl flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Email de Administrador
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@loreley.com"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-zinc-500 transition-all"
                />
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-zinc-500 transition-all"
                />
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-white hover:bg-zinc-100 text-zinc-950 font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <span>Ingresando...</span>
              ) : (
                <>
                  <span>Ingresar al Panel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Tarjeta de ayuda con credenciales de prueba */}
          <div className="pt-4 border-t border-zinc-800/80 text-xs text-zinc-400 space-y-1.5 bg-zinc-950/40 p-3.5 rounded-2xl border border-zinc-800/50">
            <div className="flex items-center gap-1.5 font-bold text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Credenciales de Demostración:</span>
            </div>
            <p className="text-[11px] font-mono text-zinc-300">
              Email: <strong>admin@loreley.com</strong>
            </p>
            <p className="text-[11px] font-mono text-zinc-300">
              Contraseña: <strong>admin123</strong>
            </p>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/"
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              ← Volver a la Tienda Pública
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
