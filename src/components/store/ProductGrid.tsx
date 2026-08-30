"use client";

import React, { useState, useMemo } from "react";
import { Product } from "@/types";
import { ProductCard } from "./ProductCard";
import { ProductDetailModal } from "./ProductDetailModal";
import { ArrowUpDown, SearchX, Sparkles, Flame } from "lucide-react";

interface ProductGridProps {
  products: Product[];
  selectedCategory: string;
  searchQuery: string;
  onResetFilters: () => void;
}

type SortOption = "featured" | "price-asc" | "price-desc" | "offers" | "newest";

export function ProductGrid({
  products,
  selectedCategory,
  searchQuery,
  onResetFilters,
}: ProductGridProps) {
  const [sortOption, setSortOption] = useState<SortOption>("featured");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Filtrado y ordenamiento en memoria de alto rendimiento
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // 1. Filtro por Categoría
    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter((p) => p.categoryId === selectedCategory);
    }

    // 2. Filtro por Búsqueda (nombre, descripción, tags, categoría)
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // 3. Ordenamiento
    switch (sortOption) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "offers":
        result = result.filter((p) => p.isOffer);
        break;
      case "newest":
        result = result.filter((p) => p.isNew);
        break;
      case "featured":
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortOption]);

  return (
    <div id="catalogo" className="w-full space-y-6 pt-4">
      {/* Barra de Controles y Ordenamiento */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        
        {/* Contador de resultados */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-900">
            {filteredAndSortedProducts.length}{" "}
            {filteredAndSortedProducts.length === 1 ? "producto encontrado" : "productos encontrados"}
          </span>
          {searchQuery && (
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
              para &quot;{searchQuery}&quot;
            </span>
          )}
        </div>

        {/* Selector de ordenamiento */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <label htmlFor="sort-select" className="text-xs font-semibold text-slate-500">
            Ordenar por:
          </label>
          <select
            id="sort-select"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 cursor-pointer"
          >
            <option value="featured">✨ Destacados</option>
            <option value="price-asc">💵 Menor Precio</option>
            <option value="price-desc">💎 Mayor Precio</option>
            <option value="offers">🔥 Solo Ofertas</option>
            <option value="newest">⭐ Novedades</option>
          </select>
        </div>
      </div>

      {/* Grid de Productos */}
      {filteredAndSortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredAndSortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      ) : (
        /* Estado Vacío */
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4 max-w-lg mx-auto my-8">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <SearchX className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            No se encontraron productos
          </h3>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">
            No encontramos coincidencias para tu búsqueda o filtros seleccionados. Probá con otros términos o reseteá los filtros.
          </p>
          <button
            onClick={onResetFilters}
            className="px-6 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold rounded-full transition-all shadow-md"
          >
            Ver todos los productos
          </button>
        </div>
      )}

      {/* Modal de Vista Rápida */}
      {quickViewProduct && (
        <ProductDetailModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}
