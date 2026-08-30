import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

/**
 * =========================================================================
 * CLIENTE OFICIAL DE MERCADO PAGO SDK (Node.js)
 * =========================================================================
 * 
 * Se ejecuta EXCLUSIVAMENTE en el Backend (Server Actions y API Routes).
 * Las credenciales privadas nunca se exponen al navegador del cliente.
 */

const mpAccessToken = process.env.MP_ACCESS_TOKEN || "";

export const mpClient = new MercadoPagoConfig({
  accessToken: mpAccessToken || "TEST-0000000000000000-000000-00000000000000000000000000000000-000000000",
  options: {
    timeout: 7000,
  },
});

export const mpPreferenceClient = new Preference(mpClient);
export const mpPaymentClient = new Payment(mpClient);

/**
 * Verifica si las credenciales de Mercado Pago están configuradas
 */
export function isMercadoPagoConfigured(): boolean {
  return Boolean(
    process.env.MP_ACCESS_TOKEN &&
    process.env.MP_ACCESS_TOKEN !== "APP_USR-xxxxxx-xxxxxx" &&
    !process.env.MP_ACCESS_TOKEN.startsWith("TEST-000000")
  );
}
