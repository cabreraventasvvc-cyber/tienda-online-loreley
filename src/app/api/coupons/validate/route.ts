import { NextRequest, NextResponse } from "next/server";
import { validateCouponForCart } from "@/lib/coupons";

export async function POST(req: NextRequest) {
  try {
    const { code, items } = await req.json();
    const coupon = await validateCouponForCart(String(code || ""), items || []);

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "No se pudo validar el cupón." },
      { status: 400 }
    );
  }
}
