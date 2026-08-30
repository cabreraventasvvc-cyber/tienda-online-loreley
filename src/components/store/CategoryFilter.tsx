"use client";

import React from "react";
import { Category } from "@/types";
import { 
  Sparkles, 
  Shirt, 
  Flame, 
  Layers, 
  Scissors, 
  Heart, 
  Watch 
} from "lucide-react";

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  totalProductsCount: number;
}

// Mapeo de iconos para tienda de indumentaria
const iconMap: Record<string, React.ReactNode> = {
  Shirt: <Shirt className="w-4 h-4" />,
  Flame: <Flame className="w-4 h-4" />,
  Layers: <Layers className="w-4 h-4" />,
  Scissors: <Scissors className="w-4 h-4" />,
  Heart: <Heart className="w-4 h-4" />,
  Watch: <Watch className="w-4 h-4" />,
  Sparkles: <Sparkles className="w-4 h-4" />,
};

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  totalProductsCount,
}: CategoryFilterProps) {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-sm sm:text-base font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-zinc-700" />
          <span>Categorías</span>
        </h2>
        <span className="text-xs text-zinc-400 font-medium">
          Desliza para ver más →
        </span>
      </div>

      {/* Contenedor con scroll horizontal suave */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        
        {/* Botón: Ver Todo */}
        <button
          onClick={() => onSelectCategory("all")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-xs ${
            selectedCategory === "all"
              ? "bg-zinc-900 text-white shadow-md scale-105"
              : "bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200"
          }`}
        >
          <Sparkles className={`w-3.5 h-3.5 ${selectedCategory === "all" ? "text-amber-400" : "text-zinc-400"}`} />
          <span>Ver Todo</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            selectedCategory === "all" ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-600"
          }`}>
            {totalProductsCount}
          </span>
        </button>

        {/* Botones por categoría de ropa */}
        {categories.map((category) => {
          const isSelected = selectedCategory === category.id;
          const icon = category.iconName ? iconMap[category.iconName] : <Layers className="w-3.5 h-3.5" />;

          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-xs ${
                isSelected
                  ? "bg-zinc-900 text-white shadow-md scale-105"
                  : "bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200"
              }`}
            >
              <span className={isSelected ? "text-amber-400" : "text-zinc-500"}>
                {icon}
              </span>
              <span>{category.name}</span>
              {category.productCount !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isSelected ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-600"
                }`}>
                  {category.productCount}
                </span>
              )}
            </button>
          );
        })}

      </div>
    </div>
  );
}
