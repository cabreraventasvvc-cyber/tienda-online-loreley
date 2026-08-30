import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { storeConfig } from "@/config/store.config";

/**
 * GET: Obtener la configuración actual del comercio
 */
export async function GET() {
  try {
    const settingsList = await db.storeSetting.findMany();

    if (settingsList.length === 0) {
      // Si aún no hay registros en la DB, devolver los valores por defecto de store.config.ts
      return NextResponse.json({
        success: true,
        settings: {
          store_name: storeConfig.name,
          tagline: storeConfig.tagline,
          description: storeConfig.description,
          whatsapp_number: storeConfig.contact.whatsapp,
          display_phone: storeConfig.contact.displayPhone,
          email: storeConfig.contact.email,
          address: storeConfig.contact.address,
          city: storeConfig.contact.city,
          opening_hours: storeConfig.contact.openingHours,
          delivery_cost: String(storeConfig.shipping.deliveryCost),
          pickup_address: storeConfig.shipping.pickupAddress,
          pickup_instructions: storeConfig.shipping.pickupInstructions,
          delivery_areas: storeConfig.shipping.deliveryAreasDescription,
          primary_color: storeConfig.theme.primaryColor,
          accent_color: storeConfig.theme.accentColor,
          currency_symbol: storeConfig.currency.symbol,
        },
      });
    }

    const settingsMap: Record<string, string> = {};
    settingsList.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({ success: true, settings: settingsMap });
  } catch (error) {
    console.warn("DB settings fetch error, returning default store config.");
    return NextResponse.json({
      success: true,
      settings: {
        store_name: storeConfig.name,
        tagline: storeConfig.tagline,
        description: storeConfig.description,
        whatsapp_number: storeConfig.contact.whatsapp,
        display_phone: storeConfig.contact.displayPhone,
        email: storeConfig.contact.email,
        address: storeConfig.contact.address,
        city: storeConfig.contact.city,
        opening_hours: storeConfig.contact.openingHours,
        delivery_cost: String(storeConfig.shipping.deliveryCost),
        pickup_address: storeConfig.shipping.pickupAddress,
        pickup_instructions: storeConfig.shipping.pickupInstructions,
        delivery_areas: storeConfig.shipping.deliveryAreasDescription,
        primary_color: storeConfig.theme.primaryColor,
        accent_color: storeConfig.theme.accentColor,
        currency_symbol: storeConfig.currency.symbol,
      },
    });
  }
}

/**
 * POST / PUT: Guardar o actualizar configuraciones del comercio
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const keys = Object.keys(body);
    for (const key of keys) {
      const val = String(body[key]);
      await db.storeSetting.upsert({
        where: { key },
        update: { value: val },
        create: { key, value: val },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Configuración guardada correctamente en la base de datos.",
    });
  } catch (error) {
    console.error("Error saving store settings:", error);
    return NextResponse.json(
      { success: false, message: "Error al guardar la configuración." },
      { status: 500 }
    );
  }
}
