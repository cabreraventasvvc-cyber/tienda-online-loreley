"use client";

import React, { useState, useEffect } from "react";
import { formatPrice } from "@/lib/utils";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X, 
  AlertCircle,
  Camera,
  Image as ImageIcon,
  Link,
  Upload
} from "lucide-react";

interface ProductFormData {
  id?: string;
  name: string;
  slug?: string;
  description: string;
  price: number | string;
  originalPrice?: number | string;
  categoryId: string;
  stock: number | string;
  sku?: string;
  images: string[];
  sizes: string[];
  colors: { name: string; hex?: string }[];
  featured: boolean;
  isOffer: boolean;
  isNew: boolean;
  active: boolean;
}

const defaultSizesList = ["XS", "S", "M", "L", "XL", "XXL", "36", "38", "40", "42", "Único"];
const standardColorsList = [
  { name: "Negro", hex: "#111827" },
  { name: "Blanco", hex: "#ffffff" },
  { name: "Crudo / Beige", hex: "#e7d8c9" },
  { name: "Gris", hex: "#6b7280" },
  { name: "Azul Marino", hex: "#1e3a8a" },
  { name: "Verde Oliva", hex: "#4b5320" },
  { name: "Camel / Suela", hex: "#c29b6e" },
  { name: "Rojo / Bordó", hex: "#991b1b" },
];

const IMAGE_MAX_SIZE = 1200;
const IMAGE_QUALITY = 0.82;

const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("El archivo elegido no es una imagen."));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const scale = Math.min(1, IMAGE_MAX_SIZE / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No se pudo procesar la imagen."));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", IMAGE_QUALITY));
      };
      img.onerror = () => reject(new Error("No se pudo leer la imagen."));
      img.src = String(reader.result);
    };

    reader.onerror = () => reject(new Error("No se pudo cargar el archivo."));
    reader.readAsDataURL(file);
  });
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  // Estado del Modal de Crear / Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    categoryId: "",
    stock: 10,
    sku: "",
    images: [""],
    sizes: ["S", "M", "L"],
    colors: [{ name: "Negro", hex: "#111827" }],
    featured: false,
    isOffer: false,
    isNew: true,
    active: true,
  });

  const [newCustomSize, setNewCustomSize] = useState("");
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");
  const [saving, setSaving] = useState(false);
  const [imageProcessingIndex, setImageProcessingIndex] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Cargar datos
  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/categories"),
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();

      if (prodData.success) setProducts(prodData.products || []);
      if (catData.success) {
        setCategories(catData.categories || []);
        if (catData.categories?.length > 0 && !formData.categoryId) {
          setFormData((prev) => ({ ...prev, categoryId: catData.categories[0].id }));
        }
      }
    } catch (e) {
      console.error("Error loading products/categories:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Abrir Modal para Crear
  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setFormData({
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      categoryId: categories[0]?.id || "",
      stock: 10,
      sku: `LORE-${Math.floor(100 + Math.random() * 900)}`,
      images: ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80"],
      sizes: ["S", "M", "L", "XL"],
      colors: [{ name: "Negro", hex: "#111827" }, { name: "Blanco", hex: "#ffffff" }],
      featured: false,
      isOffer: false,
      isNew: true,
      active: true,
    });
    setIsModalOpen(true);
  };

  // Abrir Modal para Editar
  const handleOpenEditModal = (prod: any) => {
    setIsEditing(true);

    let parsedImages = [];
    let parsedSizes = [];
    let parsedColors = [];

    try {
      parsedImages = typeof prod.images === "string" ? JSON.parse(prod.images) : prod.images || [];
    } catch {
      parsedImages = [prod.images];
    }

    try {
      parsedSizes = typeof prod.sizes === "string" ? JSON.parse(prod.sizes) : prod.sizes || [];
    } catch {}

    try {
      parsedColors = typeof prod.colors === "string" ? JSON.parse(prod.colors) : prod.colors || [];
    } catch {}

    setFormData({
      id: prod.id,
      name: prod.name,
      slug: prod.slug,
      description: prod.description || "",
      price: prod.price,
      originalPrice: prod.originalPrice || "",
      categoryId: prod.categoryId,
      stock: prod.stock,
      sku: prod.sku || "",
      images: parsedImages.length > 0 ? parsedImages : [""],
      sizes: parsedSizes,
      colors: parsedColors,
      featured: Boolean(prod.featured),
      isOffer: Boolean(prod.isOffer),
      isNew: Boolean(prod.isNew),
      active: prod.active !== undefined ? Boolean(prod.active) : true,
    });
    setIsModalOpen(true);
  };

  // Guardar (Crear o Editar)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.categoryId) {
      alert("Completá el nombre, precio y categoría.");
      return;
    }

    setSaving(true);

    try {
      const url = isEditing && formData.id ? `/api/admin/products/${formData.id}` : "/api/admin/products";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setIsModalOpen(false);
        await loadData();
      } else {
        alert(data.message || "Error al guardar el producto.");
      }
    } catch (e) {
      alert("Error de conexión.");
    } finally {
      setSaving(false);
    }
  };

  // Eliminar Producto
  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setDeleteConfirmId(null);
      } else {
        alert(data.message || "No se pudo eliminar el producto.");
      }
    } catch (e) {
      alert("Error al eliminar.");
    }
  };

  // Manejo de Talles
  const toggleSize = (size: string) => {
    setFormData((prev) => {
      const exists = prev.sizes.includes(size);
      if (exists) {
        return { ...prev, sizes: prev.sizes.filter((s) => s !== size) };
      } else {
        return { ...prev, sizes: [...prev.sizes, size] };
      }
    });
  };

  const addCustomSize = () => {
    if (!newCustomSize.trim()) return;
    const s = newCustomSize.trim().toUpperCase();
    if (!formData.sizes.includes(s)) {
      setFormData((prev) => ({ ...prev, sizes: [...prev.sizes, s] }));
    }
    setNewCustomSize("");
  };

  // Manejo de Colores
  const addColor = (name: string, hex: string) => {
    if (!name.trim()) return;
    if (!formData.colors.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setFormData((prev) => ({
        ...prev,
        colors: [...prev.colors, { name: name.trim(), hex }],
      }));
    }
  };

  const removeColor = (colorName: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((c) => c.name !== colorName),
    }));
  };

  // Manejo de Imágenes
  const updateImageUrl = (index: number, url: string) => {
    const updated = [...formData.images];
    updated[index] = url;
    setFormData((prev) => ({ ...prev, images: updated }));
  };

  const handleImageFileSelection = async (index: number, file?: File) => {
    if (!file) return;

    setImageProcessingIndex(index);
    try {
      const compressedImage = await compressImageFile(file);
      updateImageUrl(index, compressedImage);
    } catch (error) {
      alert(error instanceof Error ? error.message : "No se pudo procesar la imagen.");
    } finally {
      setImageProcessingIndex(null);
    }
  };

  const addImageField = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ""] }));
  };

  const removeImageField = (index: number) => {
    if (formData.images.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Filtrado de la tabla
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategoryFilter === "all" || p.categoryId === selectedCategoryFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Cabecera de Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 uppercase font-mono tracking-tight">
            Catálogo de Prendas & Talles
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Administración completa de productos, precios, fotos, ofertas y stock.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-xl transition-all hover:scale-105 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Cargar Nueva Prenda</span>
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar por nombre de prenda o SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          />
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
        </div>

        <select
          value={selectedCategoryFilter}
          onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-700 focus:outline-none"
        >
          <option value="all">Todas las Categorías</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla de Productos */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-4 px-4 sm:px-6">Prenda</th>
                <th className="py-4 px-4">Categoría</th>
                <th className="py-4 px-4">Precio</th>
                <th className="py-4 px-4">Talles</th>
                <th className="py-4 px-4">Stock</th>
                <th className="py-4 px-4">Estado</th>
                <th className="py-4 px-4 sm:px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.map((prod) => {
                let images = [];
                let sizes: string[] = [];
                try {
                  images = typeof prod.images === "string" ? JSON.parse(prod.images) : prod.images || [];
                } catch {
                  images = [prod.images];
                }
                try {
                  sizes = typeof prod.sizes === "string" ? JSON.parse(prod.sizes) : prod.sizes || [];
                } catch {}

                return (
                  <tr key={prod.id} className="hover:bg-stone-50/70 transition-colors">
                    
                    {/* Prenda & Foto */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                          <img
                            src={images[0] || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80"}
                            alt={prod.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-stone-900 text-xs sm:text-sm line-clamp-1">{prod.name}</h4>
                          <span className="text-[10px] font-mono text-stone-400">{prod.sku || "Sin SKU"}</span>
                        </div>
                      </div>
                    </td>

                    {/* Categoría */}
                    <td className="py-4 px-4 font-semibold text-stone-600">
                      {prod.category?.name || "Indumentaria"}
                    </td>

                    {/* Precio & Oferta */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-black text-stone-900 text-sm">{formatPrice(prod.price)}</span>
                        {prod.originalPrice && (
                          <span className="text-[10px] text-amber-600 font-bold line-through">
                            {formatPrice(prod.originalPrice)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Talles */}
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {sizes.length > 0 ? (
                          sizes.map((s, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-stone-100 rounded text-[10px] font-bold text-stone-700">
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-stone-400 text-[10px]">Único</span>
                        )}
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${
                        prod.stock <= 0
                          ? "bg-red-100 text-red-700"
                          : prod.stock <= 5
                          ? "bg-amber-100 text-amber-900"
                          : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {prod.stock} un.
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        prod.active ? "bg-emerald-50 text-emerald-700" : "bg-stone-200 text-stone-500"
                      }`}>
                        {prod.active ? "Activo" : "Oculto"}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(prod)}
                          className="p-2 text-stone-600 hover:text-zinc-900 hover:bg-stone-100 rounded-xl transition-colors"
                          title="Editar prenda"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => setDeleteConfirmId(prod.id)}
                          className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Eliminar prenda"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          MODAL DE CREAR / EDITAR PRENDA
         ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-stone-200 my-8 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <h3 className="text-xl font-black text-zinc-900 uppercase font-mono">
                {isEditing ? "Editar Prenda" : "Cargar Nueva Prenda"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-stone-400 hover:text-stone-900 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-5 text-xs">
              
              {/* Nombre y SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-stone-700 uppercase tracking-wider block">Nombre de la Prenda *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Buzo Hoodie Oversize Premium"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 uppercase tracking-wider block">SKU / Código</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="BUZ-001"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
                  />
                </div>
              </div>

              {/* Categoría, Precio, Precio Oferta y Stock */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 uppercase tracking-wider block">Categoría *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700 uppercase tracking-wider block">Precio Final *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="45000"
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700 uppercase tracking-wider block">Precio Anterior (Oferta)</label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="52000"
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700 uppercase tracking-wider block">Stock Total *</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="15"
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold"
                  />
                </div>
              </div>

              {/* GESTOR DE TALLES */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <label className="font-bold text-stone-800 uppercase tracking-wider block">
                  Talles Disponibles para esta Prenda:
                </label>
                <div className="flex flex-wrap gap-2">
                  {defaultSizesList.map((size) => {
                    const isSelected = formData.sizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`min-w-[40px] h-9 px-3 rounded-xl font-bold text-xs border transition-all ${
                          isSelected ? "bg-zinc-900 text-white border-zinc-900 shadow-sm" : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                {/* Agregar talle personalizado */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newCustomSize}
                    onChange={(e) => setNewCustomSize(e.target.value)}
                    placeholder="Otro talle (ej: 44, 46)..."
                    className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={addCustomSize}
                    className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 font-bold rounded-lg"
                  >
                    + Agregar Talle
                  </button>
                </div>
              </div>

              {/* GESTOR DE COLORES */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <label className="font-bold text-stone-800 uppercase tracking-wider block">
                  Colores Disponibles:
                </label>
                
                {/* Colores Rápidos */}
                <div className="flex flex-wrap gap-2">
                  {standardColorsList.map((col) => {
                    const isAdded = formData.colors.some((c) => c.name.toLowerCase() === col.name.toLowerCase());
                    return (
                      <button
                        key={col.name}
                        type="button"
                        onClick={() => isAdded ? removeColor(col.name) : addColor(col.name, col.hex)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                          isAdded ? "bg-zinc-900 text-white border-zinc-900 shadow-xs" : "bg-stone-50 text-stone-600 border-stone-200"
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full border border-stone-300 inline-block" style={{ backgroundColor: col.hex }} />
                        <span>{col.name}</span>
                        {isAdded && <span className="ml-1 text-zinc-400">✕</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* GESTOR DE FOTOS */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="font-bold text-stone-800 uppercase tracking-wider block">
                    Fotos de la Prenda
                  </label>
                  <button type="button" onClick={addImageField} className="text-zinc-900 font-bold hover:underline">
                    + Agregar otra foto
                  </button>
                </div>
                {formData.images.map((imgUrl, idx) => (
                  <div key={idx} className="rounded-2xl border border-stone-200 bg-stone-50 p-3 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-[96px_1fr] gap-3">
                      <div className="w-full sm:w-24 aspect-square rounded-xl overflow-hidden bg-white border border-stone-200 flex items-center justify-center">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={`Vista previa ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-7 h-7 text-stone-300" />
                        )}
                      </div>

                      <div className="space-y-2 min-w-0">
                        <label className="flex items-center gap-2 text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                          <Link className="w-3.5 h-3.5" />
                          URL de imagen
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            value={imgUrl.startsWith("data:image/") ? "" : imgUrl}
                            onChange={(e) => updateImageUrl(idx, e.target.value)}
                            placeholder="https://images.unsplash.com/photo-..."
                            className="flex-1 min-w-0 px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs"
                          />
                          {formData.images.length > 1 && (
                            <button type="button" onClick={() => removeImageField(idx)} className="shrink-0 text-red-500 font-bold p-2">
                              ✕
                            </button>
                          )}
                        </div>
                        {imgUrl.startsWith("data:image/") && (
                          <p className="text-[10px] text-emerald-700 font-bold">
                            Imagen cargada desde el dispositivo y optimizada automaticamente.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label
                        htmlFor={`product-gallery-${idx}`}
                        className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl font-bold cursor-pointer transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        Elegir de galeria
                      </label>
                      <input
                        id={`product-gallery-${idx}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageFileSelection(idx, e.target.files?.[0])}
                      />

                      <label
                        htmlFor={`product-camera-${idx}`}
                        className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-900 rounded-xl font-bold cursor-pointer transition-colors"
                      >
                        <Camera className="w-4 h-4" />
                        Sacar foto
                      </label>
                      <input
                        id={`product-camera-${idx}`}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => handleImageFileSelection(idx, e.target.files?.[0])}
                      />
                    </div>

                    {imageProcessingIndex === idx && (
                      <p className="text-[10px] font-bold text-stone-500">
                        Preparando imagen para la tienda...
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Descripción */}
              <div className="space-y-1 pt-2 border-t border-stone-100">
                <label className="font-bold text-stone-700 uppercase tracking-wider block">Descripción y Composición</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalles sobre la tela, gramaje, corte y recomendaciones de lavado..."
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              {/* Checkboxes de Estado */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 accent-zinc-900"
                  />
                  <span>Visible en Tienda</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={formData.isOffer}
                    onChange={(e) => setFormData({ ...formData, isOffer: e.target.checked })}
                    className="w-4 h-4 accent-amber-600"
                  />
                  <span>En Oferta</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={formData.isNew}
                    onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                    className="w-4 h-4 accent-zinc-900"
                  />
                  <span>Nuevo Ingreso</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 accent-zinc-900"
                  />
                  <span>Destacado</span>
                </label>
              </div>

              {/* Botón Guardar */}
              <div className="pt-4 border-t border-stone-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-2xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-black uppercase tracking-wider rounded-2xl shadow-xl"
                >
                  {saving ? "Guardando..." : isEditing ? "Guardar Cambios" : "Publicar Prenda"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 text-center border border-stone-200">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
            <h3 className="font-bold text-base text-zinc-900">¿Eliminar esta prenda?</h3>
            <p className="text-xs text-stone-500">Esta acción retirará la prenda del catálogo.</p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-stone-100 font-bold text-xs rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteProduct(deleteConfirmId)}
                className="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
