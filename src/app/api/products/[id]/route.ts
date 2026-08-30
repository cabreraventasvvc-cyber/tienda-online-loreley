import { NextResponse } from "next/server";
import { getProductById, getProducts } from "@/lib/data";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const product = await getProductById(params.id);

  if (!product) {
    return NextResponse.json({ success: false, message: "Producto no encontrado." }, { status: 404 });
  }

  const allProducts = await getProducts();
  const relatedProducts = allProducts
    .filter((item) => item.categoryId === product.categoryId && item.id !== product.id)
    .slice(0, 4);

  return NextResponse.json({ success: true, product, relatedProducts });
}
