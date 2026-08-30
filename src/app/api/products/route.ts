import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const products = await getProducts({
    categoryId: searchParams.get("categoryId") || undefined,
    search: searchParams.get("search") || undefined,
  });

  return NextResponse.json({ success: true, products });
}
