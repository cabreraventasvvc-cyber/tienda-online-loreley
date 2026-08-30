import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * PUT: Actualizar un producto existente
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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

    const generatedSlug =
      slug ||
      name
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const updatedProduct = await db.product.update({
      where: { id },
      data: {
        name,
        slug: generatedSlug,
        description,
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
        sku: sku?.trim() || null,
        tags: Array.isArray(tags) ? tags.join(",") : tags || "",
      },
      include: { category: true },
    });

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, message: "No se pudo actualizar el producto." },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Eliminar un producto
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await db.product.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Producto eliminado con éxito." });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, message: "No se pudo eliminar el producto." },
      { status: 500 }
    );
  }
}
