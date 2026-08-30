"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartItem, Product } from "@/types";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  hasHydrated: boolean;
  
  // Acciones
  addItem: (product: Product, quantity?: number, selectedSize?: string, selectedColor?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  setHasHydrated: (state: boolean) => void;

  // Getters calculados
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      hasHydrated: false,

      addItem: (product: Product, quantity = 1, selectedSize?: string, selectedColor?: string) => {
        const currentItems = get().items;
        
        // Generar un ID único según producto + talle + color
        const itemId = `${product.id}_${selectedSize || "std"}_${selectedColor || "std"}`;

        const existingItemIndex = currentItems.findIndex(
          (item) => item.id === itemId
        );

        if (existingItemIndex > -1) {
          const updatedItems = [...currentItems];
          const newQty = updatedItems[existingItemIndex].quantity + quantity;
          
          // Respetar stock máximo si está disponible
          const finalQty = product.stock ? Math.min(newQty, product.stock) : newQty;
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: finalQty,
          };
          set({ items: updatedItems, isOpen: true });
        } else {
          const initialQty = product.stock ? Math.min(quantity, product.stock) : quantity;
          set({
            items: [
              ...currentItems,
              {
                id: itemId,
                product,
                quantity: initialQty,
                selectedSize,
                selectedColor,
              },
            ],
            isOpen: true,
          });
        }
      },

      removeItem: (itemId: string) => {
        set({
          items: get().items.filter((item) => item.id !== itemId),
        });
      },

      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        set({
          items: get().items.map((item) => {
            if (item.id === itemId) {
              const maxQty = item.product.stock ? Math.min(quantity, item.product.stock) : quantity;
              return { ...item, quantity: maxQty };
            }
            return item;
          }),
        });
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      setHasHydrated: (state: boolean) => set({ hasHydrated: state }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },
    }),
    {
      name: "aura_cart_storage",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
