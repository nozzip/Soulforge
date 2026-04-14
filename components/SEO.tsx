import React from "react";
import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  product?: any; // To allow detailed product schema
  category?: string;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description = "Miniaturas de resina de alta calidad para tus juegos de rol y wargames.",
  image,
  url,
  type = "website",
  product,
  category,
}) => {
  const structuredData: any = {
    "@context": "https://schema.org",
    "@type": type === "website" ? "OnlineStore" : "Product",
    "name": title,
    "description": description,
    "image": image,
    "url": url || window.location.href,
  };

  if (product && type !== "website") {
    structuredData.offers = {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "ARS",
      "availability": "https://schema.org/InStock",
      "url": url || window.location.href,
    };
    structuredData.brand = {
      "@type": "Brand",
      "name": "Soulforge",
    };
    if (product.designer) {
      structuredData.manufacturer = {
        "@type": "Organization",
        "name": product.designer,
      };
    }
  }

  // Breadcrumbs Schema
  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": window.location.origin,
      },
    ],
  };

  if (category) {
    breadcrumbList.itemListElement.push({
      "@type": "ListItem",
      "position": 2,
      "name": category,
      "item": `${window.location.origin}/catalog`,
    });
    if (product) {
      breadcrumbList.itemListElement.push({
        "@type": "ListItem",
        "position": 3,
        "name": product.name,
        "item": url || window.location.href,
      });
    }
  }

  return (
    <Helmet>
      {/* Basic */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      {image && <meta property="og:image" content={image} />}
      {url && <meta property="og:url" content={url} />}
      <link rel="canonical" href={url || window.location.href} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbList)}
      </script>
    </Helmet>
  );
};

export default SEO;
