import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { storeConfig } from "@/config/store.config";
import { Product, CartItem, CustomerData } from "@/types";

/**
 * Combina clases de Tailwind CSS sin conflictos
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea un número como precio según la moneda configurada en store.config.ts
 */
export function formatPrice(amount: number): string {
  const { symbol, locale, decimals } = storeConfig.currency;
  
  const formattedNumber = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);

  return `${symbol} ${formattedNumber}`;
}

/**
 * Calcula el porcentaje de descuento entre el precio original y el precio actual
 */
export function calculateDiscountPercent(price: number, originalPrice?: number): number {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

/**
 * Genera un enlace directo a WhatsApp para consultar sobre un producto específico (con talle/color opcional)
 */
export function getProductWhatsAppInquiryUrl(
  product: Product,
  selectedSize?: string,
  selectedColor?: string
): string {
  let message = `¡Hola ${storeConfig.name}! Me gustaría consultar por la prenda: *${product.name}*`;
  
  if (selectedSize) {
    message += ` en talle *${selectedSize}*`;
  }
  if (selectedColor) {
    message += ` color *${selectedColor}*`;
  }
  
  message += ` (Precio: ${formatPrice(product.price)}). ¿Tienen disponibilidad?`;
  return `https://wa.me/${storeConfig.contact.whatsapp}?text=${encodeURIComponent(message)}`;
}

/**
 * Genera el enlace de WhatsApp con el mensaje estructurado del pedido con talles y colores detallados
 */
export function buildWhatsAppOrderUrl(params: {
  items: CartItem[];
  customer: CustomerData;
  subtotal: number;
  discountTotal?: number;
  couponCode?: string;
  shippingCost: number;
  total: number;
  orderNumber: string;
}): string {
  const { items, customer, subtotal, discountTotal = 0, couponCode, shippingCost, total, orderNumber } = params;
  
  let message = `✨ ${storeConfig.texts.whatsappOrderGreeting}\n\n`;
  message += `🛍️ *PEDIDO #${orderNumber}*\n`;
  message += `👤 *Cliente:* ${customer.fullName}\n`;
  message += `📱 *Teléfono:* ${customer.phone}\n`;
  if (customer.email) {
    message += `📧 *Email:* ${customer.email}\n`;
  }
  
  message += `\n📦 *MÉTODO DE ENTREGA:*\n`;
  if (customer.deliveryType === 'delivery') {
    message += `🚚 *Envío a Domicilio*\n`;
    message += `📍 *Dirección:* ${customer.address || 'A convenir'}`;
    if (customer.apartment) {
      message += ` (Piso/Depto: ${customer.apartment})`;
    }
    if (customer.city) {
      message += `, ${customer.city}`;
    }
    if (customer.postalCode) {
      message += ` (CP: ${customer.postalCode})`;
    }
    message += `\n`;
  } else {
    message += `🏬 *Retiro en Showroom / Local*\n`;
    message += `📍 *Punto de retiro:* ${storeConfig.shipping.pickupAddress}\n`;
  }

  if (customer.notes && customer.notes.trim() !== "") {
    message += `📝 *Observaciones / Aclaraciones:* ${customer.notes}\n`;
  }

  message += `\n👗 *PRENDAS SELECCIONADAS:*\n`;
  items.forEach((item, index) => {
    const itemTotal = item.product.price * item.quantity;
    message += `\n${index + 1}. *${item.product.name}*\n`;
    message += `   • Cantidad: *${item.quantity}*\n`;
    if (item.selectedSize) {
      message += `   • Talle: *${item.selectedSize}*\n`;
    }
    if (item.selectedColor) {
      message += `   • Color: *${item.selectedColor}*\n`;
    }
    message += `   • Precio: ${formatPrice(item.product.price)} c/u\n`;
    message += `   • Subtotal: *${formatPrice(itemTotal)}*\n`;
  });

  message += `\n───────────────────────\n`;
  message += `*Subtotal prendas:* ${formatPrice(subtotal)}\n`;
  if (discountTotal > 0 && couponCode) {
    message += `*Cupón ${couponCode}:* -${formatPrice(discountTotal)}\n`;
  }
  
  if (customer.deliveryType === 'delivery') {
    message += `*Costo de Envío:* ${formatPrice(shippingCost)}\n`;
  } else {
    message += `*Retiro en Showroom:* Sin cargo\n`;
  }

  message += `*TOTAL DEL PEDIDO:* ${formatPrice(total)}\n`;
  message += `───────────────────────\n\n`;
  message += `Por favor, indíquenme los medios de pago disponibles (Transferencia bancaria / Mercado Pago / Efectivo) para coordinar la entrega. ¡Muchas gracias!`;

  return `https://wa.me/${storeConfig.contact.whatsapp}?text=${encodeURIComponent(message)}`;
}
