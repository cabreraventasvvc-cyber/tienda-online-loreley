// ==========================================
// TIPOS PRINCIPALES DE LA TIENDA ONLINE
// ==========================================

export interface ProductColor {
  name: string;
  hex?: string; // Código hexadecimal para mostrar la muestra de color (ej: #000000)
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number; // Para mostrar precios tachados y % de descuento
  categoryId: string;
  categoryName: string;
  images: string[];
  stock: number;
  sizes?: string[];       // Ej: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] o ['36', '38', '40', '42']
  colors?: ProductColor[]; // Ej: [{ name: 'Negro', hex: '#111827' }, { name: 'Beige', hex: '#e7d8c9' }]
  featured?: boolean;
  isOffer?: boolean;
  isNew?: boolean;
  active: boolean;
  sku?: string;
  tags?: string[];
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  iconName?: string;
  productCount?: number;
}

export interface StoreTheme {
  primaryColor: string;       // Color principal (botones, llamadas a la acción)
  primaryHover: string;       // Color hover
  primaryLight: string;       // Fondo suave para badges y banners
  secondaryColor: string;     // Color secundario / contrastes
  accentColor: string;        // Color para ofertas / descuentos / destacados
  darkColor: string;          // Color para textos principales y encabezados
  lightColor: string;         // Fondo claro general
}

export interface StoreConfig {
  // Información de Marca
  name: string;
  tagline: string;
  description: string;
  logoText: string;
  logoUrl?: string;
  faviconUrl?: string;

  // Temas y Colores
  theme: StoreTheme;

  // Contacto y Ubicación
  contact: {
    phone?: string;
    whatsapp: string;          // Número con código de país sin + ni espacios
    displayPhone: string;      // Formato amigable para mostrar en pantalla
    email: string;
    address: string;
    city: string;
    openingHours: string;
    instagramUrl?: string;
    facebookUrl?: string;
    mapsUrl?: string;
  };

  // Envíos y Logística
  shipping: {
    pickupEnabled: boolean;
    pickupAddress: string;
    pickupInstructions: string;
    deliveryEnabled: boolean;
    deliveryCost: number;
    deliveryAreasDescription: string;
  };

  // Moneda y Formato
  currency: {
    symbol: string;            // Ej: $
    code: string;              // Ej: ARS, USD, MXN
    locale: string;            // Ej: es-AR, es-MX
    decimals: number;          // 0 para ARS/CLP, 2 para USD/EUR
  };

  // Textos Personalizados
  texts: {
    heroTitle: string;
    heroSubtitle: string;
    heroCtaText: string;
    whatsappOrderGreeting: string;
  };

  // Flags de Funcionalidad
  features: {
    enableWhatsAppCheckout: boolean;
    enableMercadoPago: boolean;
    enableProductStockBadges: boolean;
    enableOffersSection: boolean;
    enableReviews: boolean;
  };
}

export interface CartItem {
  id: string; // ID único del ítem en carrito compuesto por: `${product.id}-${size || 'nosize'}-${color || 'nocolor'}`
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface CustomerData {
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  apartment?: string; // Piso / Depto
  city?: string;
  postalCode?: string;
  notes?: string;
  deliveryType: 'pickup' | 'delivery';
  paymentMethod: PaymentMethod;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'approved' | 'rejected';
export type PaymentMethod = 'whatsapp' | 'mercadopago' | 'cash_on_delivery' | 'bank_transfer';

export type CouponType = 'percentage' | 'fixed';
export type CouponScope = 'all' | 'categories' | 'products';

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  active: boolean;
  expiresAt?: string | null;
  minPurchase?: number | null;
  scope: CouponScope;
  categoryIds?: string[];
  productIds?: string[];
  createdAt?: string;
}

export interface AppliedCoupon {
  code: string;
  type: CouponType;
  value: number;
  discount: number;
  message: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: CustomerData;
  items: CartItem[];
  subtotal: number;
  discountTotal?: number;
  couponCode?: string;
  shippingCost: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  mercadoPagoPaymentId?: string;
  createdAt: string;
}
