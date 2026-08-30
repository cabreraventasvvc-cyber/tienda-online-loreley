import { NextRequest, NextResponse } from "next/server";
import { mpPreferenceClient, isMercadoPagoConfigured } from "@/lib/mercadopago";
import { createOrderInDatabase } from "@/lib/data";
import { storeConfig } from "@/config/store.config";
import { CartItem, CustomerData } from "@/types";
import { validateCouponForCart } from "@/lib/coupons";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderNumber,
      customer,
      items,
      subtotal,
      shippingCost,
      total,
      couponCode,
    }: {
      orderNumber: string;
      customer: CustomerData;
      items: CartItem[];
      subtotal: number;
      shippingCost: number;
      total: number;
      couponCode?: string;
    } = body;

    if (!items || items.length === 0 || !customer || !customer.fullName) {
      return NextResponse.json(
        { success: false, message: "Datos de pedido incompletos." },
        { status: 400 }
      );
    }

    const serverSubtotal = items.reduce((sum, item) => sum + Number(item.product.price) * Number(item.quantity), 0);
    const appliedCoupon = couponCode ? await validateCouponForCart(couponCode, items) : null;
    const discountTotal = appliedCoupon?.discount || 0;
    const serverShippingCost = customer.deliveryType === "delivery" ? Number(storeConfig.shipping.deliveryCost || 0) : 0;
    const serverTotal = Math.max(0, serverSubtotal - discountTotal + serverShippingCost);

    // 1. Guardar el pedido en la base de datos como "pendiente de pago"
    await createOrderInDatabase({
      orderNumber,
      customer: { ...customer, paymentMethod: "mercadopago" },
      items,
      subtotal: serverSubtotal,
      discountTotal,
      couponCode: appliedCoupon?.code,
      shippingCost: serverShippingCost,
      total: serverTotal,
      paymentMethod: "mercadopago",
    });

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.headers.get("origin") ||
      "http://localhost:3000";

    // 2. Si Mercado Pago tiene credenciales configuradas, generar la Preferencia Oficial
    if (isMercadoPagoConfigured()) {
      const mpItems =
        discountTotal > 0
          ? [
              {
                id: "pedido-loreley",
                title: `Pedido ${orderNumber}${appliedCoupon ? ` con cupón ${appliedCoupon.code}` : ""}`.slice(0, 120),
                description: "Compra de prendas en TIENDA LORELEY",
                picture_url: items[0]?.product.images[0] || undefined,
                quantity: 1,
                unit_price: Number(Math.max(1, serverSubtotal - discountTotal)),
                currency_id: storeConfig.currency.code || "ARS",
              },
            ]
          : items.map((item) => {
              let title = `${item.product.name}`;
              if (item.selectedSize) title += ` (Talle: ${item.selectedSize})`;
              if (item.selectedColor) title += ` (Color: ${item.selectedColor})`;

              return {
                id: item.id || item.product.id,
                title: title.slice(0, 120),
                description: item.product.description?.slice(0, 200) || title,
                picture_url: item.product.images[0] || undefined,
                quantity: item.quantity,
                unit_price: Number(item.product.price),
                currency_id: storeConfig.currency.code || "ARS",
              };
            });

      // Agregar ítem de costo de envío si corresponde
      if (serverShippingCost > 0 && customer.deliveryType === "delivery") {
        mpItems.push({
          id: "envio-domicilio",
          title: "Costo de Envío a Domicilio",
          description: "Despacho y entrega a domicilio",
          picture_url: undefined,
          quantity: 1,
          unit_price: Number(serverShippingCost),
          currency_id: storeConfig.currency.code || "ARS",
        });
      }

      // Desarmar nombre y apellido
      const nameParts = customer.fullName.trim().split(" ");
      const firstName = nameParts[0] || "Cliente";
      const lastName = nameParts.slice(1).join(" ") || "LORELEY";

      const preference = await mpPreferenceClient.create({
        body: {
          items: mpItems,
          payer: {
            name: firstName,
            surname: lastName,
            email: customer.email || "comprador@loreley.com",
            phone: {
              number: customer.phone.replace(/\D/g, "") || "1134567890",
            },
            address: {
              street_name: customer.address || "Showroom",
              zip_code: customer.postalCode || "1425",
            },
          },
          back_urls: {
            success: `${appUrl}/pedido/${orderNumber}?status=approved&payment_method=mercadopago`,
            pending: `${appUrl}/pedido/${orderNumber}?status=pending&payment_method=mercadopago`,
            failure: `${appUrl}/checkout?error=pago_rechazado`,
          },
          auto_return: "approved",
          external_reference: orderNumber,
          statement_descriptor: "LORELEY TIENDA",
          notification_url: `${appUrl}/api/webhooks/mercadopago`,
        },
      });

      return NextResponse.json({
        success: true,
        initPoint: preference.init_point,
        sandboxInitPoint: preference.sandbox_init_point,
        orderNumber,
      });
    }

    // 3. Modo Simulación / Demo cuando aún no se cargaron tokens en .env
    // Permite al usuario probar el flujo completo y ver la confirmación de compra sin bloquearse
    return NextResponse.json({
      success: true,
      simulated: true,
      initPoint: `${appUrl}/pedido/${orderNumber}?status=approved&payment_method=mercadopago&simulated=true`,
      message: "Modo Demostración activo (Configure MP_ACCESS_TOKEN en .env para pagos en producción).",
      orderNumber,
    });
  } catch (error: any) {
    console.error("Error creating Mercado Pago preference:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Error al conectar con la pasarela de pagos de Mercado Pago.",
      },
      { status: 500 }
    );
  }
}
