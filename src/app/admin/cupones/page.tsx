"use client";

import React, { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Coupon } from "@/types";
import { Check, Edit, Plus, Search, TicketPercent, Trash2, X } from "lucide-react";

const emptyForm = {
  id: "",
  code: "",
  type: "percentage",
  value: "",
  active: true,
  expiresAt: "",
  minPurchase: "",
  scope: "all",
  categoryIds: [] as string[],
  productIds: [] as string[],
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [couponRes, productRes, categoryRes] = await Promise.all([
        fetch("/api/admin/coupons", { cache: "no-store" }),
        fetch("/api/admin/products", { cache: "no-store" }),
        fetch("/api/admin/categories", { cache: "no-store" }),
      ]);
      const [couponData, productData, categoryData] = await Promise.all([
        couponRes.json(),
        productRes.json(),
        categoryRes.json(),
      ]);

      if (couponData.success) setCoupons(couponData.coupons || []);
      if (productData.success) setProducts(productData.products || []);
      if (categoryData.success) setCategories(categoryData.categories || []);
    } catch {
      setMessage("No se pudieron cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setFormData(emptyForm);
    setIsEditing(false);
    setMessage("");
  };

  const toggleListValue = (field: "categoryIds" | "productIds", id: string) => {
    setFormData((prev) => {
      const exists = prev[field].includes(id);
      return { ...prev, [field]: exists ? prev[field].filter((item) => item !== id) : [...prev[field], id] };
    });
  };

  const handleEdit = (coupon: Coupon) => {
    setIsEditing(true);
    setFormData({
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      active: coupon.active,
      expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : "",
      minPurchase: coupon.minPurchase ? String(coupon.minPurchase) : "",
      scope: coupon.scope,
      categoryIds: coupon.categoryIds || [],
      productIds: coupon.productIds || [],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const url = isEditing ? `/api/admin/coupons/${formData.id}` : "/api/admin/coupons";
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setMessage(data.message || "No se pudo guardar el cupón.");
        return;
      }

      resetForm();
      await loadData();
      setMessage(isEditing ? "Cupón actualizado." : "Cupón creado.");
    } catch {
      setMessage("Error de conexión al guardar el cupón.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar este cupón?")) return;

    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMessage(data.message || "No se pudo eliminar el cupón.");
        return;
      }
      setCoupons((prev) => prev.filter((coupon) => coupon.id !== id));
      if (formData.id === id) resetForm();
    } catch {
      setMessage("Error de conexión al eliminar el cupón.");
    }
  };

  const filteredCoupons = coupons.filter((coupon) => coupon.code.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-8 rounded-3xl border border-stone-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 uppercase font-mono tracking-tight">
            Cupones de Descuento
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Creá promociones editables para aplicar en carrito y checkout.
          </p>
        </div>
        <button
          onClick={resetForm}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-5 py-3 text-xs font-black uppercase tracking-wider text-white"
        >
          <Plus className="h-4 w-4" />
          Nuevo cupón
        </button>
      </div>

      {message && (
        <div className="rounded-2xl border border-stone-200 bg-white p-4 text-xs font-bold text-stone-700">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <form onSubmit={handleSubmit} className="xl:col-span-5 bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h2 className="font-black uppercase tracking-wider text-zinc-900">
              {isEditing ? "Editar cupón" : "Crear cupón"}
            </h2>
            {isEditing && (
              <button type="button" onClick={resetForm} className="rounded-full p-2 text-stone-500 hover:bg-stone-100">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700">Código</span>
              <input
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="LORELEY10"
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-black uppercase"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700">Tipo</span>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-bold"
              >
                <option value="percentage">Porcentaje</option>
                <option value="fixed">Importe fijo</option>
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700">Descuento</span>
              <input
                required
                type="number"
                min="1"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder={formData.type === "percentage" ? "10" : "5000"}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-bold"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700">Compra mínima</span>
              <input
                type="number"
                min="0"
                value={formData.minPurchase}
                onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                placeholder="Opcional"
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-bold"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700">Vencimiento</span>
              <input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-bold"
              />
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-bold">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="h-4 w-4 accent-zinc-900"
              />
              Cupón activo
            </label>
          </div>

          <label className="space-y-1.5 block">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-700">Aplicar a</span>
            <select
              value={formData.scope}
              onChange={(e) => setFormData({ ...formData, scope: e.target.value, categoryIds: [], productIds: [] })}
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-bold"
            >
              <option value="all">Toda la compra</option>
              <option value="categories">Categorías seleccionadas</option>
              <option value="products">Productos seleccionados</option>
            </select>
          </label>

          {formData.scope === "categories" && (
            <div className="max-h-44 overflow-y-auto rounded-2xl border border-stone-200 p-3 space-y-2">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center gap-2 text-xs font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={formData.categoryIds.includes(category.id)}
                    onChange={() => toggleListValue("categoryIds", category.id)}
                    className="accent-zinc-900"
                  />
                  {category.name}
                </label>
              ))}
            </div>
          )}

          {formData.scope === "products" && (
            <div className="max-h-56 overflow-y-auto rounded-2xl border border-stone-200 p-3 space-y-2">
              {products.map((product) => (
                <label key={product.id} className="flex items-center gap-2 text-xs font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={formData.productIds.includes(product.id)}
                    onChange={() => toggleListValue("productIds", product.id)}
                    className="accent-zinc-900"
                  />
                  <span className="line-clamp-1">{product.name}</span>
                </label>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-6 py-4 text-sm font-black uppercase tracking-wider text-white disabled:opacity-60"
          >
            <Check className="h-4 w-4" />
            {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear cupón"}
          </button>
        </form>

        <div className="xl:col-span-7 bg-white rounded-3xl border border-stone-200 overflow-hidden">
          <div className="p-4 border-b border-stone-100">
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-stone-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar cupón..."
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 py-3 pl-10 pr-4 text-sm"
              />
            </div>
          </div>

          <div className="divide-y divide-stone-100">
            {loading ? (
              <div className="p-6 text-sm font-semibold text-stone-500">Cargando cupones...</div>
            ) : filteredCoupons.length === 0 ? (
              <div className="p-8 text-center text-sm text-stone-500">
                <TicketPercent className="mx-auto mb-3 h-10 w-10 text-stone-300" />
                Todavía no hay cupones cargados.
              </div>
            ) : (
              filteredCoupons.map((coupon) => (
                <div key={coupon.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-xl bg-zinc-900 px-3 py-1 text-xs font-black tracking-wider text-white">
                        {coupon.code}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${coupon.active ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"}`}>
                        {coupon.active ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-zinc-900">
                      {coupon.type === "percentage" ? `${coupon.value}%` : formatPrice(coupon.value)} de descuento
                    </p>
                    <p className="text-xs text-stone-500">
                      {coupon.scope === "all" ? "Toda la compra" : coupon.scope === "categories" ? "Categorías seleccionadas" : "Productos seleccionados"}
                      {coupon.minPurchase ? ` · Mínimo ${formatPrice(coupon.minPurchase)}` : ""}
                      {coupon.expiresAt ? ` · Vence ${new Date(coupon.expiresAt).toLocaleDateString("es-AR")}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(coupon)} className="rounded-xl p-2 text-stone-600 hover:bg-stone-100">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(coupon.id)} className="rounded-xl p-2 text-red-500 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
