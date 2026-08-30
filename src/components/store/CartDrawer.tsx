"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/lib/utils";
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight
} from "lucide-react";

export function CartDrawer() {
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((state) => state.items);
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getTotalItems = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const subtotal = getSubtotal();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={closeCart}
          className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs transition-opacity animate-fadeIn"
        />
      )}

      {/* Drawer Panel Lateral */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Cabecera del Carrito */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-zinc-900" />
            <h2 className="font-black text-zinc-900 text-lg uppercase tracking-wider">Tu Carrito</h2>
            <span className="bg-zinc-900 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
              {getTotalItems} {getTotalItems === 1 ? "prenda" : "prendas"}
            </span>
          </div>

          <button
            onClick={closeCart}
            className="p-2 text-zinc-400 hover:text-zinc-800 bg-white rounded-full border border-zinc-200 transition-colors"
            aria-label="Cerrar carrito"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de Prendas en el Carrito */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
              <div className="w-20 h-20 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-zinc-900 text-lg">Tu bolsa de compras está vacía</h3>
                <p className="text-xs text-zinc-500 max-w-xs">
                  ¡Descubrí nuestra colección y sumá tus prendas favoritas!
                </p>
              </div>
              <button
                onClick={closeCart}
                className="px-6 py-2.5 bg-zinc-900 text-white text-xs font-bold rounded-full shadow-md hover:bg-zinc-800 transition-all"
              >
                Ver Colección
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3.5 p-3 rounded-2xl border border-zinc-100 bg-white shadow-2xs hover:border-zinc-300 transition-all"
              >
                {/* Imagen miniatura */}
                <div className="w-20 h-24 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info de Prenda, Talle y Color */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-bold text-zinc-900 text-xs sm:text-sm line-clamp-1 leading-snug">
                        {item.product.name}
                      </h4>
                      
                      {/* Badges de Talle y Color */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-zinc-500 font-medium">
                        {item.selectedSize && (
                          <span className="bg-zinc-100 px-2 py-0.5 rounded-md font-bold text-zinc-800">
                            Talle: {item.selectedSize}
                          </span>
                        )}
                        {item.selectedColor && (
                          <span className="bg-zinc-100 px-2 py-0.5 rounded-md text-zinc-700">
                            Color: {item.selectedColor}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-zinc-400 hover:text-red-600 p-1 transition-colors"
                      title="Eliminar prenda"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {/* Selector de cantidad */}
                    <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden bg-zinc-50">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 text-zinc-600 hover:bg-zinc-200 transition-colors"
                        aria-label="Restar uno"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2.5 text-xs font-bold text-zinc-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 text-zinc-600 hover:bg-zinc-200 transition-colors"
                        aria-label="Sumar uno"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Subtotal del item */}
                    <span className="font-black text-zinc-900 text-sm">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer del Carrito con Totales y Checkout */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-zinc-100 bg-zinc-50/90 space-y-4">
            
            {/* Resumen de Subtotal */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-sm text-zinc-600">
                <span>Subtotal prendas:</span>
                <span className="font-bold text-zinc-900 text-base">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                * Costos de envío o retiro en showroom se seleccionan en el checkout.
              </p>
            </div>

            {/* Botón de Iniciar Compra / Checkout */}
            <Link
              href="/checkout"
              onClick={closeCart}
              className="w-full py-4 px-6 bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-white font-bold text-sm sm:text-base rounded-2xl shadow-xl shadow-zinc-900/20 flex items-center justify-center gap-2 transition-all"
            >
              <span>Iniciar Compra / Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

          </div>
        )}
      </div>
    </>
  );
}
