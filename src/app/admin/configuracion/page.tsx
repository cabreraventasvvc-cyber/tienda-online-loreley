"use client";

import React, { useEffect, useState } from "react";
import { storeConfig } from "@/config/store.config";
import { 
  Settings, 
  Store, 
  MessageCircle, 
  Truck, 
  Palette, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Sparkles,
  Phone,
  Mail,
  MapPin
} from "lucide-react";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    store_name: "LORELEY",
    tagline: "Indumentaria & Tendencias",
    description: "Diseño exclusivo, tejidos premium y calce impecable. Envíos a todo el país y retiro en local.",
    whatsapp_number: "5491134567890",
    display_phone: "+54 9 11 3456-7890",
    email: "contacto@loreley.com",
    address: "Gorriti 4850, Palermo Soho",
    city: "Buenos Aires, Argentina",
    opening_hours: "Lunes a Sábados de 11:00 a 20:00 hs",
    delivery_cost: "3500",
    pickup_address: "Local / Showroom: Gorriti 4850 - Palermo",
    pickup_instructions: "Retiro sin cargo de Lunes a Sábados de 11 a 20 hs con el número de pedido.",
    delivery_areas: "Envíos a todo el país por correo y entregas en el día en CABA y GBA.",
    primary_color: "#18181b",
    accent_color: "#d97706",
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (data.success && data.settings) {
          setFormData((prev) => ({ ...prev, ...data.settings }));
        }
      } catch (e) {
        console.error("Error loading settings:", e);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage("¡Configuración guardada exitosamente en la base de datos!");
        setTimeout(() => setSuccessMessage(""), 4000);
      } else {
        alert(data.message || "Error al guardar la configuración.");
      }
    } catch (err) {
      alert("Error de conexión con el servidor.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 uppercase font-mono tracking-tight">
            Configuración del Comercio
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Personalizá los datos de la marca, WhatsApp, envíos y colores para este u otros clientes.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-xl transition-all hover:scale-105 cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Guardando..." : "Guardar Cambios"}</span>
        </button>
      </div>

      {/* Alerta de Éxito */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* =========================================================================
            SECCIÓN 1: IDENTIDAD DE LA MARCA
           ========================================================================= */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider">
                1. Identidad de la Marca
              </h3>
              <p className="text-[11px] text-stone-400">Nombre, eslogan y textos públicos de la tienda</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-stone-700 uppercase tracking-wider block">
                Nombre Comercial de la Tienda *
              </label>
              <input
                type="text"
                required
                name="store_name"
                value={formData.store_name}
                onChange={handleChange}
                placeholder="LORELEY"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-stone-700 uppercase tracking-wider block">
                Eslogan / Rubro
              </label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                placeholder="Indumentaria & Tendencias"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-bold text-stone-700 uppercase tracking-wider block">
                Descripción General (Para Google y Redes)
              </label>
              <textarea
                name="description"
                rows={2}
                value={formData.description}
                onChange={handleChange}
                placeholder="Prendas de diseño exclusivo..."
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECCIÓN 2: CONTACTO Y WHATSAPP DE PEDIDOS
           ========================================================================= */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider">
                2. Contacto & WhatsApp de Pedidos
              </h3>
              <p className="text-[11px] text-stone-400">Canales donde los clientes enviarán sus comprobantes y dudas</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-stone-700 uppercase tracking-wider block">
                Número de WhatsApp para Pedidos * <span className="text-stone-400 font-normal">(con código de país)</span>
              </label>
              <input
                type="text"
                required
                name="whatsapp_number"
                value={formData.whatsapp_number}
                onChange={handleChange}
                placeholder="5491134567890"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-mono font-bold text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
              />
              <p className="text-[10px] text-stone-400">Ejemplo para Argentina: 54911 + número sin 15 ni guiones</p>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-stone-700 uppercase tracking-wider block">
                Teléfono Visible en Web
              </label>
              <input
                type="text"
                name="display_phone"
                value={formData.display_phone}
                onChange={handleChange}
                placeholder="+54 9 11 3456-7890"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-900 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-stone-700 uppercase tracking-wider block">
                Email del Comercio
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contacto@loreley.com"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-900 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-stone-700 uppercase tracking-wider block">
                Horarios de Atención
              </label>
              <input
                type="text"
                name="opening_hours"
                value={formData.opening_hours}
                onChange={handleChange}
                placeholder="Lunes a Sábados de 11:00 a 20:00 hs"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECCIÓN 3: LOGÍSTICA, ENVÍOS Y SHOWROOM
           ========================================================================= */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider">
                3. Tarifas de Envío & Retiro en Local
              </h3>
              <p className="text-[11px] text-stone-400">Configurá los costos de envío y el retiro en local</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-stone-700 uppercase tracking-wider block">
                Costo Estándar de Envío ($) *
              </label>
              <input
                type="number"
                required
                name="delivery_cost"
                value={formData.delivery_cost}
                onChange={handleChange}
                placeholder="3500"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-bold text-stone-900 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-bold text-stone-700 uppercase tracking-wider block">
                Dirección del Showroom / Local para Retiro
              </label>
              <input
                type="text"
                name="pickup_address"
                value={formData.pickup_address}
                onChange={handleChange}
                placeholder="Gorriti 4850, Palermo Soho, CABA"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECCIÓN 4: PALETA DE COLORES (WHITE-LABEL THEME)
           ========================================================================= */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider">
                4. Colores de la Marca (Theming Dinámico)
              </h3>
              <p className="text-[11px] text-stone-400">Personalizá los colores de los botones y ofertas de la tienda</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-stone-700 uppercase tracking-wider block">
                Color Principal (Botones y Cabeceras)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="primary_color"
                  value={formData.primary_color}
                  onChange={handleChange}
                  className="w-12 h-12 rounded-2xl border border-stone-200 cursor-pointer"
                />
                <input
                  type="text"
                  name="primary_color"
                  value={formData.primary_color}
                  onChange={handleChange}
                  className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-mono text-stone-900 uppercase"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-stone-700 uppercase tracking-wider block">
                Color de Acento (Badges de Oferta y Descuentos)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="accent_color"
                  value={formData.accent_color}
                  onChange={handleChange}
                  className="w-12 h-12 rounded-2xl border border-stone-200 cursor-pointer"
                />
                <input
                  type="text"
                  name="accent_color"
                  value={formData.accent_color}
                  onChange={handleChange}
                  className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-mono text-stone-900 uppercase"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botón Guardar Inferior */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer hover:scale-105 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Guardando..." : "Guardar Todos los Cambios"}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
