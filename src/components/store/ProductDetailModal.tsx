"use client";

import React, { useState, useEffect } from "react";
import { Product } from "@/types";
import { formatPrice, calculateDiscountPercent, getProductWhatsAppInquiryUrl } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import { 
  X, 
  ShoppingBag, 
  Check, 
  MessageCircle, 
  Plus, 
  Minus, 
  Truck, 
  ShieldCheck, 
  Store,
  Sparkles,
  AlertCircle 
} from "lucide-react";
import { storeConfig } from "@/config/store.config";

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

export function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes && product.sizes.length === 1 ? product.sizes[0] : ""
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors && product.colors.length === 1 ? product.colors[0].name : ""
  );
  const [validationError, setValidationError] = useState<string>("");
  const [isAdded, setIsAdded] = useState(false);
  
  const addItem = useCartStore((state) => state.addItem);

  const discountPercent = calculateDiscountPercent(product.price, product.originalPrice);
  const isOutOfStock = product.stock <= 0;

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    // Validación de Talle
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setValidationError("Por favor, seleccioná un talle antes de agregar la prenda al carrito.");
      return;
    }

    // Validación de Color
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      setValidationError("Por favor, seleccioná un color.");
      return;
    }

    setValidationError("");
    addItem(product, quantity, selectedSize || undefined, selectedColor || undefined);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 1200);
  };

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-zinc-950/75 backdrop-blur-xs animate-fadeIn">
      
      {/* Contenedor Modal */}
      <div 
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-zinc-400 hover:text-zinc-800 bg-white/80 hover:bg-zinc-100 rounded-full transition-colors backdrop-blur-sm shadow-xs"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Columna Izquierda: Galería de Imágenes */}
        <div className="w-full md:w-1/2 p-6 bg-zinc-50 flex flex-col justify-between">
          <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-white shadow-inner">
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {product.isOffer && discountPercent > 0 && (
              <span className="absolute top-3 left-3 px-3 py-1 bg-amber-600 text-white font-black text-xs rounded-full shadow-md">
                -{discountPercent}% OFF
              </span>
            )}
            {product.isNew && (
              <span className="absolute top-3 right-3 px-3 py-1 bg-zinc-900 text-white font-bold text-[10px] rounded-full shadow-md uppercase tracking-wider">
                Nuevo Ingreso
              </span>
            )}
          </div>

          {/* Miniaturas si hay más de 1 foto */}
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImageIndex === idx
                      ? "border-zinc-900 scale-105 shadow-md"
                      : "border-zinc-200 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Columna Derecha: Información y Selectores */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto space-y-6">
          <div className="space-y-4">
            
            {/* Categoría y SKU */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">
                {product.categoryName}
              </span>
              {product.sku && (
                <span className="text-[11px] font-mono text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">
                  SKU: {product.sku}
                </span>
              )}
            </div>

            {/* Nombre de la Prenda */}
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 leading-tight">
              {product.name}
            </h2>

            {/* Precios */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-base text-zinc-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Selector de Talle (Obligatorio si existe) */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-zinc-800 uppercase tracking-wider">
                    Talle: <span className="text-zinc-500 font-normal">{selectedSize || "Seleccionar..."}</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setSelectedSize(size);
                        setValidationError("");
                      }}
                      className={`min-w-[42px] h-10 px-3 rounded-xl font-bold text-xs transition-all border ${
                        selectedSize === size
                          ? "bg-zinc-900 text-white border-zinc-900 shadow-md scale-105"
                          : "bg-white text-zinc-700 hover:bg-zinc-100 border-zinc-200"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selector de Color (Obligatorio si existe) */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="font-bold text-xs text-zinc-800 uppercase tracking-wider block">
                  Color: <span className="text-zinc-500 font-normal">{selectedColor || "Seleccionar..."}</span>
                </span>
                <div className="flex flex-wrap gap-2.5 items-center">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => {
                        setSelectedColor(color.name);
                        setValidationError("");
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        selectedColor === color.name
                          ? "bg-zinc-900 text-white border-zinc-900 shadow-sm ring-2 ring-zinc-900/20 scale-105"
                          : "bg-white text-zinc-700 hover:bg-zinc-100 border-zinc-200"
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-zinc-300 shadow-2xs inline-block"
                        style={{ backgroundColor: color.hex || "#ccc" }}
                      />
                      <span>{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mensaje de validación si no eligió talle/color */}
            {validationError && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-semibold">{validationError}</span>
              </div>
            )}

            {/* Descripción */}
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed pt-1">
              {product.description}
            </p>

            {/* Beneficios de Compra */}
            <div className="space-y-2 pt-2 border-t border-zinc-100 text-xs text-zinc-500">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-zinc-700" />
                <span>{storeConfig.shipping.deliveryAreasDescription}</span>
              </div>
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-zinc-700" />
                <span>Retiro sin cargo: {storeConfig.shipping.pickupAddress}</span>
              </div>
            </div>

          </div>

          {/* Controles de Compra */}
          <div className="space-y-3 pt-4 border-t border-zinc-100">
            
            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-zinc-700">Cantidad:</span>
                <div className="flex items-center border border-zinc-200 rounded-xl overflow-hidden bg-zinc-50">
                  <button
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                    className="p-2 text-zinc-600 hover:bg-zinc-200 disabled:opacity-30"
                    aria-label="Disminuir"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-sm font-bold text-zinc-800 font-mono">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrement}
                    disabled={quantity >= product.stock}
                    className="p-2 text-zinc-600 hover:bg-zinc-200 disabled:opacity-30"
                    aria-label="Aumentar"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Botón Agregar al Carrito */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                isOutOfStock
                  ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                  : isAdded
                  ? "bg-emerald-600 text-white shadow-emerald-500/20"
                  : "bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-white shadow-zinc-900/20"
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>¡Agregado al Carrito!</span>
                </>
              ) : isOutOfStock ? (
                <span>Prenda Agotada</span>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  <span>
                    Agregar al Carrito • {formatPrice(product.price * quantity)}
                  </span>
                </>
              )}
            </button>

            {/* Botón Consultar por WhatsApp con Talle/Color */}
            <a
              href={getProductWhatsAppInquiryUrl(product, selectedSize, selectedColor)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-6 rounded-2xl font-bold text-xs sm:text-sm text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Consultar disponibilidad en WhatsApp</span>
            </a>

          </div>

        </div>

      </div>

    </div>
  );
}
