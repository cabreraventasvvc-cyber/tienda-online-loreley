"use client";

import React, { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { storeConfig } from "@/config/store.config";
import { 
  ClipboardList, 
  Search, 
  MessageCircle, 
  Truck, 
  Store, 
  X, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Eye,
  Filter
} from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [updating, setUpdating] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error("Error loading orders", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, orderStatus: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
        }
      }
    } catch (e) {
      alert("Error al actualizar estado.");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "preparing":
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full font-bold text-[10px]">En Preparación</span>;
      case "ready":
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-900 rounded-full font-bold text-[10px]">Listo para Entrega</span>;
      case "delivered":
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-full font-bold text-[10px]">Entregado</span>;
      case "cancelled":
        return <span className="px-2.5 py-1 bg-red-100 text-red-900 rounded-full font-bold text-[10px]">Cancelado</span>;
      case "pending":
      default:
        return <span className="px-2.5 py-1 bg-stone-200 text-stone-800 rounded-full font-bold text-[10px]">Pendiente</span>;
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === "all" || o.orderStatus === statusFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 uppercase font-mono tracking-tight">
            Gestión de Pedidos
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Recepción, preparación y seguimiento de compras de los clientes.
          </p>
        </div>

        <span className="px-4 py-2 bg-stone-100 font-mono font-bold text-xs rounded-2xl text-stone-700">
          {orders.length} {orders.length === 1 ? "pedido registrado" : "pedidos registrados"}
        </span>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar por Nº de pedido (#AUR-...), nombre del cliente o teléfono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          />
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
        </div>

        {/* Filtro por Estado */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "Todos" },
            { id: "pending", label: "Pendientes" },
            { id: "preparing", label: "En Preparación" },
            { id: "ready", label: "Listos" },
            { id: "delivered", label: "Entregados" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === f.id
                  ? "bg-zinc-900 text-white shadow-xs"
                  : "bg-stone-50 text-stone-600 hover:bg-stone-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de Pedidos */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 text-stone-400 space-y-2">
            <ClipboardList className="w-12 h-12 mx-auto text-stone-300" />
            <p className="font-bold text-stone-700">No se encontraron pedidos</p>
            <p className="text-xs">Los nuevos pedidos recibidos por WhatsApp o Web se mostrarán en esta lista.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-4 sm:px-6">Nº Pedido</th>
                  <th className="py-4 px-4">Cliente</th>
                  <th className="py-4 px-4">Entrega</th>
                  <th className="py-4 px-4">Medio de Pago</th>
                  <th className="py-4 px-4">Total</th>
                  <th className="py-4 px-4">Estado</th>
                  <th className="py-4 px-4 sm:px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50/70 transition-colors">
                    
                    {/* Número de Pedido y Fecha */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="space-y-0.5">
                        <span className="font-black text-zinc-900 text-sm font-mono block">
                          #{order.orderNumber}
                        </span>
                        <span className="text-[10px] text-stone-400 font-medium">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString("es-AR") : "Reciente"}
                        </span>
                      </div>
                    </td>

                    {/* Cliente & Teléfono */}
                    <td className="py-4 px-4">
                      <div>
                        <span className="font-bold text-stone-900 block text-xs sm:text-sm">
                          {order.customerName}
                        </span>
                        <span className="text-[11px] text-stone-500 font-mono">
                          {order.customerPhone}
                        </span>
                      </div>
                    </td>

                    {/* Entrega */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-stone-700">
                        {order.deliveryType === "delivery" ? (
                          <>
                            <Truck className="w-4 h-4 text-zinc-900" />
                            <span>Envío Domicilio</span>
                          </>
                        ) : (
                          <>
                            <Store className="w-4 h-4 text-amber-600" />
                            <span>Retiro Showroom</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Medio y Estado de Pago */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        {order.paymentMethod === "mercadopago" ? (
                          <span className="px-2 py-0.5 bg-sky-100 text-sky-800 rounded font-bold text-[10px] inline-block">
                            Mercado Pago
                          </span>
                        ) : order.paymentMethod === "bank_transfer" ? (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-bold text-[10px] inline-block">
                            Transferencia
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px] inline-block">
                            WhatsApp
                          </span>
                        )}

                        <div>
                          {order.paymentStatus === "approved" ? (
                            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Pago Aprobado
                            </span>
                          ) : (
                            <span className="text-[10px] text-stone-400 font-medium">
                              Pendiente
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Total */}
                    <td className="py-4 px-4 font-black text-stone-900 text-sm">
                      {formatPrice(order.total)}
                    </td>

                    {/* Estado */}
                    <td className="py-4 px-4">
                      {getStatusBadge(order.orderStatus)}
                    </td>

                    {/* Acciones */}
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Botón WhatsApp */}
                        <a
                          href={`https://wa.me/${order.customerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`¡Hola ${order.customerName}! Nos comunicamos de ${storeConfig.name} sobre tu pedido #${order.orderNumber}.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-colors"
                          title="Contactar al cliente por WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>

                        {/* Botón Ver Detalle */}
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline text-[11px]">Detalle</span>
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL DE DETALLE DEL PEDIDO
         ========================================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-stone-200 my-8 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-stone-400">Detalle de Compra</span>
                <h3 className="text-xl font-black text-zinc-900 uppercase font-mono">
                  Pedido #{selectedOrder.orderNumber}
                </h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-stone-400 hover:text-stone-900 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Datos del Comprador */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2">
              <h4 className="font-bold text-stone-900 uppercase tracking-wider">Datos del Cliente:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-700">
                <p>👤 <strong>Nombre:</strong> {selectedOrder.customerName}</p>
                <p>📱 <strong>Teléfono:</strong> {selectedOrder.customerPhone}</p>
                {selectedOrder.customerEmail && <p>📧 <strong>Email:</strong> {selectedOrder.customerEmail}</p>}
                <p>🚚 <strong>Método:</strong> {selectedOrder.deliveryType === "delivery" ? "Envío a Domicilio" : "Retiro en Showroom"}</p>
                {selectedOrder.address && (
                  <p className="sm:col-span-2">📍 <strong>Dirección:</strong> {selectedOrder.address} {selectedOrder.apartment ? `(Depto: ${selectedOrder.apartment})` : ""} {selectedOrder.city ? `, ${selectedOrder.city}` : ""}</p>
                )}
                {selectedOrder.notes && (
                  <p className="sm:col-span-2 bg-amber-50 p-2 rounded-lg text-amber-900">📝 <strong>Aclaraciones:</strong> {selectedOrder.notes}</p>
                )}
              </div>
            </div>

            {/* Listado de Prendas con Talle y Color */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-stone-900 uppercase tracking-wider border-b border-stone-100 pb-2">
                Prendas Compradas:
              </h4>

              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <div className="space-y-2">
                  {selectedOrder.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-xl border border-stone-100 bg-white">
                      <div>
                        <h5 className="font-bold text-xs text-stone-900">{item.productName}</h5>
                        <div className="flex gap-2 text-[11px] text-stone-500 font-medium pt-0.5">
                          {item.size && <span className="bg-stone-100 px-2 py-0.5 rounded font-bold text-stone-800">Talle: {item.size}</span>}
                          {item.color && <span>Color: {item.color}</span>}
                          <span>x {item.quantity} un.</span>
                        </div>
                      </div>
                      <span className="font-black text-xs text-stone-900">{formatPrice(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-400">Detalle recibido por mensaje directo de WhatsApp.</p>
              )}
            </div>

            {/* Subtotales y Total */}
            <div className="space-y-1.5 pt-3 border-t border-stone-100 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal prendas:</span>
                <span className="font-bold text-stone-900">{formatPrice(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Costo de envío:</span>
                <span className="font-bold text-stone-900">{selectedOrder.shippingCost === 0 ? "Sin cargo" : formatPrice(selectedOrder.shippingCost)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-stone-900 pt-2 border-t border-stone-200">
                <span>Total a cobrar:</span>
                <span className="text-lg">{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Cambiar Estado del Pedido */}
            <div className="space-y-2 pt-4 border-t border-stone-100">
              <label className="font-bold text-xs text-stone-900 uppercase tracking-wider block">
                Actualizar Estado del Pedido:
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "pending", label: "Pendiente" },
                  { id: "preparing", label: "En Preparación" },
                  { id: "ready", label: "Listo para Retiro/Envío" },
                  { id: "delivered", label: "Entregado" },
                  { id: "cancelled", label: "Cancelado" },
                ].map((st) => (
                  <button
                    key={st.id}
                    disabled={updating}
                    onClick={() => handleUpdateStatus(selectedOrder.id, st.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedOrder.orderStatus === st.id
                        ? "bg-zinc-900 text-white shadow-md"
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Botón WhatsApp Directo */}
            <div className="pt-3">
              <a
                href={`https://wa.me/${selectedOrder.customerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`¡Hola ${selectedOrder.customerName}! Nos comunicamos de ${storeConfig.name} para coordinar tu pedido #${selectedOrder.orderNumber}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Abrir Chat de WhatsApp con el Cliente</span>
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
