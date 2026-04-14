# Registro de Actividad de IA - Soulforge

Este archivo registra las intervenciones de la IA, fallos, éxitos y arquitecturas aprobadas según el protocolo estricto.

## 🟢 [ÉXITO] - 2026-04-14
- **Tarea:** Limpieza de seguridad y eliminación de datos sensibles.
- **Acción:** 
  - Se reemplazaron las credenciales reales de Supabase en `.env.example` por placeholders.
  - Se eliminó un token JWT hardcodeado en `pages/Login.tsx`.
  - Se eliminaron archivos basura: `import_log.txt` y `components/Layout.tsx.backup`.
- **Modo:** Mejorar
- **Commit:** `fix(Mejorar): limpieza de seguridad y eliminación de credenciales expuestas`

---

## 🟢 [ÉXITO] - 2026-04-14
- **Tarea:** Resolución de vulnerabilidades de dependencias.
- **Acción:** 
  - Se ejecutó `npm audit fix` para corregir 7 vulnerabilidades (3 moderate, 3 high, 1 critical).
  - Se actualizaron paquetes clave como `vite`, `rollup`, `picomatch`, y `yaml`.
- **Modo:** Mejorar
- **Commit:** `fix(Mejorar): corregir 7 vulnerabilidades de dependencias detectadas por npm audit`

---

## 🟢 [ÉXITO] - 2026-04-14
- **Tarea:** Optimización de SEO.
- **Acción:** 
  - Se configuró el idioma principal en `es` en `index.html`.
  - Se añadieron meta-etiquetas de descripción y keywords globales.
  - Se crearon archivos `public/robots.txt` y `public/sitemap.xml`.
  - Se implementaron datos estructurados (JSON-LD) en el componente `SEO` para mejorar la visibilidad de la tienda en Google.
- **Modo:** Desarrollar
- **Commit:** `feat(Desarrollar): mejorar SEO con sitemap, robots.txt, metadatos y datos estructurados`

---

## 🟢 [ÉXITO] - 2026-04-14
- **Tarea:** Corrección de carga de imágenes y placeholders.
- **Acción:** 
  - Se generó e instaló un archivo `public/placeholder.jpg` para evitar errores 404 de recursos faltantes.
  - Se desactivó temporalmente el servicio de optimización de imágenes de Supabase (`/render/image/`) en `utils/imageValidation.ts`, ya que este servicio requiere un plan de pago y estaba causando que las imágenes no se mostraran en el plan gratuito.
- **Modo:** Mejorar
- **Commit:** `fix(Mejorar): solucionar error 404 de placeholder y restaurar visibilidad de imágenes`

---

## 🟢 [ÉXITO] - 2026-04-14
- **Tarea:** Refactorización de URLs de assets de Supabase.
- **Acción:** 
  - Se identificaron URLs harcodeadas con un ID de proyecto específico (`ydcbptnxlslljccwedwi`) en `constants.ts`, `Navbar.tsx` y `ThemedLogo.tsx`.
  - Se modificaron para que dependan dinámicamente de `VITE_SUPABASE_URL` configurado en el `.env.local`. Esto asegura que los logos, avatares y assets base funcionen siempre en el servidor de Supabase actual sin necesidad de cambios manuales en el código.
- **Modo:** Mejorar
- **Commit:** `fix(Mejorar): hacer que las URLs de assets sean dinámicas para evitar errores en proyectos distintos`

---

## 🟢 [ÉXITO] - 2026-04-14
- **Tarea:** Corrección de dominio en metadatos de SEO.
- **Acción:** 
  - Se actualizó `public/sitemap.xml` y `public/robots.txt` para reflejar el dominio real del cliente: `www.soulforgeminiaturas.com.ar`.
  - Esto es necesario para que Google Search Console pueda validar y procesar correctamente el sitemap.
- **Modo:** Mejorar
- **Commit:** `fix(Mejorar): actualizar dominio real en sitemap.xml y robots.txt para Google Search Console`

---

## 🟢 [ÉXITO] - 2026-04-14
- **Tarea:** Ajuste de sitemap para dominio sin `www`.
- **Acción:** 
  - Se eliminó el prefijo `www.` de las URLs en `public/sitemap.xml` y `public/robots.txt`.
  - Esta acción se realizó para que el sitemap coincida exactamente con la propiedad configurada en Google Search Console (`soulforgeminiaturas.com.ar`), evitando errores de validación de ruta.
- **Modo:** Mejorar
- **Commit:** `fix(Mejorar): ajustar sitemap.xml y robots.txt al dominio sin www para coincidir con Search Console`

---

## 🟢 [ÉXITO] - 2026-04-14
- **Tarea:** Implementación de SEO Élite y optimización de arquitectura.
- **Acción:** 
  - **Canonical Tags:** Se añadió soporte para etiquetas canónicas dinámicas en el componente `SEO.tsx` para evitar penalizaciones por contenido duplicado.
  - **Accesibilidad y SEO de Imágenes:** Se añadió una etiqueta `<img>` oculta con texto `alt` descriptivo en `ProductCard.tsx` para que Google Imágenes procese correctamente los productos.
  - **Jerarquía de Encabezados:** Se corrigió el `HeroSection.tsx` para asegurar que solo exista un `<h1>` por página (en el primer slide del carousel).
  - **Centralización de Assets:** Se refactorizaron las URLs de banners y máscaras en `constants.ts`, eliminando todas las dependencias harcodeadas de proyectos anteriores.
- **Modo:** Mejorar
- **Commit:** `feat(Mejorar): implementar mejoras de SEO élite y centralización de assets`

---

## 🟢 [ÉXITO] - 2026-04-14
- **Tarea:** Implementación de SEO Pro (Sincronización de URLs y Esquemas Enriquecidos).
- **Acción:** 
  - **URL Synchronization:** Se implementó un sistema de ruteo manual en `App.tsx` que sincroniza el `ViewState` con la barra de direcciones del navegador mediante `pushState`. Esto permite enlaces profundos (deeplinks) y que Google indexe páginas individuales del catálogo.
  - **JSON-LD Enriquecido:** Se mejoró el componente `SEO.tsx` para emitir datos estructurados de tipo `Product` con precio, moneda y disponibilidad cuando hay un producto activo.
  - **Breadcrumb List Schema:** Se añadió soporte para el esquema `BreadcrumbList`, permitiendo que los resultados en Google muestren rutas de navegación integradas.
  - **Deep Linking:** La aplicación ahora resuelve la vista correcta basándose en el path de la URL al cargar (ej. `/product/id` abre el detalle del producto).
- **Modo:** Desarrollar
- **Commit:** `feat(Desarrollar): sincronizar URLs y enriquecer esquemas JSON-LD para SEO Pro`

---

## 🏛️ Arquitecturas Aprobadas

### 1. Lógica
- Supabase para autenticación y base de datos (configurado en `src/supabase.ts`).
- Uso de variables de entorno para llaves de servicio en scripts de importación.

### 2. Física
- (N/A en esta fase)

### 3. Visual
- Tematización con MUI y estilos personalizados en `src/theme.ts`.

### 4. Sonido
- (N/A en esta fase)
