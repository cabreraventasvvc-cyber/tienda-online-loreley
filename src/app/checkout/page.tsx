"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/store/Navbar";
import { Footer } from "@/components/store/Footer";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice, buildWhatsAppOrderUrl } from "@/lib/utils";
import { storeConfig } from "@/config/store.config";
import { AppliedCoupon, CustomerData } from "@/types";
import { 
  ArrowLeft, 
  ShoppingBag, 
  Truck, 
  Store, 
  MessageCircle, 
  CreditCard, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Lock,
  ArrowRight,
  Loader2
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((state) => state.items);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const clearCart = useCartStore((state) => state.clearCart);

  // Estado del formulario del comprador
  const [customerData, setCustomerData] = useState<CustomerData>({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    apartment: "",
    city: "",
    postalCode: "",
    notes: "",
    deliveryType: "delivery",
    paymentMethod: "whatsapp",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mpLoading, setMpLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !hasHydrated) return null;

  const subtotal = getSubtotal();
  const discountTotal = appliedCoupon?.discount || 0;
  const shippingCost = customerData.deliveryType === "pickup" ? 0 : storeConfig.shipping.deliveryCost;
  const grandTotal = Math.max(0, subtotal - discountTotal + shippingCost);

  // Manejo de cambios en el formulario
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validación del formulario
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!customerData.fullName.trim()) {
      newErrors.fullName = "Ingresá tu nombre y apellido completo.";
    }

    if (!customerData.phone.trim()) {
      newErrors.phone = "Ingresá tu número de teléfono / WhatsApp.";
    } else if (customerData.phone.replace(/\D/g, "").length < 8) {
      newErrors.phone = "Ingresá un número de teléfono válido (mínimo 8 dígitos).";
    }

    if (customerData.deliveryType === "delivery") {
      if (!customerData.address?.trim()) {
        newErrors.address = "Ingresá la calle y número de entrega.";
      }
      if (!customerData.city?.trim()) {
        newErrors.city = "Ingresá tu localidad / ciudad.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApplyCoupon = async () => {
    setCouponError("");
    setCouponMessage("");
    setAppliedCoupon(null);

    if (!couponCode.trim()) {
      setCouponError("Ingresá un código de descuento.");
      return;
    }

    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, items }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setCouponError(data.message || "El cupón no es válido.");
        return;
      }

      setAppliedCoupon(data.coupon);
      setCouponCode(data.coupon.code);
      setCouponMessage(data.coupon.message || "Cupón aplicado correctamente.");
    } catch {
      setCouponError("No se pudo validar el cupón. Probá nuevamente.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponMessage("");
    setCouponError("");
  };

  // Confirmar y procesar el pedido (WhatsApp o Mercado Pago)
  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      alert("Tu carrito de compras está vacío.");
      router.push("/");
      return;
    }

    if (!validateForm()) {
      window.scrollTo({ top: 150, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);
    const orderNumber = `LOR-${Math.floor(10000 + Math.random() * 90000)}`;

    // =========================================================================
    // CASO 1: PAGO CON MERCADO PAGO
    // =========================================================================
    if (customerData.paymentMethod === "mercadopago") {
      setMpLoading(true);
      try {
        const res = await fetch("/api/checkout/mercadopago", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderNumber,
            customer: customerData,
            items,
            subtotal,
            couponCode: appliedCoupon?.code,
            shippingCost,
            total: grandTotal,
          }),
        });

        const data = await res.json();

        if (data.success && data.initPoint) {
          // Guardar resumen en sesión
          sessionStorage.setItem(
            "last_loreley_order",
            JSON.stringify({
              orderNumber,
              customer: customerData,
              items,
              subtotal,
              discountTotal,
              couponCode: appliedCoupon?.code,
              shippingCost,
              total: grandTotal,
              createdAt: new Date().toISOString(),
            })
          );

          clearCart();
          // Redirigir al Checkout de Mercado Pago
          window.location.href = data.initPoint;
          return;
        } else {
          alert(data.message || "Error al conectar con Mercado Pago.");
        }
      } catch (err) {
        alert("Error de conexión al procesar el pago.");
      } finally {
        setIsSubmitting(false);
        setMpLoading(false);
      }
      return;
    }

    // =========================================================================
    // CASO 2: PEDIDO POR WHATSAPP O TRANSFERENCIA BANCARIA
    // =========================================================================
    const whatsappUrl = buildWhatsAppOrderUrl({
      items,
      customer: customerData,
      subtotal,
      discountTotal,
      couponCode: appliedCoupon?.code,
      shippingCost,
      total: grandTotal,
      orderNumber,
    });

    // Guardar en base de datos
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber,
          customer: customerData,
          items,
          subtotal,
          couponCode: appliedCoupon?.code,
          shippingCost,
          total: grandTotal,
          paymentMethod: customerData.paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || "No se pudo registrar el pedido.");
        setIsSubmitting(false);
        return;
      }
    } catch (e) {
      alert("No se pudo registrar el pedido. Revisá tu conexión e intentá nuevamente.");
      setIsSubmitting(false);
      return;
    }

    // Guardar en sesión para la pantalla de recibo
    sessionStorage.setItem(
      "last_loreley_order",
      JSON.stringify({
        orderNumber,
        customer: customerData,
        items,
        subtotal,
        discountTotal,
        couponCode: appliedCoupon?.code,
        shippingCost,
        total: grandTotal,
        createdAt: new Date().toISOString(),
      })
    );

    // Abrir WhatsApp y redirigir
    window.open(whatsappUrl, "_blank");
    clearCart();

    setTimeout(() => {
      router.push(`/pedido/${orderNumber}`);
    }, 500);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-stone-50">
        <Navbar />
        <div className="max-w-md mx-auto text-center py-20 px-4 space-y-5">
          <div className="w-20 h-20 bg-white rounded-full border border-stone-200 text-stone-400 flex items-center justify-center mx-auto shadow-sm">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-zinc-900 uppercase">Tu bolsa está vacía</h2>
          <p className="text-stone-500 text-sm">
            No tenés prendas seleccionadas para finalizar la compra.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-zinc-900 text-white font-bold text-sm uppercase tracking-wider rounded-full shadow-lg hover:bg-zinc-800 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la Tienda</span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-stone-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Cabecera del Checkout */}
        <div className="flex items-center justify-between pb-8 border-b border-stone-200">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-zinc-900 transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a la Colección</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 uppercase tracking-tight font-mono">
              Finalizar Compra • {storeConfig.name}
            </h1>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-stone-500 bg-white px-4 py-2 rounded-full border border-stone-200 shadow-2xs">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Checkout Seguro</span>
          </div>
        </div>

        {/* Grid de 2 Columnas: Formulario (Izquierda) + Resumen de Compra (Derecha) */}
        <form onSubmit={handleCompleteOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
          
          {/* =========================================================================
              COLUMNA IZQUIERDA: DATOS DEL COMPRADOR Y ENTREGA (7 Columnas)
             ========================================================================= */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. SELECCIÓN DE MÉTODO DE ENTREGA */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-stone-100">
                <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h3 className="font-bold text-base text-zinc-900 uppercase tracking-wider">
                  Método de Entrega
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                
                {/* Opción A: Envío a Domicilio */}
                <label
                  onClick={() => setCustomerData((prev) => ({ ...prev, deliveryType: "delivery" }))}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                    customerData.deliveryType === "delivery"
                      ? "border-zinc-900 bg-stone-50/50 shadow-sm"
                      : "border-stone-200 hover:border-stone-300 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <Truck className={`w-5 h-5 ${customerData.deliveryType === "delivery" ? "text-zinc-900" : "text-stone-400"}`} />
                      <span className="font-bold text-sm text-zinc-900">Envío a Domicilio</span>
                    </div>
                    <input
                      type="radio"
                      name="deliveryType"
                      checked={customerData.deliveryType === "delivery"}
                      onChange={() => {}}
                      className="accent-zinc-900 w-4 h-4"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      {storeConfig.shipping.deliveryAreasDescription}
                    </p>
                    <span className="text-xs font-black text-zinc-900 block mt-2">
                      {formatPrice(storeConfig.shipping.deliveryCost)}
                    </span>
                  </div>
                </label>

                {/* Opción B: Retiro en Showroom */}
                <label
                  onClick={() => setCustomerData((prev) => ({ ...prev, deliveryType: "pickup" }))}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                    customerData.deliveryType === "pickup"
                      ? "border-zinc-900 bg-stone-50/50 shadow-sm"
                      : "border-stone-200 hover:border-stone-300 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <Store className={`w-5 h-5 ${customerData.deliveryType === "pickup" ? "text-zinc-900" : "text-stone-400"}`} />
                      <span className="font-bold text-sm text-zinc-900">Retiro en Local / Showroom</span>
                    </div>
                    <input
                      type="radio"
                      name="deliveryType"
                      checked={customerData.deliveryType === "pickup"}
                      onChange={() => {}}
                      className="accent-zinc-900 w-4 h-4"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      {storeConfig.shipping.pickupAddress}
                    </p>
                    <span className="text-xs font-black text-emerald-700 block mt-2">
                      ¡Sin Cargo Adicional!
                    </span>
                  </div>
                </label>

              </div>
            </div>

            {/* 2. DATOS DEL COMPRADOR */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-stone-100">
                <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h3 className="font-bold text-base text-zinc-900 uppercase tracking-wider">
                  Datos de Contacto
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                
                {/* Nombre Completo */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Nombre y Apellido *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Ej: Carolina Pérez"
                    value={customerData.fullName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-stone-50 border rounded-2xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 transition-all ${
                      errors.fullName ? "border-red-500 bg-red-50/20" : "border-stone-200"
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.fullName}</span>
                    </p>
                  )}
                </div>

                {/* WhatsApp / Teléfono */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Teléfono / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Ej: 11 3456-7890"
                    value={customerData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-stone-50 border rounded-2xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 transition-all ${
                      errors.phone ? "border-red-500 bg-red-50/20" : "border-stone-200"
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>

                {/* Email (Opcional) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Email <span className="text-stone-400 font-normal">(Para el comprobante)</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Ej: carolina@gmail.com"
                    value={customerData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
                  />
                </div>

              </div>

              {/* CAMPOS DE DIRECCIÓN (Si eligió Envío a Domicilio) */}
              {customerData.deliveryType === "delivery" && (
                <div className="pt-4 border-t border-stone-100 space-y-4 animate-fadeIn">
                  <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                    Dirección de Entrega
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold text-stone-600">
                        Calle, Altura y Entre Calles *
                      </label>
                      <input
                        type="text"
                        name="address"
                        placeholder="Ej: Gorriti 4850 (e/ Armenia y Malabia)"
                        value={customerData.address}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-stone-50 border rounded-2xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 ${
                          errors.address ? "border-red-500 bg-red-50/20" : "border-stone-200"
                        }`}
                      />
                      {errors.address && (
                        <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors.address}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-stone-600">
                        Piso / Depto / Timbre (Opcional)
                      </label>
                      <input
                        type="text"
                        name="apartment"
                        placeholder="Ej: 2do A"
                        value={customerData.apartment}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-900"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-stone-600">
                        Localidad / Ciudad *
                      </label>
                      <input
                        type="text"
                        name="city"
                        placeholder="Ej: Palermo, CABA"
                        value={customerData.city}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-stone-50 border rounded-2xl text-sm text-stone-900 ${
                          errors.city ? "border-red-500 bg-red-50/20" : "border-stone-200"
                        }`}
                      />
                      {errors.city && (
                        <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors.city}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Observaciones */}
              <div className="pt-3 border-t border-stone-100 space-y-1.5">
                <label className="text-xs font-semibold text-stone-600">
                  Aclaraciones para el Local o Empaquetado (Opcional)
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Ej: Empaquetar para regalo / Tocar timbre García..."
                  value={customerData.notes}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-900"
                />
              </div>

            </div>

            {/* 3. FORMA DE PAGO */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-stone-100">
                <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h3 className="font-bold text-base text-zinc-900 uppercase tracking-wider">
                  Forma de Pago
                </h3>
              </div>

              <div className="space-y-3 pt-2">
                
                {/* Opción 1: Mercado Pago (Oficial) */}
                <label
                  onClick={() => setCustomerData((prev) => ({ ...prev, paymentMethod: "mercadopago" }))}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    customerData.paymentMethod === "mercadopago"
                      ? "border-sky-600 bg-sky-50/40 shadow-xs"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-zinc-900">
                          Pagar con Mercado Pago
                        </h4>
                        <span className="bg-sky-100 text-sky-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                          Tarjeta / Débito / Cuotas
                        </span>
                      </div>
                      <p className="text-xs text-stone-500">
                        Tarjetas de crédito, débito, dinero en cuenta de Mercado Pago y cuotas.
                      </p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={customerData.paymentMethod === "mercadopago"}
                    onChange={() => {}}
                    className="accent-sky-600 w-4 h-4"
                  />
                </label>

                {/* Opción 2: WhatsApp (Directo con el comercio) */}
                <label
                  onClick={() => setCustomerData((prev) => ({ ...prev, paymentMethod: "whatsapp" }))}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    customerData.paymentMethod === "whatsapp"
                      ? "border-emerald-600 bg-emerald-50/40 shadow-xs"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900">
                        Coordinar Pedido por WhatsApp
                      </h4>
                      <p className="text-xs text-stone-500">
                        Te enviamos el detalle, alias para transferencia o coordinamos efectivo.
                      </p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={customerData.paymentMethod === "whatsapp"}
                    onChange={() => {}}
                    className="accent-emerald-600 w-4 h-4"
                  />
                </label>

                {/* Opción 3: Transferencia Bancaria Directa */}
                <label
                  onClick={() => setCustomerData((prev) => ({ ...prev, paymentMethod: "bank_transfer" }))}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    customerData.paymentMethod === "bank_transfer"
                      ? "border-zinc-900 bg-stone-50/50 shadow-xs"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900">
                        Transferencia Bancaria Directa
                      </h4>
                      <p className="text-xs text-stone-500">
                        Obtené los datos bancarios y envianos el comprobante.
                      </p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={customerData.paymentMethod === "bank_transfer"}
                    onChange={() => {}}
                    className="accent-zinc-900 w-4 h-4"
                  />
                </label>

              </div>
            </div>

          </div>

          {/* =========================================================================
              COLUMNA DERECHA: RESUMEN DEL PEDIDO CON TALLES Y BOTÓN FINALIZAR (5 Columnas)
             ========================================================================= */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-md space-y-6 sticky top-28">
              
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="font-black text-base text-zinc-900 uppercase tracking-wider font-mono">
                  Resumen de Compra
                </h3>
                <span className="text-xs font-bold bg-stone-100 px-2.5 py-1 rounded-full text-stone-700">
                  {items.length} {items.length === 1 ? "artículo" : "artículos"}
                </span>
              </div>

              {/* Lista de Prendas Detalladas con Talle y Color */}
              <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 py-2 border-b border-stone-100 last:border-0">
                    <div className="w-14 h-16 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-zinc-900 line-clamp-1">
                          {item.product.name}
                        </h4>
                        <div className="flex flex-wrap gap-1.5 text-[11px] text-stone-500 pt-0.5">
                          {item.selectedSize && (
                            <span className="font-bold text-zinc-800">Talle: {item.selectedSize}</span>
                          )}
                          {item.selectedColor && (
                            <span>• {item.selectedColor}</span>
                          )}
                          <span>• Cant: {item.quantity}</span>
                        </div>
                      </div>
                      <span className="font-black text-xs text-zinc-900 self-end">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totales y Cálculos */}
              <div className="space-y-4 pt-4 border-t border-stone-100 text-sm">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Código de descuento
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      disabled={Boolean(appliedCoupon)}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase());
                        setCouponError("");
                        setCouponMessage("");
                      }}
                      placeholder="Ej: LORELEY10"
                      className="min-w-0 flex-1 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-bold uppercase text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 disabled:text-stone-500"
                    />
                    {appliedCoupon ? (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="rounded-2xl border border-stone-200 px-4 py-3 text-xs font-black uppercase tracking-wider text-stone-700 hover:bg-stone-100"
                      >
                        Quitar
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading}
                        className="rounded-2xl bg-zinc-900 px-4 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-zinc-800 disabled:opacity-60"
                      >
                        {couponLoading ? "Validando..." : "Aplicar cupón"}
                      </button>
                    )}
                  </div>
                  {couponMessage && <p className="text-xs font-semibold text-emerald-700">{couponMessage}</p>}
                  {couponError && <p className="text-xs font-semibold text-red-600">{couponError}</p>}
                </div>

                <div className="flex justify-between text-stone-600 text-xs">
                  <span>Subtotal prendas:</span>
                  <span className="font-bold text-zinc-900">{formatPrice(subtotal)}</span>
                </div>

                {discountTotal > 0 && appliedCoupon && (
                  <div className="flex justify-between text-emerald-700 text-xs">
                    <span>Cupón {appliedCoupon.code}:</span>
                    <span className="font-black">-{formatPrice(discountTotal)}</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-600 text-xs">
                  <span>Envío / Entrega:</span>
                  <span className="font-bold text-zinc-900">
                    {customerData.deliveryType === "pickup"
                      ? "Retiro sin cargo"
                      : formatPrice(shippingCost)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-base pt-3 border-t border-stone-200">
                  <span className="font-black text-zinc-900 uppercase">Total a Pagar:</span>
                  <span className="text-2xl font-black text-zinc-900 tracking-tight">
                    {formatPrice(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Botón Principal Dinámico (Mercado Pago o WhatsApp) */}
              {customerData.paymentMethod === "mercadopago" ? (
                <button
                  type="submit"
                  disabled={isSubmitting || mpLoading}
                  className="w-full py-4 px-6 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-sky-500/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                >
                  {mpLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Conectando con Mercado Pago...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>Pagar con Mercado Pago • {formatPrice(grandTotal)}</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Confirmar Pedido por WhatsApp</span>
                </button>
              )}

              <div className="space-y-2 text-center text-[11px] text-stone-400">
                <p className="flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {customerData.paymentMethod === "mercadopago"
                      ? "Pago 100% encriptado y protegido por Mercado Pago."
                      : "Se abrirá WhatsApp con el resumen de tu compra listo para enviar."}
                  </span>
                </p>
              </div>

            </div>

          </div>

        </form>

      </main>

      <Footer />
    </div>
  );
}
