"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { storeConfig } from "@/config/store.config";
import { 
  ShoppingBag, 
  ClipboardList, 
  DollarSign, 
  AlertTriangle, 
  ArrowUpRight, 
  Plus, 
  Sparkles, 
  MessageCircle,
  Clock,
  CheckCircle2,
  Truck
} from "lucide-react";

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [prodRes, orderRes] = await Promise.all([
          fetch("/api/admin/products"),
          fetch("/api/admin/orders"),
        ]);

        const prodData = await prodRes.json();
        const orderData = await orderRes.json();

        if (prodData.success) setProducts(prodData.products || []);
        if (orderData.success) setOrders(orderData.orders || []);
      } catch (e) {
        console.error("Error loading dashboard data", e);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const lowStockProducts = products.filter((p) => p.stock <= 5);

  return (
    <div className="space-y-8">
      
      {/* Cabecera del Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">
              Panel Activo
            </span>
            <span className="text-xs text-stone-400 font-mono">• {new Date().toLocaleDateString("es-AR")}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 uppercase font-mono tracking-tight mt-2">
            Dashboard • {storeConfig.name}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Resumen general de ventas, inventario y pedidos de la tienda.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/productos"
            className="inline-flex items-center gap-2 px-5 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Prenda</span>
          </Link>
        </div>
      </div>

      {/* Grid de 4 Métricas Clave */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Prendas */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Prendas en Catálogo</span>
            <span className="text-3xl font-black text-stone-900">{totalProducts}</span>
            <span className="text-[11px] text-emerald-600 font-semibold block">Activas en la tienda</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-900 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Total Pedidos */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Pedidos Registrados</span>
            <span className="text-3xl font-black text-stone-900">{totalOrders}</span>
            <span className="text-[11px] text-stone-500 font-semibold block">Por WhatsApp / Web</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ClipboardList className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Ingresos Totales */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Ventas Totales</span>
            <span className="text-2xl sm:text-3xl font-black text-stone-900">{formatPrice(totalRevenue)}</span>
            <span className="text-[11px] text-emerald-600 font-semibold block">Monto bruto acumulado</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Alerta de Stock */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Stock Bajo (&lt;= 5 un.)</span>
            <span className="text-3xl font-black text-amber-600">{lowStockProducts.length}</span>
            <span className="text-[11px] text-amber-600 font-semibold block">Requieren reposición</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Sección Doble: Pedidos Recientes & Alertas de Inventario */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda (2 Cols): Últimos Pedidos */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-stone-200/80 shadow-xs p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="font-black text-base text-stone-900 uppercase font-mono tracking-wider">
                Últimos Pedidos
              </h3>
              <p className="text-xs text-stone-400">Compras recibidas en la tienda online</p>
            </div>
            <Link
              href="/admin/pedidos"
              className="text-xs font-bold text-zinc-900 hover:text-zinc-600 flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12 text-stone-400 space-y-2">
              <ClipboardList className="w-10 h-10 mx-auto text-stone-300" />
              <p className="text-sm font-bold text-stone-600">Aún no hay pedidos registrados</p>
              <p className="text-xs">Los pedidos realizados por los clientes aparecerán aquí automáticamente.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-100 text-stone-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Pedido</th>
                    <th className="pb-3">Cliente</th>
                    <th className="pb-3">Entrega</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3 text-right">Contacto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3 font-mono font-bold text-zinc-900">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 font-bold text-stone-800">
                        {order.customerName}
                      </td>
                      <td className="py-3 text-stone-500">
                        {order.deliveryType === "delivery" ? "🚚 Envío" : "🏬 Showroom"}
                      </td>
                      <td className="py-3 font-black text-stone-900">
                        {formatPrice(order.total)}
                      </td>
                      <td className="py-3 text-right">
                        <a
                          href={`https://wa.me/${order.customerPhone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-lg transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Columna Derecha (1 Col): Alertas de Stock Bajo */}
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs p-6 sm:p-8 space-y-5">
          <div className="pb-3 border-b border-stone-100">
            <h3 className="font-black text-base text-stone-900 uppercase font-mono tracking-wider">
              Control de Stock
            </h3>
            <p className="text-xs text-stone-400">Prendas con inventario crítico</p>
          </div>

          <div className="space-y-3">
            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-stone-500 py-6 text-center">
                ✅ Todo el catálogo cuenta con buen nivel de stock.
              </p>
            ) : (
              lowStockProducts.slice(0, 5).map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-100"
                >
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-xs text-stone-900 line-clamp-1">{prod.name}</h4>
                    <span className="text-[10px] text-stone-400 font-medium">{prod.category?.name || "Indumentaria"}</span>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-black text-xs rounded-full">
                    {prod.stock} un.
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="pt-2">
            <Link
              href="/admin/productos"
              className="block w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold text-center text-xs uppercase tracking-wider rounded-2xl transition-colors"
            >
              Administrar Todo el Stock
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
