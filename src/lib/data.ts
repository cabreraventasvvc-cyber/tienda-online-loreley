import { db } from "@/lib/db";
import { Product, Category, Order, CartItem, CustomerData } from "@/types";
import { mockCategories, mockProducts } from "@/data/mockProducts";

/**
 * Parsea un producto de la base de datos a la interfaz Product de TypeScript
 */
function parseDbProduct(dbProd: any): Product {
  let images: string[] = [];
  let sizes: string[] | undefined = undefined;
  let colors: { name: string; hex?: string }[] | undefined = undefined;

  try {
    images = typeof dbProd.images === "string" ? JSON.parse(dbProd.images) : dbProd.images || [];
  } catch {
    images = [dbProd.images];
  }

  try {
    if (dbProd.sizes) {
      sizes = typeof dbProd.sizes === "string" ? JSON.parse(dbProd.sizes) : dbProd.sizes;
    }
  } catch {}

  try {
    if (dbProd.colors) {
      colors = typeof dbProd.colors === "string" ? JSON.parse(dbProd.colors) : dbProd.colors;
    }
  } catch {}

  return {
    id: dbProd.id,
    name: dbProd.name,
    slug: dbProd.slug,
    description: dbProd.description,
    price: dbProd.price,
    originalPrice: dbProd.originalPrice || undefined,
    categoryId: dbProd.categoryId,
    categoryName: dbProd.category?.name || "Indumentaria",
    images: images.length > 0 ? images : ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80"],
    sizes,
    colors,
    stock: dbProd.stock,
    featured: dbProd.featured,
    isOffer: dbProd.isOffer,
    isNew: dbProd.isNew,
    active: dbProd.active,
    sku: dbProd.sku || undefined,
    tags: dbProd.tags ? (typeof dbProd.tags === "string" ? dbProd.tags.split(",") : dbProd.tags) : undefined,
    createdAt: dbProd.createdAt ? dbProd.createdAt.toISOString() : undefined,
  };
}

/**
 * Obtiene todas las categorías activas (con fallback a mockCategories si la BD no está inicializada)
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const dbCategories = await db.category.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { products: { where: { active: true } } },
        },
      },
    });

    if (dbCategories.length > 0) {
      return dbCategories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description || undefined,
        image: c.image || undefined,
        iconName: c.iconName || "Shirt",
        productCount: c._count.products,
      }));
    }
  } catch (error) {
    console.warn("Prisma DB not initialized yet, falling back to static categories.");
  }

  return mockCategories;
}

/**
 * Obtiene los productos con filtros opcionales (con fallback a mockProducts)
 */
export async function getProducts(options?: {
  categoryId?: string;
  search?: string;
  onlyOffers?: boolean;
  onlyFeatured?: boolean;
}): Promise<Product[]> {
  try {
    const where: any = { active: true };

    if (options?.categoryId && options.categoryId !== "all") {
      where.categoryId = options.categoryId;
    }

    if (options?.onlyOffers) {
      where.isOffer = true;
    }

    if (options?.onlyFeatured) {
      where.featured = true;
    }

    if (options?.search && options.search.trim() !== "") {
      const q = options.search.trim();
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
        { tags: { contains: q } },
      ];
    }

    const dbProducts = await db.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    return dbProducts.map(parseDbProduct);
  } catch (error) {
    console.warn("Prisma DB not initialized yet, falling back to static products.");
  }

  return mockProducts;
}

/**
 * Obtiene un producto por su ID o Slug
 */
export async function getProductById(idOrSlug: string): Promise<Product | null> {
  try {
    const dbProd = await db.product.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        active: true,
      },
      include: { category: true },
    });

    if (dbProd) {
      return parseDbProduct(dbProd);
    }
  } catch (error) {
    console.warn("Prisma DB error, falling back to mockProducts.");
  }

  const mock = mockProducts.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
  return mock || null;
}

/**
 * Guarda un nuevo pedido en la base de datos
 */
export async function createOrderInDatabase(orderData: {
  orderNumber: string;
  customer: CustomerData;
  items: CartItem[];
  subtotal: number;
  discountTotal?: number;
  couponCode?: string;
  shippingCost: number;
  total: number;
  paymentMethod?: string;
}): Promise<Order | null> {
  try {
    const { orderNumber, customer, items, subtotal, discountTotal = 0, couponCode, shippingCost, total, paymentMethod } = orderData;

    const newOrder = await db.order.create({
      data: {
        orderNumber,
        customerName: customer.fullName,
        customerPhone: customer.phone,
        customerEmail: customer.email || null,
        deliveryType: customer.deliveryType,
        address: customer.address || null,
        apartment: customer.apartment || null,
        city: customer.city || null,
        postalCode: customer.postalCode || null,
        notes: customer.notes || null,
        subtotal,
        discountTotal,
        couponCode: couponCode || null,
        shippingCost,
        total,
        paymentMethod: paymentMethod || "whatsapp",
        paymentStatus: "pending",
        orderStatus: "pending",
        items: {
          create: items.map((it) => ({
            productId: it.product.id,
            productName: it.product.name,
            productImage: it.product.images[0] || null,
            price: it.product.price,
            quantity: it.quantity,
            size: it.selectedSize || null,
            color: it.selectedColor || null,
            subtotal: it.product.price * it.quantity,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return {
      id: newOrder.id,
      orderNumber: newOrder.orderNumber,
      customer,
      items,
      subtotal: newOrder.subtotal,
      discountTotal: newOrder.discountTotal,
      couponCode: newOrder.couponCode || undefined,
      shippingCost: newOrder.shippingCost,
      total: newOrder.total,
      paymentMethod: newOrder.paymentMethod as any,
      paymentStatus: newOrder.paymentStatus as any,
      orderStatus: newOrder.orderStatus as any,
      createdAt: newOrder.createdAt.toISOString(),
    };
  } catch (error) {
    console.error("Error creating order in DB:", error);
    return null;
  }
}
