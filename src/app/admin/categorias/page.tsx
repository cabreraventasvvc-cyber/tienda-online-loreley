"use client";

import React, { useEffect, useState } from "react";
import { 
  Plus, 
  Layers, 
  Edit, 
  Trash2, 
  X, 
  Shirt, 
  Flame, 
  Scissors, 
  Heart, 
  Watch, 
  Sparkles 
} from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (e) {
      console.error("Error loading categories", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName, description: newCatDesc }),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setNewCatName("");
        setNewCatDesc("");
        await loadCategories();
      }
    } catch (e) {
      alert("Error al guardar categoría.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 uppercase font-mono tracking-tight">
            Categorías de Prendas
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Organización del catálogo y filtros para los compradores.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-xl transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Grid de Categorías */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-stone-900">{cat.name}</h3>
              </div>
              <p className="text-xs text-stone-400 line-clamp-1">{cat.description || "Sin descripción"}</p>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-2">
                {cat._count?.products || 0} prendas vinculadas
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nueva Categoría */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 border border-stone-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-black text-lg text-zinc-900 uppercase font-mono">Nueva Categoría</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-stone-400 hover:text-stone-900 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-700 uppercase tracking-wider block">Nombre de la Categoría *</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Ej: Calzado & Zapatillas"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 uppercase tracking-wider block">Descripción (Opcional)</label>
                <input
                  type="text"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Ej: Zapatillas urbanas y deportivas"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-stone-100 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-zinc-900 text-white font-bold rounded-xl shadow-md"
                >
                  {saving ? "Guardando..." : "Crear Categoría"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
