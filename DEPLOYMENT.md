# 🚀 Guía de Publicación en Internet & Guía de Reutilización White-Label

Esta guía explica paso a paso cómo publicar la tienda online en Internet de forma profesional y gratuita o de bajo costo, y cómo duplicar y reutilizar este proyecto para vendérselo a diferentes comercios en minutos.

---

## 🌐 OPCIÓN 1: Publicación en Vercel + Supabase (100% Recomendada)

**Vercel** es la plataforma oficial de los creadores de Next.js y ofrece alojamiento global ultra-rápido con certificados SSL (HTTPS) automáticos y gratuitos.

### Paso 1: Subir el proyecto a GitHub
1. Si no tienes cuenta, regístrate gratis en [GitHub.com](https://github.com).
2. En GitHub, crea un nuevo repositorio llamado `tienda-online-loreley` (puedes dejarlo Privado o Público).
3. En la terminal de VS Code en tu proyecto ejecuta:
   ```bash
   git init
   git add .
   git commit -m "Versión lista para producción"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/tienda-online-loreley.git
   git push -u origin main
   ```

### Paso 2: Crear la Base de Datos PostgreSQL Gratuita en Supabase
1. Ingresa a [Supabase.com](https://supabase.com) y crea una cuenta gratuita.
2. Haz clic en **"New Project"** y asígnale un nombre (ej. `loreley-db`).
3. Ve a **Project Settings > Database** y copia la cadena de conexión **URI** (modo *Transaction* o *Session*).
4. El enlace se verá similar a:
   `postgresql://postgres:[TU-PASSWORD]@db.[ID].supabase.co:5432/postgres`

### Paso 3: Configurar Prisma para PostgreSQL
En el archivo `prisma/schema.prisma`, cambia la línea `provider`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Paso 4: Desplegar en Vercel
1. Ingresa a [Vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **"Add New... > Project"** e importa tu repositorio `tienda-online-loreley`.
3. En la sección **Environment Variables**, añade:
   * `DATABASE_URL`: La URL de Supabase que copiaste en el Paso 2.
   * `NEXT_PUBLIC_APP_URL`: `https://tu-proyecto.vercel.app` (o tu dominio).
   * `MP_ACCESS_TOKEN`: Tu Access Token de Mercado Pago (si vas a cobrar con MP).
4. Haz clic en **"Deploy"**. Vercel compilará y publicará la tienda en menos de 2 minutos.

### Paso 5: Crear las Tablas y Sembrar Datos Iniciales en la Nube
En la terminal de tu computadora, ejecuta apuntando a la base de datos de producción:
```bash
npx prisma db push
npm run db:seed
```
¡Listo! La tienda estará 100% operativa en Internet.

### Paso 6: Conectar un Dominio Propio (ej. `tiendaloreley.com` o `.com.ar`)
1. En el panel de Vercel, ve a **Settings > Domains**.
2. Escribe tu dominio (ej. `loreleyindumentaria.com.ar`).
3. Vercel te indicará los registros DNS (CNAME o A) que debes colocar en tu proveedor de dominio (NIC.ar, GoDaddy, Namecheap, DonWeb, etc.).
4. En pocos minutos tendrás tu tienda con dominio propio y candado HTTPS seguro.

---

## 💻 OPCIÓN 2: Despliegue en VPS Propio (Ubuntu / Nginx / PM2)

Si prefieres alojar en un servidor VPS propio (DigitalOcean, AWS, Linode, DonWeb):

```bash
# 1. Clonar el repositorio en el servidor
git clone https://github.com/TU_USUARIO/tienda-online-loreley.git
cd tienda-online-loreley

# 2. Instalar dependencias y compilar
npm install
npx prisma db push
npm run db:seed
npm run build

# 3. Ejecutar con PM2 en segundo plano
npm install -g pm2
pm2 start npm --name "loreley-store" -- start
pm2 save
pm2 startup
```

---

## 🎨 CÓMO REUTILIZAR Y VENDER ESTA TIENDA A OTROS CLIENTES EN 5 MINUTOS

Este proyecto fue construido bajo una **arquitectura White-Label (Marca Blanca)**. Para crear una tienda para un nuevo cliente:

### Paso 1: Duplicar la Carpeta
1. Copia la carpeta `tienda-online` y renómbrala con el nombre del nuevo negocio (ej. `tienda-zapateria-calzados`).
2. Abre la nueva carpeta en **Visual Studio Code**.

### Paso 2: Personalizar `store.config.ts`
Abre el archivo:
👉 `src/config/store.config.ts`

Cambia los datos principales:
```typescript
export const storeConfig: StoreConfig = {
  name: "NUEVO COMERCIO",
  tagline: "Calzados & Zapatillas Urbanas",
  description: "Los mejores calzados con envíos a todo el país.",
  contact: {
    whatsapp: "5491199999999", // WhatsApp del nuevo dueño
    email: "ventas@nuevocomercio.com",
    address: "Av. Corrientes 1234, CABA",
    openingHours: "Lunes a Viernes de 9 a 19 hs",
  },
  shipping: {
    deliveryCost: 4000,
    freeShippingThreshold: 60000,
    pickupAddress: "Local Centro: Av. Corrientes 1234",
  },
  theme: {
    primaryColor: "#0f172a", // Cambia los colores al estilo del nuevo cliente
    accentColor: "#2563eb",
  }
};
```

### Paso 3: Cargar los Productos del Cliente desde el Panel Admin
1. Inicia el servidor (`npm run dev`).
2. Ingresa al panel de administración: `http://localhost:3000/admin/login` con el usuario configurado en `ADMIN_EMAIL` y `ADMIN_PASSWORD`.
3. Entra a **Categorías** y crea las categorías del rubro (ej: Zapatillas, Botas, Sandalias).
4. Entra a **Prendas & Talles** y carga los productos con sus fotos, precios, talles y colores.
5. ¡La nueva tienda está lista para ser entregada al cliente!
