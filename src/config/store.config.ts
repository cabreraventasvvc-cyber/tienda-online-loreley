import { StoreConfig } from "@/types";

/**
 * =========================================================================
 * ARCHIVO DE CONFIGURACIÓN CENTRALIZADA DE LA TIENDA (WHITE-LABEL)
 * =========================================================================
 * 
 * Nombre del Comercio: LORELEY - Indumentaria & Tendencias
 * 
 * Para personalizar esta tienda para CUALQUIER otro cliente, simplemente
 * modifica los valores de este archivo.
 */
export const storeConfig: StoreConfig = {
  // 1. INFORMACIÓN DE LA MARCA
  name: "LORELEY",
  tagline: "Indumentaria & Tendencias",
  description: "Diseño exclusivo, tejidos premium y calce impecable. Descubrí nuestra nueva colección con envíos a todo el país y retiro en local.",
  logoText: "LORELEY",
  logoUrl: "", // Opcional: URL a imagen de logo (si está vacío se muestra logoText con tipografía moderna)
  faviconUrl: "/favicon.ico",

  // 2. PALETA DE COLORES Y TEMA
  theme: {
    primaryColor: "#18181b",       // Negro carbón elegante (Botones principales, llamadas a la acción)
    primaryHover: "#27272a",       // Gris carbón para hover
    primaryLight: "#f4f4f5",       // Gris suave para badges, fondos y selectores de talle
    secondaryColor: "#3f3f46",     // Gris medio elegante para subtítulos y bordes
    accentColor: "#d97706",        // Ámbar/Dorado para ofertas, descuentos y novedades
    darkColor: "#09090b",          // Negro puro para encabezados
    lightColor: "#fafaf9",         // Fondo blanco cálido general
  },

  // 3. CONTACTO Y UBICACIÓN
  contact: {
    phone: "+54 9 11 4064-8304",
    whatsapp: "5491140648304",
    displayPhone: "+54 9 11 4064-8304",
    email: "hola@loreley.com",
    address: "Gorriti 4850, Palermo Soho",
    city: "Buenos Aires, Argentina",
    openingHours: "Lunes a Sábados de 11:00 a 20:00 hs",
    instagramUrl: "https://instagram.com/loreley.oficial",
    facebookUrl: "https://facebook.com/loreley.oficial",
    mapsUrl: "https://maps.google.com",
  },

  // 4. ENVÍOS Y LOGÍSTICA
  shipping: {
    pickupEnabled: true,
    pickupAddress: "Local / Showroom: Gorriti 4850 - Buenos Aires",
    pickupInstructions: "Retiro sin cargo de Lunes a Sábados de 11 a 20 hs con el número de pedido.",
    deliveryEnabled: true,
    deliveryCost: 3500,               // Costo estándar de envío a domicilio
    deliveryAreasDescription: "Envíos a todo el país por correo y entregas en el día en CABA y GBA.",
  },

  // 5. MONEDA Y FORMATEO
  currency: {
    symbol: "$",
    code: "ARS",
    locale: "es-AR",
    decimals: 0,
  },

  // 6. TEXTOS DESTACADOS
  texts: {
    heroTitle: "Colección Exclusiva: LORELEY 2026",
    heroSubtitle: "Prendas esenciales confeccionadas con materias primas nobles. Calidad, estilo y confort diseñados para elevar tu look.",
    heroCtaText: "Explorar Colección",
    whatsappOrderGreeting: "¡Hola LORELEY! Quiero confirmar el siguiente pedido que armé en la tienda online:",
  },

  // 7. FUNCIONALIDADES ACTIVAS
  features: {
    enableWhatsAppCheckout: true,
    enableMercadoPago: true,
    enableProductStockBadges: true,
    enableOffersSection: true,
    enableReviews: false,
  },
};
