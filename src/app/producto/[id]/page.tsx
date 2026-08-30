"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/store/Navbar";
import { Footer } from "@/components/store/Footer";
import { mockProducts } from "@/data/mockProducts";
import { formatPrice, calculateDiscountPercent, getProductWhatsAppInquiryUrl } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import { storeConfig } from "@/config/store.config";
import { 
  ArrowLeft, 
  ShoppingBag, 
  Check, 
  MessageCircle, 
  Truck, 
  Store, 
  ShieldCheck, 
  Plus, 
  Minus,
  Sparkles,
  AlertCircle,
  Ruler
} from "lucide-react";
import { ProductCard } from "@/components/store/ProductCard";
import { Product } from "@/types";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  const fallbackProduct = mockProducts.find((p) => p.id === productId || p.slug === productId) || null;
  const [product, setProduct] = useState<Product | null>(fallbackProduct);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>(
    fallbackProduct
      ? mockProducts.filter((p) => p.categoryId === fallbackProduct.categoryId && p.id !== fallbackProduct.id).slice(0, 4)
      : []
  );
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>(
    fallbackProduct?.sizes && fallbackProduct.sizes.length === 1 ? fallbackProduct.sizes[0] : ""
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    fallbackProduct?.colors && fallbackProduct.colors.length === 1 ? fallbackProduct.colors[0].name : ""
  );
  const [validationError, setValidationError] = useState<string>("");
  const [isAdded, setIsAdded] = useState(false);
  
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      try {
        const res = await fetch(`/api/products/${productId}`, { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && data.success) {
          setProduct(data.product);
          setRelatedProducts(data.relatedProducts || []);
          setSelectedImageIndex(0);
          setQuantity(1);
          setSelectedSize(data.product.sizes?.length === 1 ? data.product.sizes[0] : "");
          setSelectedColor(data.product.colors?.length === 1 ? data.product.colors[0].name : "");
        }
      } catch (error) {
        console.warn("No se pudo cargar el producto dinámico.", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProduct();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (!product && !loading) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <Navbar />
        <div className="text-center py-20 px-4 space-y-4">
          <h2 className="text-2xl font-black text-zinc-900">Prenda no encontrada</h2>
          <p className="text-zinc-500 text-sm">El artículo que buscás no existe o ya no está disponible en la colección.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white font-bold text-sm rounded-full shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Catálogo</span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-zinc-50">
        <Navbar />
        <div className="max-w-md mx-auto py-20 px-4 text-center text-sm font-semibold text-zinc-500">
          Cargando prenda...
        </div>
        <Footer />
      </div>
    );
  }

  const discountPercent = calculateDiscountPercent(product.price, product.originalPrice);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    // Validación de Talle
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setValidationError("Por favor seleccioná un talle antes de agregar al carrito.");
      return;
    }

    // Validación de Color
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      setValidationError("Por favor seleccioná un color.");
      return;
    }

    setValidationError("");
    addItem(product, quantity, selectedSize || undefined, selectedColor || undefined);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-zinc-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-12">
        
        {/* Breadcrumb / Botón volver */}
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 hover:text-zinc-900 transition-colors bg-white px-3.5 py-2 rounded-full border border-zinc-200 shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la colección</span>
          </Link>

          <span className="hidden sm:inline-block text-zinc-400">
            Colección / {product.categoryName} / <span className="text-zinc-800 font-bold">{product.name}</span>
          </span>
        </div>

        {/* Ficha Principal de la Prenda */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-zinc-200/80 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
          
          {/* Columna Izquierda: Galería de Fotos */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] w-full rounded-3xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-inner">
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
              {product.isOffer && discountPercent > 0 && (
                <span className="absolute top-4 left-4 px-4 py-1.5 bg-amber-600 text-white font-black text-sm rounded-full shadow-lg">
                  -{discountPercent}% OFF
                </span>
              )}
              {product.isNew && (
                <span className="absolute top-4 right-4 px-3.5 py-1 bg-zinc-900 text-white font-bold text-xs rounded-full shadow-md uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Nuevo Ingreso</span>
                </span>
              )}
            </div>

            {/* Selector de miniaturas */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-20 h-24 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImageIndex === idx
                        ? "border-zinc-900 scale-105 shadow-md ring-2 ring-zinc-900/20"
                        : "border-zinc-200 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Columna Derecha: Información de Compra */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              
              {/* Categoría y SKU */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-zinc-500 uppercase tracking-widest bg-zinc-100 px-3 py-1 rounded-full">
                  {product.categoryName}
                </span>
                {product.sku && (
                  <span className="text-xs font-mono text-zinc-400 bg-zinc-100 px-2.5 py-1 rounded-md">
                    SKU: {product.sku}
                  </span>
                )}
              </div>

              {/* Título */}
              <h1 className="text-2xl sm:text-4xl font-black text-zinc-900 leading-tight">
                {product.name}
              </h1>

              {/* Precios */}
              <div className="flex items-baseline gap-4 pt-2">
                <span className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-lg sm:text-xl font-medium text-zinc-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              {/* Selector de Talle */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-zinc-100">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-zinc-800 uppercase tracking-wider">
                      Seleccionar Talle: <strong className="text-zinc-900">{selectedSize || "Ninguno"}</strong>
                    </span>
                    <span className="text-zinc-400 flex items-center gap-1">
                      <Ruler className="w-3.5 h-3.5" />
                      Guía de talles disponible
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          setSelectedSize(size);
                          setValidationError("");
                        }}
                        className={`min-w-[48px] h-12 px-4 rounded-2xl font-bold text-sm transition-all border ${
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

              {/* Selector de Color */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-2 pt-3">
                  <span className="font-bold text-xs text-zinc-800 uppercase tracking-wider block">
                    Seleccionar Color: <strong className="text-zinc-900">{selectedColor || "Ninguno"}</strong>
                  </span>
                  <div className="flex flex-wrap gap-3 items-center">
                    {product.colors.map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => {
                          setSelectedColor(color.name);
                          setValidationError("");
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                          selectedColor === color.name
                            ? "bg-zinc-900 text-white border-zinc-900 shadow-md ring-2 ring-zinc-900/20 scale-105"
                            : "bg-white text-zinc-700 hover:bg-zinc-100 border-zinc-200"
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-zinc-300 shadow-2xs inline-block"
                          style={{ backgroundColor: color.hex || "#ccc" }}
                        />
                        <span>{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mensaje de validación si no eligió variante */}
              {validationError && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-2xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-bold">{validationError}</span>
                </div>
              )}

              {/* Descripción completa */}
              <div className="pt-4 border-t border-zinc-100 space-y-2">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Detalles y Composición
                </h3>
                <p className="text-sm sm:text-base text-zinc-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {/* Métodos de Entrega */}
              <div className="space-y-2.5 pt-4 border-t border-zinc-100 text-xs text-zinc-600">
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-zinc-800" />
                  <span><strong>Envíos:</strong> {storeConfig.shipping.deliveryAreasDescription}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Store className="w-4 h-4 text-zinc-800" />
                  <span><strong>Retiro sin cargo:</strong> {storeConfig.shipping.pickupAddress}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Cambios y devoluciones simples en Showroom o por correo</span>
                </div>
              </div>

            </div>

            {/* Controles de Compra */}
            <div className="space-y-4 pt-6 border-t border-zinc-100">
              
              {!isOutOfStock && (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-zinc-700">Cantidad:</span>
                  <div className="flex items-center border border-zinc-200 rounded-2xl overflow-hidden bg-zinc-50">
                    <button
                      onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                      disabled={quantity <= 1}
                      className="p-3 text-zinc-600 hover:bg-zinc-200 disabled:opacity-30 transition-colors"
                      aria-label="Restar cantidad"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-6 text-base font-bold text-zinc-900 font-mono">
                      {quantity}
                    </span>
                    <button
                      onClick={() => quantity < product.stock && setQuantity(quantity + 1)}
                      disabled={quantity >= product.stock}
                      className="p-3 text-zinc-600 hover:bg-zinc-200 disabled:opacity-30 transition-colors"
                      aria-label="Sumar cantidad"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Botón Agregar al Carrito */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full py-4 px-8 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 shadow-xl transition-all ${
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
                    <span>¡Agregado al Carrito con Éxito!</span>
                  </>
                ) : isOutOfStock ? (
                  <span>Sin Stock Disponible</span>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>Agregar al Carrito • {formatPrice(product.price * quantity)}</span>
                  </>
                )}
              </button>

              {/* Botón Consulta por WhatsApp */}
              <a
                href={getProductWhatsAppInquiryUrl(product, selectedSize, selectedColor)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                <span>Consultar por este modelo en WhatsApp</span>
              </a>

            </div>

          </div>

        </div>

        {/* Prendas Relacionadas */}
        {relatedProducts.length > 0 && (
          <section className="space-y-6 pt-8">
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 uppercase tracking-tight">
              Completá tu look con {product.categoryName}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </section>
        )}

      </main>

      <Footer />
    </div>
  );
}
