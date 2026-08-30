"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/store/Navbar";
import { Footer } from "@/components/store/Footer";
import { formatPrice, buildWhatsAppOrderUrl } from "@/lib/utils";
import { storeConfig } from "@/config/store.config";
import { 
  CheckCircle2, 
  ShoppingBag, 
  MessageCircle, 
  Truck, 
  Store, 
  CreditCard,
  MapPin, 
  ArrowRight,
  Clock,
  Sparkles,
  Phone
} from "lucide-react";
import { CartItem, CustomerData } from "@/types";

interface StoredOrder {
  orderNumber: string;
  customer: CustomerData;
  items: CartItem[];
  subtotal: number;
  discountTotal?: number;
  couponCode?: string;
  shippingCost: number;
  total: number;
  createdAt: string;
}

export default function OrderSuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.id as string;
  const statusParam = searchParams.get("status") || searchParams.get("collection_status");
  const isMpPayment = searchParams.get("payment_method") === "mercadopago" || Boolean(statusParam);

  const [order, setOrder] = useState<StoredOrder | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = sessionStorage.getItem("last_loreley_order") || sessionStorage.getItem("last_aura_order");
    if (stored) {
      try {
        setOrder(JSON.parse(stored));
      } catch (e) {
        console.error("Error reading order from session", e);
      }
    }
  }, []);

  if (!mounted) return null;

  const handleOpenWhatsAppAgain = () => {
    if (!order) return;
    const url = buildWhatsAppOrderUrl({
      items: order.items,
      customer: order.customer,
      subtotal: order.subtotal,
      discountTotal: order.discountTotal,
      couponCode: order.couponCode,
      shippingCost: order.shippingCost,
      total: order.total,
      orderNumber: order.orderNumber,
    });
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-stone-50">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        
        {/* Cabecera de Confirmación */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/80 shadow-md text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-3.5 py-1 rounded-full uppercase tracking-widest">
              ¡Pedido Registrado con Éxito!
            </span>
            {isMpPayment && (
              <span className="text-xs font-black text-sky-800 bg-sky-50 px-3.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 border border-sky-200">
                <CreditCard className="w-3.5 h-3.5 text-sky-600" />
                <span>Pago Aprobado con Mercado Pago</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-zinc-900 uppercase font-mono tracking-tight">
            Pedido #{order?.orderNumber || orderId}
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
            {isMpPayment
              ? "Tu pago fue procesado correctamente a través de Mercado Pago. Estamos preparando tus prendas para el despacho o retiro."
              : "Se generó el detalle de tu compra. Si no se abrió WhatsApp automáticamente, hacé clic en el botón de abajo para enviar el mensaje con tu pedido."}
          </p>

          <div className="pt-3 flex flex-wrap justify-center gap-3">
            <button
              onClick={handleOpenWhatsAppAgain}
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Contactar al Showroom por WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Detalle del Pedido si existe en sesión */}
        {order && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
            
            <h3 className="font-black text-sm uppercase tracking-wider text-zinc-900 border-b border-stone-100 pb-3 font-mono">
              Detalle de Prendas
            </h3>

            {/* Listado de ítems */}
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-3.5 pb-3 border-b border-stone-100 last:border-0">
                  <div className="w-14 h-18 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900">{item.product.name}</h4>
                      <div className="flex flex-wrap gap-2 text-xs text-stone-500 pt-1">
                        {item.selectedSize && (
                          <span className="font-bold text-zinc-800">Talle: {item.selectedSize}</span>
                        )}
                        {item.selectedColor && (
                          <span>• Color: {item.selectedColor}</span>
                        )}
                        <span>• Cant: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-black text-sm text-zinc-900 self-end">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen de Entrega y Totales */}
            <div className="space-y-2.5 pt-4 border-t border-stone-100 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal prendas:</span>
                <span className="font-bold text-zinc-900">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discountTotal && order.discountTotal > 0 && order.couponCode && (
                <div className="flex justify-between text-emerald-700">
                  <span>Cupón {order.couponCode}:</span>
                  <span className="font-black">-{formatPrice(order.discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Método de entrega:</span>
                <span className="font-bold text-zinc-900">
                  {order.customer.deliveryType === "pickup"
                    ? `Retiro en Showroom (${storeConfig.shipping.pickupAddress})`
                    : `Envío a domicilio (${order.customer.address}, ${order.customer.city})`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Costo de envío:</span>
                <span className="font-bold text-zinc-900">
                  {order.customer.deliveryType === "pickup" ? "Retiro sin cargo" : formatPrice(order.shippingCost)}
                </span>
              </div>
              <div className="flex justify-between items-center text-base pt-3 border-t border-stone-200">
                <span className="font-black text-zinc-900 uppercase">Total:</span>
                <span className="text-2xl font-black text-zinc-900">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>

            {/* Instrucciones de Retiro / Entrega */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs text-stone-600">
              <div className="flex items-center gap-2 font-bold text-zinc-900">
                {order.customer.deliveryType === "pickup" ? (
                  <>
                    <Store className="w-4 h-4 text-amber-600" />
                    <span>Retiro en Showroom</span>
                  </>
                ) : (
                  <>
                    <Truck className="w-4 h-4 text-emerald-600" />
                    <span>Despacho a Domicilio</span>
                  </>
                )}
              </div>
              <p className="leading-relaxed">
                {order.customer.deliveryType === "pickup"
                  ? `${storeConfig.shipping.pickupInstructions} Horarios: ${storeConfig.contact.openingHours}.`
                  : `Tu pedido será preparado y despachado a la dirección ${order.customer.address}. Te compartiremos el número de seguimiento por WhatsApp.`}
              </p>
            </div>

          </div>
        )}

        {/* Botón Volver a la Tienda */}
        <div className="text-center pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-widest rounded-full shadow-md transition-all"
          >
            <span>Seguir Explorando Colección</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}
