import { db } from "@/lib/db";
import { AppliedCoupon, CartItem, Coupon, CouponScope, CouponType } from "@/types";

function parseJsonArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

export function normalizeCouponCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

export function mapDbCoupon(coupon: any): Coupon {
  return {
    id: coupon.id,
    code: coupon.code,
    type: coupon.type as CouponType,
    value: Number(coupon.value),
    active: Boolean(coupon.active),
    expiresAt: coupon.expiresAt ? coupon.expiresAt.toISOString() : null,
    minPurchase: coupon.minPurchase ?? null,
    scope: coupon.scope as CouponScope,
    categoryIds: parseJsonArray(coupon.categoryIds),
    productIds: coupon.products?.map((rel: any) => rel.productId) || [],
    createdAt: coupon.createdAt ? coupon.createdAt.toISOString() : undefined,
  };
}

export function calculateCouponDiscount(coupon: Coupon, items: CartItem[], subtotal: number) {
  const eligibleSubtotal = items.reduce((total, item) => {
    const appliesToItem =
      coupon.scope === "all" ||
      (coupon.scope === "categories" && Boolean(coupon.categoryIds?.includes(item.product.categoryId))) ||
      (coupon.scope === "products" && Boolean(coupon.productIds?.includes(item.product.id)));

    return appliesToItem ? total + item.product.price * item.quantity : total;
  }, 0);

  if (eligibleSubtotal <= 0) return 0;

  const rawDiscount =
    coupon.type === "percentage" ? eligibleSubtotal * (coupon.value / 100) : Math.min(coupon.value, eligibleSubtotal);

  return Math.max(0, Math.min(rawDiscount, subtotal));
}

export async function validateCouponForCart(code: string, items: CartItem[]): Promise<AppliedCoupon> {
  const normalizedCode = normalizeCouponCode(code);
  const subtotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0);

  if (!normalizedCode) {
    throw new Error("Ingresá un código de descuento.");
  }

  if (items.length === 0 || subtotal <= 0) {
    throw new Error("Agregá productos al carrito antes de aplicar un cupón.");
  }

  const dbCoupon = await db.coupon.findUnique({
    where: { code: normalizedCode },
    include: { products: true },
  });

  if (!dbCoupon) {
    throw new Error("El cupón ingresado no existe.");
  }

  const coupon = mapDbCoupon(dbCoupon);

  if (!coupon.active) {
    throw new Error("Este cupón está desactivado.");
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
    throw new Error("Este cupón está vencido.");
  }

  if (coupon.minPurchase && subtotal < coupon.minPurchase) {
    throw new Error(`Este cupón requiere una compra mínima de $ ${coupon.minPurchase.toLocaleString("es-AR")}.`);
  }

  const discount = calculateCouponDiscount(coupon, items, subtotal);

  if (discount <= 0) {
    throw new Error("El cupón no aplica a los productos seleccionados.");
  }

  return {
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    discount,
    message: "Cupón aplicado correctamente.",
  };
}
