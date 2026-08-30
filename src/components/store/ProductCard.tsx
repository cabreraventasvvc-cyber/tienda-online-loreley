"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Product } from "@/types";
import { formatPrice, calculateDiscountPercent, getProductWhatsAppInquiryUrl } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import { ShoppingBag, Eye, Check, MessageCircle, Sparkles, AlertCircle, Plus } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const discountPercent = calculateDiscountPercent(product.price, product.originalPrice);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 4;
  const hasVariants = (product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0);

  const handleCardAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    // Si tiene talles o colores, abrimos la vista rápida para que el cliente elija
    if (hasVariants && onQuickView) {
      onQuickView(product);
      return;
    }

    // Si no tiene variantes, se agrega directo
    addItem(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div className="group relative bg-white rounded-3xl border border-zinc-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      
      {/* Contenedor de Imagen y Badges */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-100">
        
        {/* Badges Superiores */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
          {product.isOffer && discountPercent > 0 && (
            <span className="px-3 py-1 bg-amber-600 text-white font-black text-[11px] rounded-full shadow-md flex items-center gap-1">
              <span>-{discountPercent}% OFF</span>
            </span>
          )}
          {product.isNew && (
            <span className="px-2.5 py-0.5 bg-zinc-900 text-white font-bold text-[10px] rounded-full shadow-sm flex items-center gap-1 uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Nuevo Ingreso</span>
            </span>
          )}
        </div>

        {/* Badges de Stock */}
        <div className="absolute top-3 right-3 z-10">
          {isOutOfStock ? (
            <span className="px-2.5 py-1 bg-zinc-900/90 text-white font-bold text-[10px] rounded-full backdrop-blur-xs">
              Sin Stock
            </span>
          ) : isLowStock ? (
            <span className="px-2 py-0.5 bg-rose-600 text-white font-semibold text-[10px] rounded-full flex items-center gap-1 shadow-sm">
              <AlertCircle className="w-3 h-3" />
              <span>Últimos {product.stock}</span>
            </span>
          ) : null}
        </div>

        {/* Imagen con Link a detalle */}
        <Link href={`/producto/${product.id}`} className="block w-full h-full">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        </Link>

        {/* Muestrario rápido de talles en hover para desktop */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="absolute bottom-14 inset-x-3 z-10 hidden sm:flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-zinc-900/85 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 shadow-lg">
              <span className="text-zinc-400">Talles:</span>
              <span>{product.sizes.join(" • ")}</span>
            </div>
          </div>
        )}

        {/* Botón Flotante de Vista Rápida en Desktop */}
        <div className="absolute inset-x-3 bottom-3 hidden sm:flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <button
            onClick={() => onQuickView && onQuickView(product)}
            className="w-full py-2.5 px-4 bg-white/95 hover:bg-white text-zinc-900 font-bold text-xs rounded-2xl shadow-xl backdrop-blur-sm flex items-center justify-center gap-2 border border-zinc-200 transition-all hover:scale-[1.02]"
          >
            <Eye className="w-4 h-4 text-zinc-700" />
            <span>Seleccionar Talle / Color</span>
          </button>
        </div>
      </div>

      {/* Información del Producto */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Categoría */}
          <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
            {product.categoryName}
          </span>

          {/* Título */}
          <Link href={`/producto/${product.id}`} className="block group-hover:text-zinc-600 transition-colors">
            <h3 className="font-bold text-sm sm:text-base text-zinc-900 line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Paleta de colores disponibles (swatches circulares) */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1.5 pt-2">
              {product.colors.map((c, idx) => (
                <span
                  key={idx}
                  title={c.name}
                  className="w-3.5 h-3.5 rounded-full border border-zinc-300 shadow-2xs inline-block"
                  style={{ backgroundColor: c.hex || "#ccc" }}
                />
              ))}
              <span className="text-[10px] text-zinc-400 font-medium ml-1">
                {product.colors.length} {product.colors.length === 1 ? "color" : "colores"}
              </span>
            </div>
          )}
        </div>

        {/* Precios */}
        <div className="pt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-black text-zinc-900 tracking-tight">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs sm:text-sm font-medium text-zinc-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Acciones: Botón Agregar / Elegir Talle & WhatsApp */}
        <div className="pt-2 flex items-center gap-2">
          <button
            onClick={handleCardAction}
            disabled={isOutOfStock}
            className={`flex-1 py-3 px-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-200 ${
              isOutOfStock
                ? "bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200"
                : isAdded
                ? "bg-emerald-600 text-white shadow-emerald-500/20"
                : "bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-white"
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>¡Agregado!</span>
              </>
            ) : isOutOfStock ? (
              <span>Sin Stock</span>
            ) : hasVariants ? (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Elegir Talle</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Agregar</span>
              </>
            )}
          </button>

          {/* Botón consulta rápida WhatsApp */}
          <a
            href={getProductWhatsAppInquiryUrl(product)}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-2xl bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition-colors shrink-0"
            title="Consultar por WhatsApp"
            aria-label="Consultar por WhatsApp"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
          </a>
        </div>

      </div>

    </div>
  );
}
