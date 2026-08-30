import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mockProducts } from "@/data/mockProducts";

/**
 * GET: Obtener todos los productos (incluyendo inactivos) para el panel admin
 */
export async function GET() {
  try {
    const products = await db.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, products });
  } catch (error) {
    // Si la DB aún no está sincronizada, devolver los datos mock
    return NextResponse.json({ success: true, products: mockProducts });
  }
}

/**
 * POST: Crear un nuevo producto / prenda con talles y colores
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      slug,
      description,
      price,
      originalPrice,
      categoryId,
      images,
      sizes,
      colors,
      stock,
      featured,
      isOffer,
      isNew,
      sku,
      tags,
      active,
    } = body;

    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { success: false, message: "Nombre, precio y categoría son obligatorios." },
        { status: 400 }
      );
    }

    const generatedSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") + `-${Date.now().toString().slice(-4)}`;

    const newProduct = await db.product.create({
      data: {
        name,
        slug: generatedSlug,
        description: description || "",
        price: Number(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        categoryId,
        images: typeof images === "string" ? images : JSON.stringify(images || []),
        sizes: typeof sizes === "string" ? sizes : JSON.stringify(sizes || []),
        colors: typeof colors === "string" ? colors : JSON.stringify(colors || []),
        stock: Number.parseInt(String(stock), 10) || 0,
        featured: Boolean(featured),
        isOffer: Boolean(isOffer),
        isNew: Boolean(isNew),
        active: active !== undefined ? Boolean(active) : true,
        sku: sku?.trim() || `SKU-${Date.now().toString().slice(-6)}`,
        tags: Array.isArray(tags) ? tags.join(",") : tags || "",
      },
      include: { category: true },
    });

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error) {
    console.error("Error creating product in DB:", error);
    return NextResponse.json(
      { success: false, message: "Error al crear el producto en la base de datos." },
      { status: 500 }
    );
  }
}
