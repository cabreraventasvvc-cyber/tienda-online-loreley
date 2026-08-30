import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mockCategories } from "@/data/mockProducts";

/**
 * GET: Obtener todas las categorías
 */
export async function GET() {
  try {
    const categories = await db.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ success: true, categories });
  } catch (error) {
    return NextResponse.json({ success: true, categories: mockCategories });
  }
}

/**
 * POST: Crear una categoría
 */
export async function POST(req: NextRequest) {
  try {
    const { name, slug, description, image, iconName, order } = await req.json();

    if (!name) {
      return NextResponse.json({ success: false, message: "El nombre es obligatorio." }, { status: 400 });
    }

    const generatedSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const newCategory = await db.category.create({
      data: {
        name,
        slug: generatedSlug,
        description: description || null,
        image: image || null,
        iconName: iconName || "Shirt",
        order: order ? parseInt(order) : 0,
      },
    });

    return NextResponse.json({ success: true, category: newCategory }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json({ success: false, message: "No se pudo crear la categoría." }, { status: 500 });
  }
}
