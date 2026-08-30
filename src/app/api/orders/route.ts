import { NextRequest, NextResponse } from "next/server";
import { createOrderInDatabase } from "@/lib/data";
import { validateCouponForCart } from "@/lib/coupons";
import { storeConfig } from "@/config/store.config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items = body.items || [];
    const customer = body.customer;
    const subtotal = items.reduce((total: number, item: any) => total + Number(item.product.price) * Number(item.quantity), 0);
    const couponCode = String(body.couponCode || "").trim();
    const appliedCoupon = couponCode ? await validateCouponForCart(couponCode, items) : null;
    const discountTotal = appliedCoupon?.discount || 0;
    const shippingCost = customer?.deliveryType === "delivery" ? Number(storeConfig.shipping.deliveryCost || 0) : 0;
    const total = Math.max(0, subtotal - discountTotal + shippingCost);

    const order = await createOrderInDatabase({
      ...body,
      subtotal,
      discountTotal,
      couponCode: appliedCoupon?.code,
      shippingCost,
      total,
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "No se pudo guardar en base de datos" }, { status: 500 });
    }

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error("API Orders Error:", error);
    const message = error instanceof Error ? error.message : "Error interno del servidor";
    const status = message.includes("cupón") || message.includes("Cupón") || message.includes("compra mínima") ? 400 : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
