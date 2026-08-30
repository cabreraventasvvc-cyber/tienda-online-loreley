"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/store/Navbar";
import { BannerHero } from "@/components/store/BannerHero";
import { CategoryFilter } from "@/components/store/CategoryFilter";
import { ProductGrid } from "@/components/store/ProductGrid";
import { Footer } from "@/components/store/Footer";
import { mockCategories, mockProducts } from "@/data/mockProducts";
import { Category, Product } from "@/types";
import { storeConfig } from "@/config/store.config";
import { ShieldCheck, Truck, Clock, Sparkles } from "lucide-react";

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadStoreData() {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch("/api/products", { cache: "no-store" }),
          fetch("/api/categories", { cache: "no-store" }),
        ]);
        const [productsData, categoriesData] = await Promise.all([
          productsRes.json(),
          categoriesRes.json(),
        ]);

        if (!cancelled) {
          if (productsData.success) setProducts(productsData.products || []);
          if (categoriesData.success) setCategories(categoriesData.categories || []);
        }
      } catch (error) {
        console.warn("No se pudieron cargar datos dinámicos, usando catálogo demo.", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadStoreData();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      
      {/* 1. Barra de Navegación Principal */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <main className="flex-1">
        
        {/* 2. Banner Hero Principal (Se muestra solo si no hay búsqueda activa) */}
        {!searchQuery && (
          <BannerHero
            onExploreClick={() => {
              const el = document.getElementById("catalogo-section");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
          />
        )}

        {/* 3. Sección de Catálogo y Filtros */}
        <section id="catalogo-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
          
          {/* Selector de Categorías */}
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(catId) => {
              setSelectedCategory(catId);
            }}
            totalProductsCount={products.length}
          />

          {loading && (
            <div className="rounded-2xl border border-stone-200 bg-white p-4 text-sm font-semibold text-stone-500">
              Cargando catálogo actualizado...
            </div>
          )}

          {/* Grid de Productos con Ordenamiento y Búsqueda */}
          <ProductGrid
            products={products}
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            onResetFilters={handleResetFilters}
          />

        </section>

        {/* 4. Sección de Confianza y Garantías */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-900 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-zinc-900 text-sm uppercase tracking-wider">Envíos a todo el país</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Despachamos en el día con seguimiento online a todo el territorio nacional.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-zinc-900 text-sm uppercase tracking-wider">Diseño y Calidad Premium</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Algodón de alto gramaje, costuras reforzadas y terminaciones de autor.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-zinc-900 text-sm uppercase tracking-wider">Cambios Sin Complicaciones</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  30 días para cambio de talle o modelo en Showroom o por correo.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-800 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-zinc-900 text-sm uppercase tracking-wider">Atención Personalizada</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Asesoramiento de talles y calces en tiempo real por WhatsApp.
                </p>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* 5. Pie de Página */}
      <Footer />

    </div>
  );
}
