# 🛍️ LORELEY - Tienda de Indumentaria Online (White-Label & Multi-Marca)

Plataforma de comercio electrónico profesional de indumentaria, moderna, responsive y fácilmente revendible para cualquier marca o local de ropa.

Desarrollada con **Next.js 14+ (App Router), TypeScript, Tailwind CSS, Zustand, Prisma ORM, Mercado Pago y Soporte PWA**.

---

## 🚀 Cómo Abrir y Ejecutar el Proyecto en Visual Studio Code

### 1. Abrir la Carpeta en VS Code
1. Abre **Visual Studio Code**.
2. Ve al menú superior: **Archivo (File) > Abrir Carpeta (Open Folder...)**.
3. Selecciona la carpeta del proyecto:
   `C:\Users\vanin\.gemini\antigravity\scratch\tienda-online`

### 2. Instalar Dependencias
Abre una terminal integrada en VS Code (`Ctrl + ñ` o `Terminal > Nueva Terminal`) y ejecuta:
```bash
npm install
```

### 3. Base de Datos (Prisma ORM)
Para crear y poblar la base de datos local:
```bash
npx prisma db push
npm run db:seed
```

### 4. Iniciar el Servidor de Desarrollo
```bash
npm run dev
```

* **Tienda Pública:** [http://localhost:3000](http://localhost:3000)
* **Panel de Administración:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
  - **Email:** `admin@loreley.com`
  - **Contraseña:** `admin123`
* **Configuración del Comercio en Vivo:** [http://localhost:3000/admin/configuracion](http://localhost:3000/admin/configuracion)

---

## 📋 Estado del Desarrollo por Etapas (100% COMPLETADO)

- [x] **ETAPA 1: Base de la Arquitectura, Theming White-Label y Catálogo de Indumentaria con Variantes (Talles y Colores)**
- [x] **ETAPA 2: Flujo de Checkout Completo (Datos del Comprador, Envío vs Retiro) y Finalización de Pedidos por WhatsApp**
- [x] **ETAPA 3: Base de Datos Prisma ORM y Modelado de Datos (Productos, Categorías, Pedidos y Administradores)**
- [x] **ETAPA 4: Autenticación y Panel de Administración (Login, Dashboard, CRUD de Prendas, Talles, Stock, Fotos y Ofertas)**
- [x] **ETAPA 5: Pasarela de Pagos con Mercado Pago (Checkout Pro y Webhooks) y Gestión de Pedidos**
- [x] **ETAPA 6: Configuración Dinámica del Comercio desde el Admin y Soporte PWA Móvil**
- [x] **ETAPA 7: Optimización, Seguridad y Guía de Publicación en Internet (Vercel, Supabase, Dominios y Reventa)**

---

## 🌐 Publicación en Internet y Reventa White-Label
Consulta el archivo [`DEPLOYMENT.md`](./DEPLOYMENT.md) para ver la guía completa paso a paso para publicar la tienda en Vercel con base de datos en la nube y cómo duplicar el proyecto para nuevos clientes en 5 minutos.
