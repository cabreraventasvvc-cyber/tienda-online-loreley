import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mapDbCoupon, normalizeCouponCode } from "@/lib/coupons";
import { requireAdminSession } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireAdminSession();
    const body = await req.json();
    const code = normalizeCouponCode(body.code || "");
    const type = body.type === "fixed" ? "fixed" : "percentage";
    const value = Number(body.value);
    const scope = ["all", "categories", "products"].includes(body.scope) ? body.scope : "all";
    const productIds = Array.isArray(body.productIds) ? body.productIds.filter(Boolean) : [];
    const categoryIds = Array.isArray(body.categoryIds) ? body.categoryIds.filter(Boolean) : [];

    if (!code || !value || value <= 0) {
      return NextResponse.json({ success: false, message: "Código y descuento son obligatorios." }, { status: 400 });
    }

    if (type === "percentage" && value > 100) {
      return NextResponse.json({ success: false, message: "El porcentaje no puede superar el 100%." }, { status: 400 });
    }

    await db.couponProduct.deleteMany({ where: { couponId: params.id } });

    const coupon = await db.coupon.update({
      where: { id: params.id },
      data: {
        code,
        type,
        value,
        active: Boolean(body.active),
        expiresAt: body.expiresAt ? new Date(`${body.expiresAt}T23:59:59`) : null,
        minPurchase: body.minPurchase ? Number(body.minPurchase) : null,
        scope,
        categoryIds: scope === "categories" ? JSON.stringify(categoryIds) : null,
        products: scope === "products" ? { create: productIds.map((productId: string) => ({ productId })) } : undefined,
      },
      include: { products: true },
    });

    return NextResponse.json({ success: true, coupon: mapDbCoupon(coupon) });
  } catch (error: any) {
    const status = error.message === "No autorizado" ? 401 : 500;
    const message = error.code === "P2002" ? "Ya existe un cupón con ese código." : status === 401 ? "No autorizado." : "No se pudo actualizar el cupón.";
    return NextResponse.json({ success: false, message }, { status });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireAdminSession();
    await db.coupon.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true, message: "Cupón eliminado." });
  } catch (error: any) {
    const status = error.message === "No autorizado" ? 401 : 500;
    return NextResponse.json(
      { success: false, message: status === 401 ? "No autorizado." : "No se pudo eliminar el cupón." },
      { status }
    );
  }
}
