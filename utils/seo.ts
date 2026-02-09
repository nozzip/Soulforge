import { Product, ViewState } from "../types";

interface SEOData {
  title: string;
  description: string;
  image?: string;
  url?: string;
}

export const updatePageMeta = ({ title, description, image, url }: SEOData) => {
  // Update title
  document.title = title;

  // Helper to update or create meta tag
  const updateMeta = (name: string, content: string, isProperty = false) => {
    const attr = isProperty ? "property" : "name";
    let meta = document.querySelector(`meta[${attr}="${name}"]`);
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute(attr, name);
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", content);
  };

  // Standard meta tags
  updateMeta("description", description);

  // Open Graph tags
  updateMeta("og:title", title, true);
  updateMeta("og:description", description, true);
  updateMeta("og:type", "website", true);
  if (image) updateMeta("og:image", image, true);
  if (url) updateMeta("og:url", url, true);

  // Twitter Card tags
  updateMeta("twitter:card", "summary_large_image");
  updateMeta("twitter:title", title);
  updateMeta("twitter:description", description);
  if (image) updateMeta("twitter:image", image);
};

export const getSEOForView = (
  view: ViewState,
  product?: Product | null,
): SEOData => {
  const baseUrl = window.location.origin;
  const baseName = "Soulforge";

  switch (view) {
    case ViewState.HOME:
      return {
        title: `${baseName} | Miniaturas de Resina para D&D, Warhammer y más`,
        description:
          "Impresiones de resina de alta calidad para tus juegos de rol y wargames. Encuentra dragones, héroes, monstruos y mucho más.",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCOt5aQZidteyosgKEH6adeFrjY70HvrEfGe899g00U3xAIYG56c8fgeqBKxO8l7H88pIM9fvKCjOFj31ZRGXSNJMm0amjBByouYk2tQS9cJlO5tRXVypnfYTl4GOedXMMTeHteiT4YEek0yhThUIU-I3adq46F_jGdWXWA81N4fXwHAGu-qCKql3q3IOj_6RX7xJ3VDGhUy-IG7TOmabJh_2bG_B3XyQLiG6dKr1cd6iFYDBbZoCfADZlGEJy_eQT0j1kbKsuRM9c",
        url: baseUrl,
      };

    case ViewState.CATALOG:
      return {
        title: `Catálogo de Miniaturas | ${baseName}`,
        description:
          "Explora nuestra colección completa de miniaturas de resina. D&D, Warhammer, Sci-Fi, Anime y más.",
        url: `${baseUrl}/catalog`,
      };

    case ViewState.PRODUCT_DETAIL:
      if (product) {
        return {
          title: `${product.name} - ${product.size} | ${baseName}`,
          description:
            product.description ||
            `Miniatura de ${product.name} en escala ${product.size}. Categoría: ${product.category}. Impresión de resina de alta calidad.`,
          image: product.image,
          url: `${baseUrl}/product/${product.id}`,
        };
      }
      return {
        title: `Producto | ${baseName}`,
        description: "Miniatura de resina de alta calidad.",
      };

    case ViewState.CART:
      return {
        title: `Tu Botín | ${baseName}`,
        description:
          "Revisa los artefactos en tu carrito antes de completar tu pedido.",
      };

    case ViewState.CHECKOUT:
      return {
        title: `Checkout | ${baseName}`,
        description: "Completa tu pedido de miniaturas de resina.",
      };

    case ViewState.WISHLIST:
      return {
        title: `Lista de Deseos | ${baseName}`,
        description: "Tus miniaturas favoritas guardadas para futuras compras.",
      };

    case ViewState.ORDERS:
      return {
        title: `Mis Pedidos | ${baseName}`,
        description: "Historial de tus pedidos y estado de envío.",
      };

    case ViewState.ADMIN:
      return {
        title: `Panel de Administración | ${baseName}`,
        description: "Gestiona productos y pedidos.",
      };

    default:
      return {
        title: baseName,
        description: "Miniaturas de resina de alta calidad.",
      };
  }
};
