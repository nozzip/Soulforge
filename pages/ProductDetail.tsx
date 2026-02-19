import React, { useState, useEffect, useMemo } from "react";
import { Container, Grid, Box, CircularProgress } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../src/supabase";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useProducts } from "../src/hooks/useProducts";
import { Product, ViewState } from "../types";
import { safeReadImageAsDataURL } from "../utils/imageValidation";
import DOMPurify from "isomorphic-dompurify";

// Child Components
import {
  ProductGallery,
  GalleryView,
} from "../src/components/product-detail/ProductGallery";
import { ProductInfo } from "../src/components/product-detail/ProductInfo";
import { ProductReviews } from "../src/components/product-detail/ProductReviews";
import { RelatedProducts } from "../src/components/product-detail/RelatedProducts";

// Shared Interfaces (Consider moving to types.ts)
interface Review {
  id: string;
  product_id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  text: string;
  image: string | null;
  created_at: string;
}

interface ProductDetailProps {
  productId: string | null;
  onAddToCart?: (product: Product) => void; // Optional if using context hook
  setView: (view: ViewState) => void;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  isAdmin: boolean;
  user: {
    name: string;
    id: string;
    avatar: string;
  } | null;
  // App.tsx passes onProductClick, need to add it?
  // Let's check if App.tsx passes it. Yes: onProductClick={handleProductClick}
  onProductClick?: (id: string) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({
  productId,
  setView,
  wishlist,
  toggleWishlist,
  isAdmin,
  user,
  onProductClick,
}) => {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const { data: products } = useProducts();

  // Local State
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [displayImageUrl, setDisplayImageUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [currentProductId, setCurrentProductId] = useState<string | null>(
    productId || null,
  );
  const [showZoom, setShowZoom] = useState(false);

  // Sync prop productId with local state if it changes from URL
  useEffect(() => {
    if (productId) setCurrentProductId(productId);
  }, [productId]);

  // --- Data Fetching ---

  // 1. Fetch Product
  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", currentProductId],
    queryFn: async () => {
      if (!currentProductId) return null;
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", currentProductId)
        .single();

      if (error) throw error;
      return data as Product;
    },
    enabled: !!currentProductId,
  });

  // 2. Fetch Reviews
  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ["reviews", currentProductId],
    queryFn: async () => {
      if (!currentProductId) return [];
      const { data, error } = await supabase
        .from("product_reviews")
        .select("*")
        .eq("product_id", currentProductId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Review[];
    },
    enabled: !!currentProductId,
  });

  // Derived State
  const activeProduct = useMemo(() => {
    // Logic to determine if we are showing a sub-item or the main product
    // The query fetches by ID, so `product` is the active one.
    // However, if the product is part of a set, we might want the "Header" or parent context.
    // The original logic was complex: it fetched the *clicked* product.
    // If that product had a `set_name`, it might be part of a group.
    // The `subItems` logic was usually handled by `useProducts` or a separate query.
    // Here we rely on `product` being the one requested.
    return product;
  }, [product]);

  // Fetch "Set" members if this product belongs to a set
  const { data: setMembers } = useQuery({
    queryKey: ["product-set", activeProduct?.set_name],
    queryFn: async () => {
      if (!activeProduct?.set_name || activeProduct.set_name === "Sin set")
        return [];
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("set_name", activeProduct.set_name)
        .neq("id", activeProduct.id); // Exclude current

      if (error) throw error;
      return data as Product[];
    },
    enabled: !!activeProduct?.set_name && activeProduct.set_name !== "Sin set",
  });

  // Combine active product with set members for "subItems" context
  const fullProductContext = useMemo(() => {
    if (!activeProduct) return null;
    return {
      ...activeProduct,
      subItems: setMembers || [],
    };
  }, [activeProduct, setMembers]);

  // Calculate Average Rating
  const averageRating = useMemo(() => {
    if (!reviewsData || reviewsData.length === 0) return 0;
    const total = reviewsData.reduce((acc, r) => acc + r.rating, 0);
    return total / reviewsData.length;
  }, [reviewsData]);

  // Initial Edit Form State
  useEffect(() => {
    if (activeProduct) {
      setEditForm(activeProduct);
      setDisplayImageUrl(activeProduct.image);
    }
  }, [activeProduct]);

  // Gallery Views Calculation
  const galleryViews = useMemo(() => {
    if (!activeProduct) return [];

    const currentMainImage =
      isEditing && editForm.image ? editForm.image : activeProduct.image;

    // Ensure gallery_images is array before mapping
    const formGallery = editForm.gallery_images || [];
    const currentGallery =
      isEditing && formGallery.length >= 0 && editForm.gallery_images
        ? editForm.gallery_images
        : activeProduct.gallery_images || [];

    const views: GalleryView[] = [
      { name: "Principal", url: currentMainImage || "", id: activeProduct.id },
    ];

    // Add additional gallery images
    if (Array.isArray(currentGallery) && currentGallery.length > 0) {
      currentGallery.forEach((imgUrl, index) => {
        views.push({
          name: `Vista ${index + 1}`,
          url: imgUrl,
          isGallery: true,
        });
      });
    }

    // Add sub-items images from the set context
    if (fullProductContext?.subItems) {
      fullProductContext.subItems.forEach((item) => {
        if (item.image && item.image !== currentMainImage) {
          views.push({ name: item.name, url: item.image, id: item.id });
        }
      });
    }

    // Filter duplicates by URL
    return views.filter(
      (v, i, self) => i === self.findIndex((t) => t.url === v.url),
    );
  }, [activeProduct, fullProductContext, isEditing, editForm]);

  // Related Products
  const relatedProducts = useMemo(() => {
    if (!activeProduct || !products) return [];
    return products
      .filter(
        (p) =>
          p.id !== activeProduct.id &&
          (p.category === activeProduct.category ||
            p.designer === activeProduct.designer),
      )
      .slice(0, 3);
  }, [activeProduct, products]);

  // --- Handlers ---

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel
      setEditForm(activeProduct || {});
      setDisplayImageUrl(activeProduct?.image || null);
    }
    setIsEditing(!isEditing);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateEditForm = (field: string, value: any) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSetDescription = (content: string) => {
    setEditForm((prev) => ({ ...prev, description: content }));
  };

  const handleSave = async () => {
    if (!activeProduct) return;
    setIsSaving(true);
    try {
      const updatedData = { ...editForm };
      delete updatedData.subItems; // Don't send auxiliary data

      // 1. Update current product
      const { data: productData, error: productError } = await supabase
        .from("products")
        .update(updatedData)
        .eq("id", activeProduct.id)
        .select()
        .single();

      if (productError) throw productError;

      // 2. If set_name changed, update others
      if (
        activeProduct.set_name &&
        activeProduct.set_name !== "Sin set" &&
        updatedData.set_name &&
        updatedData.set_name !== activeProduct.set_name
      ) {
        const { error: setError } = await supabase
          .from("products")
          .update({ set_name: updatedData.set_name })
          .eq("set_name", activeProduct.set_name);

        if (setError) throw setError;
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({
        queryKey: ["product", activeProduct.id],
      });
      if (activeProduct.set_name) {
        queryClient.invalidateQueries({
          queryKey: ["product-set", activeProduct.set_name],
        });
      }

      setIsEditing(false);
      showToast("Cambios guardados con éxito", "success");

      // Reload if set name changed to refresh view context
      if (updatedData.set_name !== activeProduct.set_name) {
        window.location.reload();
      }
    } catch (error) {
      showToast(
        "Error al guardar cambios: " + (error as Error).message,
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleProductImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    try {
      setIsSaving(true);
      await safeReadImageAsDataURL(file, 5); // validate
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("products").getPublicUrl(filePath);

      setEditForm((prev) => ({ ...prev, image: publicUrl }));
      setDisplayImageUrl(publicUrl);
    } catch (error) {
      showToast("Error subiendo imagen: " + (error as Error).message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGalleryImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    try {
      setIsSaving(true);
      await safeReadImageAsDataURL(file, 5);
      const fileExt = file.name.split(".").pop();
      const fileName = `gallery/${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("products").getPublicUrl(filePath);

      setEditForm((prev) => ({
        ...prev,
        gallery_images: [...(prev.gallery_images || []), publicUrl],
      }));
    } catch (error) {
      showToast(
        "Error subiendo imagen de galería: " + (error as Error).message,
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveGalleryImage = (urlToRemove: string) => {
    setEditForm((prev) => ({
      ...prev,
      gallery_images: (prev.gallery_images || []).filter(
        (url) => url !== urlToRemove,
      ),
    }));
  };

  const handleAddReview = async (reviewData: {
    text: string;
    rating: number;
    image: string | null;
  }) => {
    if (!user || !activeProduct) return;

    const { data, error } = await supabase
      .from("product_reviews")
      .insert({
        product_id: activeProduct.id,
        user_name: user.name,
        user_avatar: user.avatar,
        rating: reviewData.rating,
        text: reviewData.text,
        image: reviewData.image,
      })
      .select()
      .single();

    if (error) {
      showToast("Error al enviar reseña: " + error.message, "error");
      throw error;
    }

    showToast("¡Reseña enviada con éxito!", "success");
    // Invalidate reviews to refetch
    queryClient.invalidateQueries({ queryKey: ["reviews", activeProduct.id] });
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta crónica?")) return;
    const { error } = await supabase
      .from("product_reviews")
      .delete()
      .eq("id", reviewId);

    if (error) {
      showToast("Error al eliminar la crónica.", "error");
    } else {
      showToast("Crónica eliminada.", "success");
      queryClient.invalidateQueries({
        queryKey: ["reviews", activeProduct?.id],
      });
    }
  };

  // Gallery Navigation
  const selectView = (idx: number) => {
    setActiveImageIndex(idx);
    const view = galleryViews[idx];
    if (view) {
      setDisplayImageUrl(view.url);
      // Only if it's a different product ID (sub-item) and NOT gallery
      if (view.id && !view.isGallery && view.id !== activeProduct?.id) {
        setCurrentProductId(view.id);
        // When switching product, URL might also update?
        // Ideally we stay on same page URL but change content, or update URL.
        // Original kept URL same until maybe user navigated away?
        // Since we use currentProductId state, it works fine without URL change.
      }
    }
  };

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (galleryViews.length === 0) return;
    const nextIdx = (activeImageIndex + 1) % galleryViews.length;
    selectView(nextIdx);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (galleryViews.length === 0) return;
    const prevIdx =
      (activeImageIndex - 1 + galleryViews.length) % galleryViews.length;
    selectView(prevIdx);
  };

  if (isLoading || !activeProduct) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  if (error) return <Box>Error loading product</Box>;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 10 }}>
      {/* Product Highlight Card */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        {/* Left Column: Gallery */}
        <ProductGallery
          activeProduct={activeProduct}
          displayImageUrl={displayImageUrl}
          galleryViews={galleryViews}
          activeImageIndex={activeImageIndex}
          showZoom={showZoom}
          isEditing={isEditing}
          onNextImage={nextImage}
          onPrevImage={prevImage}
          onSelectView={selectView}
          onZoomStateChange={setShowZoom}
          onRemoveGalleryImage={handleRemoveGalleryImage}
        />

        {/* Right Column: Info & Details */}
        <ProductInfo
          activeProduct={activeProduct}
          product={fullProductContext} // Pass the group context
          isAdmin={isAdmin}
          isEditing={isEditing}
          editForm={editForm}
          isSaving={isSaving}
          wishlist={wishlist}
          reviews={reviewsData || []}
          averageRating={averageRating}
          onEditToggle={handleEditToggle}
          onSave={handleSave}
          onEditChange={handleEditChange}
          onUpdateEditForm={handleUpdateEditForm}
          onSetDescription={handleSetDescription}
          onMainImageUpload={handleProductImageUpload}
          onGalleryImageUpload={handleGalleryImageUpload}
          onRemoveGalleryImage={handleRemoveGalleryImage}
          onSetCurrentProductId={setCurrentProductId}
          onAddToCart={(p) => {
            addToCart(p);
            showToast("¡Producto añadido al carrito!", "success");
          }}
          onToggleWishlist={toggleWishlist}
        />
      </Grid>

      {/* Related Products */}
      <RelatedProducts
        relatedProducts={relatedProducts}
        onProductClick={(id) => {
          setCurrentProductId(id);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      {/* Reviews & Community */}
      <ProductReviews
        productId={activeProduct.id}
        user={user ? { ...user, id: user.id || "" } : null}
        reviews={reviewsData || []}
        reviewsLoading={reviewsLoading}
        isAdmin={isAdmin}
        onAddReview={handleAddReview}
        onDeleteReview={handleDeleteReview}
        setView={setView}
        showToast={showToast}
      />
    </Container>
  );
};

export default ProductDetail;
