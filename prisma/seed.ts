import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando siembra de base de datos (Database Seed)...");

  // 1. Limpiar datos existentes
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.storeSetting.deleteMany();

  console.log("🧹 Tablas existentes limpiadas.");

  // 2. Crear Usuario Administrador Inicial
  const passwordHash = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      name: "Administrador LORELEY",
      email: "admin@loreley.com",
      passwordHash,
      role: "ADMIN",
      active: true,
    },
  });
  console.log(`👤 Usuario Administrador creado: ${admin.email} (Contraseña: admin123)`);

  // 3. Crear Categorías de Indumentaria
  const categoriesData = [
    {
      name: "Remeras & Tops",
      slug: "remeras-tops",
      description: "Básicos esenciales en algodón peinado y cortes contemporáneos",
      image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80",
      iconName: "Shirt",
      order: 1,
    },
    {
      name: "Buzos & Hoodies",
      slug: "buzos-hoodies",
      description: "Frisa pesada premium, cortes boxy fit y máxima comodidad",
      image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80",
      iconName: "Flame",
      order: 2,
    },
    {
      name: "Camperas & Tapados",
      slug: "camperas-tapados",
      description: "Abrigos estructurados, puffers y chaquetas de temporada",
      image: "https://images.unsplash.com/photo-1544441893-675973e31985?w=600&q=80",
      iconName: "Layers",
      order: 3,
    },
    {
      name: "Jeans & Denim",
      slug: "jeans-denim",
      description: "Denim rígido y elastizado en lavados clásicos y tendencias",
      image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80",
      iconName: "Scissors",
      order: 4,
    },
    {
      name: "Pantalones & Cargos",
      slug: "pantalones-cargos",
      description: "Pantalones sastreros, cargos de gabardina y joggers",
      image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80",
      iconName: "Sparkles",
      order: 5,
    },
    {
      name: "Vestidos & Monos",
      slug: "vestidos-monos",
      description: "Siluetas fluidas, lino y diseños versátiles",
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80",
      iconName: "Heart",
      order: 6,
    },
    {
      name: "Accesorios",
      slug: "accesorios",
      description: "Carteras de cuero, cinturones, gorros y complementos",
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80",
      iconName: "Watch",
      order: 7,
    },
  ];

  const createdCategories: Record<string, string> = {};

  for (const cat of categoriesData) {
    const created = await prisma.category.create({
      data: cat,
    });
    createdCategories[cat.slug] = created.id;
  }
  console.log(`🏷️ ${categoriesData.length} categorías creadas.`);

  // 4. Crear Productos de Indumentaria con Talles y Colores
  const productsData = [
    {
      name: "Remera Heavy Cotton Oversize",
      slug: "remera-heavy-cotton-oversize",
      description: "Remera confeccionada en 100% algodón peinado 24/1 de alto gramaje. Cuello redondo cerrado de 3cm con ribete reforzado y hombros caídos con calce boxy fit. Una prenda estructural de máxima durabilidad.",
      price: 24900,
      originalPrice: 29000,
      categoryId: createdCategories["remeras-tops"],
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80",
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80",
      ]),
      sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
      colors: JSON.stringify([
        { name: "Negro Profundo", hex: "#111827" },
        { name: "Blanco Óptico", hex: "#ffffff" },
        { name: "Crudo / Vainilla", hex: "#f3ede2" },
        { name: "Verde Oliva", hex: "#4b5320" },
      ]),
      stock: 28,
      featured: true,
      isOffer: true,
      isNew: true,
      active: true,
      sku: "REM-HEAVY-01",
      tags: "oversize,basicos,algodon,premium",
    },
    {
      name: "Buzo Hoodie Frisa Pesada 420g",
      slug: "buzo-hoodie-frisa-pesada-420g",
      description: "Buzo hoodie de frisa premium invisible de 420 gramos con interior afelpado super suave. Capucha doble estructurada sin cordones para una estética limpia, bolsillo canguro y puños con rib ajustado.",
      price: 52900,
      originalPrice: 62000,
      categoryId: createdCategories["buzos-hoodies"],
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80",
        "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&q=80",
      ]),
      sizes: JSON.stringify(["S", "M", "L", "XL"]),
      colors: JSON.stringify([
        { name: "Gris Melange", hex: "#9ca3af" },
        { name: "Negro Washed", hex: "#1f2937" },
        { name: "Camel", hex: "#c29b6e" },
      ]),
      stock: 16,
      featured: true,
      isOffer: true,
      isNew: false,
      active: true,
      sku: "BUZ-HOOD-02",
      tags: "hoodie,abrigo,oversize,invierno",
    },
    {
      name: "Campera Puffer Térmica Matte",
      slug: "campera-puffer-termica-matte",
      description: "Chaqueta puffer térmica con relleno de vellón siliconado hipoalergénico de alta densidad. Exterior de microfibra impermeable acabado mate, cuello alto con cierre termosellado y elástico regulable en cintura.",
      price: 89000,
      originalPrice: 105000,
      categoryId: createdCategories["camperas-tapados"],
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&q=80",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80",
      ]),
      sizes: JSON.stringify(["XS", "S", "M", "L"]),
      colors: JSON.stringify([
        { name: "Negro Mate", hex: "#0a0a0a" },
        { name: "Beige Nude", hex: "#e7d8c9" },
      ]),
      stock: 9,
      featured: true,
      isOffer: true,
      isNew: true,
      active: true,
      sku: "CAM-PUFF-03",
      tags: "puffer,abrigo,impermeable,tendencia",
    },
    {
      name: "Jean Wide Leg High Waist Vintage",
      slug: "jean-wide-leg-high-waist-vintage",
      description: "Pantalón de jean tiro alto con calce wide leg relajado confeccionado en 100% denim rígido de 13.5 oz. Lavado artesanal con detalles sutiles de desgaste y botones metálicos niquelados.",
      price: 58500,
      originalPrice: null,
      categoryId: createdCategories["jeans-denim"],
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80",
        "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&q=80",
      ]),
      sizes: JSON.stringify(["36", "38", "40", "42", "44"]),
      colors: JSON.stringify([
        { name: "Azul Vintage", hex: "#3b82f6" },
        { name: "Celeste Claro", hex: "#93c5fd" },
        { name: "Negro Desgastado", hex: "#374151" },
      ]),
      stock: 22,
      featured: true,
      isOffer: false,
      isNew: false,
      active: true,
      sku: "JEA-WIDE-04",
      tags: "jeans,wide leg,denim,tiro alto",
    },
    {
      name: "Pantalón Sastrero con Pinzas Roma",
      slug: "pantalon-sastrero-pinzas-roma",
      description: "Pantalón sastrero de tiro medio-alto con doble pinza delantera y botamanga ancha. Confeccionado en crepé sastrero con una caída sofisticada ideal para elevar looks casuales o formales.",
      price: 49900,
      originalPrice: 58000,
      categoryId: createdCategories["pantalones-cargos"],
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80",
      ]),
      sizes: JSON.stringify(["S", "M", "L", "XL"]),
      colors: JSON.stringify([
        { name: "Negro", hex: "#111827" },
        { name: "Gris Topo", hex: "#6b7280" },
        { name: "Arena / Beige", hex: "#d1c7b7" },
      ]),
      stock: 14,
      featured: false,
      isOffer: true,
      isNew: true,
      active: true,
      sku: "PAN-SAST-05",
      tags: "sastrero,elegante,pinzas,oficina",
    },
    {
      name: "Vestido Midi de Lino con Espalda Abierta",
      slug: "vestido-midi-lino-espalda-abierta",
      description: "Vestido de corte midi confeccionado en mezcla de lino natural y rayón de textura fresca y liviana. Escote recto con breteles regulables y lazo cruzado en la espalda.",
      price: 64900,
      originalPrice: 75000,
      categoryId: createdCategories["vestidos-monos"],
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
      ]),
      sizes: JSON.stringify(["XS", "S", "M", "L"]),
      colors: JSON.stringify([
        { name: "Lino Natural", hex: "#e5ded3" },
        { name: "Negro", hex: "#111827" },
        { name: "Terracota", hex: "#b45309" },
      ]),
      stock: 11,
      featured: true,
      isOffer: true,
      isNew: false,
      active: true,
      sku: "VES-MIDI-06",
      tags: "vestido,lino,verano,fiesta",
    },
    {
      name: "Tote Bag de Cuero Genuino Minimal",
      slug: "tote-bag-cuero-genuino-minimal",
      description: "Bolso tote espacioso confeccionado en 100% cuero vacuno con curtido vegetal. Interior forrado con compartimento para notebook de 14 pulgadas y bolsillo con cierre para llaves y celular.",
      price: 78000,
      originalPrice: 92000,
      categoryId: createdCategories["accesorios"],
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80",
      ]),
      sizes: JSON.stringify(["Único"]),
      colors: JSON.stringify([
        { name: "Suela / Marrón", hex: "#854d0e" },
        { name: "Negro", hex: "#111827" },
      ]),
      stock: 8,
      featured: true,
      isOffer: true,
      isNew: true,
      active: true,
      sku: "ACC-TOTE-08",
      tags: "cartera,cuero,tote,accesorios",
    },
  ];

  for (const prod of productsData) {
    await prisma.product.create({
      data: prod,
    });
  }
  console.log(`👗 ${productsData.length} prendas creadas con talles y colores.`);

  // 5. Configuración del Comercio Inicial
  const initialSettings = [
    { key: "store_name", value: "AURA Studio", description: "Nombre comercial de la tienda" },
    { key: "whatsapp_number", value: "5491134567890", description: "Número de WhatsApp para pedidos" },
    { key: "delivery_cost", value: "3500", description: "Costo estándar de envío a domicilio" },
    { key: "free_shipping_threshold", value: "50000", description: "Monto para envío gratis" },
  ];

  for (const s of initialSettings) {
    await prisma.storeSetting.create({ data: s });
  }

  console.log("✅ Siembra de base de datos completada exitosamente!");
}

main()
  .catch((e) => {
    console.error("❌ Error en la siembra de base de datos:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
