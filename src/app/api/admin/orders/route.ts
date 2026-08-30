import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET: Obtener todos los pedidos con sus ítems
 */
export async function GET() {
  try {
    const orders = await db.order.findMany({
      include: {
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    return NextResponse.json({ success: true, orders: [] });
  }
}

/**
 * PUT: Actualizar el estado de un pedido (orderStatus o paymentStatus)
 */
export async function PUT(req: NextRequest) {
  try {
    const { orderId, orderStatus, paymentStatus } = await req.json();

    const data: any = {};
    if (orderStatus) data.orderStatus = orderStatus;
    if (paymentStatus) data.paymentStatus = paymentStatus;

    const updated = await db.order.update({
      where: { id: orderId },
      data,
      include: { items: true },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { success: false, message: "No se pudo actualizar el pedido." },
      { status: 500 }
    );
  }
}
