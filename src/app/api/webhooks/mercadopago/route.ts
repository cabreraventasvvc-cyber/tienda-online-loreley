import { NextRequest, NextResponse } from "next/server";
import { mpPaymentClient } from "@/lib/mercadopago";
import { db } from "@/lib/db";

/**
 * =========================================================================
 * WEBHOOK DE MERCADO PAGO (Notificaciones IPN / Pagos en Tiempo Real)
 * =========================================================================
 * 
 * Recibe eventos de pago desde los servidores de Mercado Pago y actualiza
 * automáticamente el estado del pedido en la base de datos de LORELEY.
 */
export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    // Obtener tipo y ID de notificación (puede venir por query param o por body)
    const topic = searchParams.get("topic") || searchParams.get("type");
    const id = searchParams.get("data.id") || searchParams.get("id");

    let bodyData: any = {};
    try {
      bodyData = await req.json();
    } catch {
      // Si no viene JSON en el body, se usan los query params
    }

    const paymentId = id || bodyData?.data?.id;
    const actionType = topic || bodyData?.type || bodyData?.action;

    // Solo procesamos eventos relacionados a pagos ("payment" o "payment.created" / "payment.updated")
    if (paymentId && (actionType === "payment" || actionType?.includes("payment"))) {
      console.log(`🔔 Webhook recibido de Mercado Pago para Payment ID: ${paymentId}`);

      try {
        // Consultar el estado real del pago con el SDK de Mercado Pago
        const paymentInfo = await mpPaymentClient.get({ id: String(paymentId) });

        if (paymentInfo) {
          const orderNumber = paymentInfo.external_reference;
          const status = paymentInfo.status; // "approved", "pending", "rejected", "refunded", etc.

          if (orderNumber) {
            console.log(`📦 Actualizando pedido #${orderNumber} a estado de pago: ${status}`);

            // Actualizar el pedido en la base de datos
            await db.order.updateMany({
              where: { orderNumber },
              data: {
                paymentStatus: status || "pending",
                mercadoPagoPaymentId: String(paymentId),
                // Si el pago fue aprobado, el pedido pasa automáticamente a "En Preparación"
                orderStatus: status === "approved" ? "preparing" : "pending",
              },
            });
          }
        }
      } catch (sdkError) {
        console.error("Error al consultar pago en Mercado Pago SDK:", sdkError);
      }
    }

    // Mercado Pago requiere una respuesta 200 OK para confirmar recepción
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Error en Webhook de Mercado Pago:", error);
    // Respondemos 200 de todas formas para evitar reintentos infinitos si hubo error de formato
    return NextResponse.json({ received: true, error: true }, { status: 200 });
  }
}
