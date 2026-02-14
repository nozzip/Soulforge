/// <reference lib="dom" />
import React, {
  useState,
  MouseEvent,
  useMemo,
  ChangeEvent,
  useEffect,
  useRef,
} from "react";
import { ViewState, Product, SubItem } from "../types";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/currency.tsx";
import { supabase } from "../src/supabase";
import { DEFAULT_AVATAR_URL } from "../constants";
import DOMPurify from "isomorphic-dompurify";
import { safeReadImageAsDataURL } from "../utils/imageValidation";
import { useProducts } from "@/src/hooks/useProducts";
import { useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  IconButton,
  Paper,
  Stack,
  Divider,
  TextField,
  Avatar,
  Chip,
  Rating,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  CardMedia,
  Skeleton,
  alpha,
  Dialog,
  DialogContent,
  Tooltip,
  Snackbar,
  Alert,
  Autocomplete,
} from "@mui/material";
import {
  ArrowBack,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ShoppingBag,
  Favorite,
  FavoriteBorder,
  Build,
  LocalShipping,
  Star,
  AddAPhoto,
  Close,
  AccountTree,
  Group,
  Grid4x4,
  Opacity,
  VpnKey,
  Category,
  Person,
  BugReport,
  Gavel,
  Straighten,
  ShoppingCart,
  AddShoppingCart,
  Collections,
  Delete,
  Brush,
} from "@mui/icons-material";

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
  setView: (view: ViewState) => void;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  isAdmin?: boolean;
  user?: { name: string; id: string; avatar?: string } | null;
  onProductClick?: (id: string) => void;
}

// Helper to format dates
const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `hace ${diffDays} días`;
  if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)} semanas`;
  return `hace ${Math.floor(diffDays / 30)} meses`;
};

// Helper for the tactical grid - using pure CSS/Box for grid
const BattlemapFootprint = ({ size }: { size: string }) => {
  const footprintSize = useMemo(() => {
    const s = size.toLowerCase();
    if (
      s.includes("mediano") ||
      s.includes("pequeño") ||
      s.includes("medium") ||
      s.includes("small")
    )
      return 1;
    if (s.includes("grande") || s.includes("large")) return 2;
    if (s.includes("enorme") || s.includes("huge")) return 3;
    if (s.includes("gargantuesco") || s.includes("gargantuan")) return 4;
    if (s.includes("colosal") || s.includes("colossal")) return 5;
    return 1;
  }, [size]);

  const totalSquares = footprintSize * footprintSize;

  return (
    <Box
      sx={{
        mb: 5,
        p: 3,
        bgcolor: "rgba(0,0,0,0.4)",
        border: 1,
        borderColor: "rgba(197, 160, 89, 0.2)",
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        gap: 3,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Visual Grid */}
      <Box
        sx={{
          position: "relative",
          width: 128,
          height: 128,
          bgcolor: "background.paper",
          border: 1,
          borderColor: "rgba(197, 160, 89, 0.1)",
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gridTemplateRows: "repeat(5, 1fr)",
          flexShrink: 0,
        }}
      >
        {[...Array(25)].map((_, i) => {
          const row = Math.floor(i / 5);
          const col = i % 5;
          // Center the footprint
          const offset = Math.floor((5 - footprintSize) / 2);
          const isActive =
            row >= offset &&
            row < offset + footprintSize &&
            col >= offset &&
            col < offset + footprintSize;

          return (
            <Box
              key={i}
              sx={{
                border: "0.5px solid rgba(197, 160, 89, 0.05)",
                transition: "background-color 0.7s",
                bgcolor: isActive
                  ? "rgba(var(--color-primary), 0.5)"
                  : "transparent", // Simulate primary/50
                boxShadow: isActive
                  ? "inset 0 0 10px var(--color-primary)"
                  : "none",
              }}
            />
          );
        })}
        {/* Footprint Indicator */}
        <Box
          sx={{
            position: "absolute",
            border: 2,
            borderColor: "primary.main",
            boxShadow: "0 0 15px var(--color-primary)",
            borderRadius: "2px",
            pointerEvents: "none",
            transition: "all 0.5s",
            width: `${(footprintSize / 5) * 100}%`,
            height: `${(footprintSize / 5) * 100}%`,
            top: `${(Math.floor((5 - footprintSize) / 2) / 5) * 100}%`,
            left: `${(Math.floor((5 - footprintSize) / 2) / 5) * 100}%`,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              bgcolor: "primary.main",
              opacity: 0.2,
              animation: "pulse 2s infinite",
            }}
          />
        </Box>
      </Box>

      {/* Info */}
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="overline"
          sx={{
            color: "grey.500",
            fontWeight: "bold",
            letterSpacing: 2,
            mb: 0.5,
          }}
        >
          Huella Táctica
        </Typography>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 1 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 900, color: "common.white" }}
          >
            {totalSquares}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "secondary.main",
              opacity: 0.6,
              fontWeight: "bold",
              letterSpacing: 1,
            }}
          >
            CUADRADOS OCUPADOS
          </Typography>
        </Box>
        <Stack spacing={0.5}>
          <Typography
            variant="caption"
            sx={{ color: "grey.400", fontStyle: "italic" }}
          >
            Este artefacto de escala {size} ocupa una presencia de{" "}
            <Box
              component="span"
              sx={{ color: "secondary.main", fontWeight: "bold" }}
            >
              {footprintSize}x{footprintSize}
            </Box>{" "}
            en una cuadrícula táctica estándar de 1".
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: "primary.main",
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.6rem",
                textTransform: "uppercase",
                letterSpacing: 1,
                color: "primary.main",
                fontWeight: "bold",
              }}
            >
              Precisión de Escala Confirmada
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Texture Background */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          p: 2,
          opacity: 0.05,
          pointerEvents: "none",
        }}
      >
        <Grid4x4 sx={{ fontSize: 60 }} />
      </Box>
    </Box>
  );
};

// Skeleton Component
const ProductDetailSkeleton = () => (
  <Container maxWidth="lg" sx={{ py: 6 }}>
    <Box sx={{ display: "flex", gap: 1, mb: 4 }}>
      <Skeleton variant="rectangular" width={80} height={20} />
      <Skeleton variant="rectangular" width={20} height={20} />
      <Skeleton variant="rectangular" width={120} height={20} />
    </Box>
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, lg: 6 }}>
        <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 2 }} />
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              width={80}
              height={80}
              sx={{ borderRadius: 1 }}
            />
          ))}
        </Box>
      </Grid>
      <Grid size={{ xs: 12, lg: 6 }}>
        <Skeleton variant="text" height={40} width="60%" />
        <Skeleton variant="text" height={60} width="80%" />
        <Skeleton variant="rectangular" height={100} sx={{ my: 4 }} />
        <Skeleton variant="rectangular" height={50} width={200} />
      </Grid>
    </Grid>
  </Container>
);

const ProductDetail: React.FC<ProductDetailProps> = ({
  productId,
  setView,
  wishlist,
  toggleWishlist,
  isAdmin = false,
  user = null,
  onProductClick,
}) => {
  const { data: products } = useProducts();
  const queryClient = useQueryClient();
  const { addToCart } = useCart();
  const [currentProductId, setCurrentProductId] = useState(productId);

  useEffect(() => {
    setCurrentProductId(productId);
  }, [productId]);

  // The Set/Base context
  const initialProduct = products.find((p) => p.id === productId);
  const product = useMemo(() => {
    if (!initialProduct) return initialProduct;

    // Debug: log set_name info
    console.log("[ProductDetail] Initial product:", {
      id: initialProduct.id,
      name: initialProduct.name,
      set_name: initialProduct.set_name,
    });

    if (initialProduct.set_name && initialProduct.set_name !== "Sin set") {
      const setProducts = products.filter(
        (p) => p.set_name === initialProduct.set_name,
      );
      console.log(
        "[ProductDetail] Products in same set:",
        setProducts.map((p) => ({
          id: p.id,
          name: p.name,
          set_name: p.set_name,
        })),
      );

      // Sort by priority: 1) "header" in name, 2) name matches set_name, 3) by ID
      const sorted = [...setProducts].sort((a, b) => {
        const aHasHeader = a.name.toLowerCase().includes("header");
        const bHasHeader = b.name.toLowerCase().includes("header");
        if (aHasHeader && !bHasHeader) return -1;
        if (!aHasHeader && bHasHeader) return 1;

        const setName = initialProduct.set_name!.toLowerCase();
        const aClean = a.name
          .replace(/\s*Header\s*/gi, "")
          .trim()
          .toLowerCase();
        const bClean = b.name
          .replace(/\s*Header\s*/gi, "")
          .trim()
          .toLowerCase();
        if (aClean === setName && bClean !== setName) return -1;
        if (aClean !== setName && bClean === setName) return 1;

        return a.id.localeCompare(b.id);
      });

      const [header, ...others] = sorted;
      console.log(
        "[ProductDetail] Header:",
        header?.name,
        "SubItems:",
        others.length,
      );

      return {
        ...header,
        subItems: others.map((item) => ({
          id: item.id,
          name: item.name,
          image: item.image,
          description: item.description,
        })),
      };
    }
    return initialProduct;
  }, [initialProduct, products]);

  // The actual item being viewed
  const activeProduct = useMemo(
    () => products.find((p) => p.id === currentProductId) || product,
    [currentProductId, products, product],
  );

  const isWishlisted = activeProduct
    ? wishlist.includes(activeProduct.id)
    : false;

  // Loading State
  const [isLoading, setIsLoading] = useState(true);

  // State for image gallery navigation
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [displayImageUrl, setDisplayImageUrl] = useState<string | null>(null);

  // State for zoom effect
  const [zoomProps, setZoomProps] = useState({ x: 0, y: 0, show: false });

  // Ref for main image focus
  const mainImageRef = useRef<HTMLDivElement>(null);

  // Admin Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [isSaving, setIsSaving] = useState(false);

  // State for Reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [newReview, setNewReview] = useState({
    user: "",
    text: "",
    rating: 5,
    image: null as string | null,
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Gallery lightbox state
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<
    string | null
  >(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const [selectedResin, setSelectedResin] = useState("Gris Forja");
  const resinOptions = [
    { name: "Gris Forja", available: true, color: "#5D6D7E" },
    { name: "Transparente Espectral", available: false, color: "#AED6F1" },
    { name: "Oro de los Enanos", available: false, color: "#F4D03F" },
  ];

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Fetch reviews from Supabase
  useEffect(() => {
    const fetchReviews = async () => {
      if (!productId) return;
      setReviewsLoading(true);
      const { data, error } = await supabase
        .from("product_reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching reviews:", error);
      } else {
        setReviews(data || []);
      }
      setReviewsLoading(false);
    };

    fetchReviews();
  }, [productId]);

  // Community Gallery Images (derived from reviews with images)
  const communityImages = useMemo(() => {
    return reviews
      .filter((r) => r.image)
      .map((r) => ({
        url: r.image!,
        user: r.user_name,
        reviewId: r.id,
      }));
  }, [reviews]);

  // Sync main image when active product changes
  useEffect(() => {
    if (activeProduct) {
      setDisplayImageUrl(activeProduct.image);
    }
  }, [activeProduct]);

  // Simulate loading delay
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
      // After loading, scroll to main image
      setTimeout(() => {
        mainImageRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }, 800); // 800ms simulated delay

    return () => clearTimeout(timer);
  }, [productId]);

  // Calculate dynamic rating
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((acc, r) => acc + r.rating, 0);
    return total / reviews.length;
  }, [reviews]);

  // Derived Related Products
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 3);
  }, [product, products]);

  // Structured gallery data with names for the chips
  const galleryItems = useMemo(() => {
    if (!product) return [];
    return [
      { url: product.image, label: "Forja 12k" },
      ...communityImages.map((img) => ({
        url: img.url,
        label: `Gesta de ${img.user}`,
      })),
    ];
  }, [product, communityImages]);

  const handleEditToggle = () => {
    if (!isEditing && product) {
      setEditForm({ ...product });
    }
    setIsEditing(!isEditing);
  };

  const handleEditChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!product) return;
    setIsSaving(true);

    // Convert price to number if it's a string
    // AND remove runtime-only properties like 'subItems' that are not in the database
    const { subItems, ...cleanForm } = editForm;

    // Also ensure 'gallery_images' is not null if it was undefined
    if (cleanForm.gallery_images === undefined) {
      delete cleanForm.gallery_images; // Don't send it if we didn't touch it
    }

    const updatedData = {
      ...cleanForm,
      price:
        typeof editForm.price === "string"
          ? parseFloat(editForm.price)
          : editForm.price,
    };

    try {
      // 1. Update the individual product
      const { data: productData, error: productError } = await supabase
        .from("products")
        .update(updatedData)
        .eq("id", product.id)
        .select()
        .single();

      if (productError) throw productError;

      // 2. If set_name changed, update ALL other products in the old set to the new name
      // Logic: If we are viewing a set, and we change the set_name, we want the whole group to move.
      if (
        product.set_name &&
        product.set_name !== "Sin set" &&
        updatedData.set_name &&
        updatedData.set_name !== product.set_name
      ) {
        const { error: setError } = await supabase
          .from("products")
          .update({ set_name: updatedData.set_name })
          .eq("set_name", product.set_name); // Update all with old set name

        if (setError) throw setError;
      }

      if (productData) {
        // Need to refresh context or callback
        queryClient.invalidateQueries({ queryKey: ["products"] });
        setIsEditing(false);
        // Force reload would be better here but let's rely on parent update
        // If set name changed, we might need a bigger refresh
        if (updatedData.set_name !== product.set_name) {
          window.location.reload(); // Simple way to refresh the unified view
        }
      }
    } catch (error) {
      alert("Error al guardar cambios: " + (error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };
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

    const views: {
      name: string;
      url: string;
      id?: string;
      isGallery?: boolean;
    }[] = [
        { name: "Principal", url: currentMainImage || "", id: activeProduct.id },
      ];

    // Add additional gallery images
    if (currentGallery.length > 0) {
      currentGallery.forEach((imgUrl, index) => {
        views.push({
          name: `Vista ${index + 1}`,
          url: imgUrl,
          isGallery: true,
        });
      });
    }

    // Add sub-items images from the set context (product)
    if (product?.subItems) {
      product.subItems.forEach((item) => {
        if (item.image && item.image !== currentMainImage) {
          views.push({ name: item.name, url: item.image, id: item.id });
        }
      });
    }
    // If we're viewing a set member, we should also include the header image if it's different.
    // Use optional chaining carefully.
    if (
      product &&
      product.id !== activeProduct.id &&
      product.image !== currentMainImage
    ) {
      // Avoid duplicate if activeProduct is just a member
      views.push({ name: product.name, url: product.image, id: product.id });
    }

    // Filter duplicates by URL just in case
    return views.filter(
      (v, i, self) => i === self.findIndex((t) => t.url === v.url),
    );
  }, [activeProduct, product, isEditing, editForm]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    // Check if cursor is in navigation gutters (15% each side)
    const isInGutter = galleryViews.length > 1 && (x < 15 || x > 85);

    setZoomProps({ x, y, show: !isInGutter });
  };

  const handleMouseLeave = () => {
    setZoomProps({ ...zoomProps, show: false });
  };

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const nextIdx = (activeImageIndex + 1) % galleryViews.length;
    setActiveImageIndex(nextIdx);
    const view = galleryViews[nextIdx];
    setDisplayImageUrl(view.url);
    if (view.id) setCurrentProductId(view.id);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const prevIdx =
      (activeImageIndex - 1 + galleryViews.length) % galleryViews.length;
    setActiveImageIndex(prevIdx);
    const view = galleryViews[prevIdx];
    setDisplayImageUrl(view.url);
    if (view.id) setCurrentProductId(view.id);
  };

  const selectView = (idx: number) => {
    setActiveImageIndex(idx);
    const view = galleryViews[idx];
    setDisplayImageUrl(view.url);
    if (view.id) setCurrentProductId(view.id);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (galleryViews.length <= 1) return;

      if (e.key === "ArrowLeft") {
        prevImage();
      } else if (e.key === "ArrowRight") {
        nextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [galleryViews, nextImage, prevImage]);

  // Review Handlers
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      try {
        const imageData = await safeReadImageAsDataURL(file, 5); // 5MB max
        setNewReview((prev) => ({ ...prev, image: imageData }));
      } catch (error) {
        alert(
          error instanceof Error ? error.message : "Error al cargar la imagen",
        );
        // Reset file input
        e.target.value = "";
      }
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !newReview.text || !productId) return;
    setSubmittingReview(true);

    // Sanitize review text to prevent XSS
    const sanitizedText = DOMPurify.sanitize(newReview.text, {
      ALLOWED_TAGS: [], // No HTML tags allowed
      ALLOWED_ATTR: [],
    });

    // Validate text length
    if (sanitizedText.length < 10) {
      alert("La crónica debe tener al menos 10 caracteres.");
      setSubmittingReview(false);
      return;
    }

    if (sanitizedText.length > 1000) {
      alert("La crónica no puede exceder 1000 caracteres.");
      setSubmittingReview(false);
      return;
    }

    const reviewData = {
      product_id: productId,
      user_name: user.name,
      user_avatar: user.avatar,
      rating: newReview.rating,
      text: sanitizedText,
      image: newReview.image,
    };

    const { data, error } = await supabase
      .from("product_reviews")
      .insert(reviewData)
      .select()
      .single();

    if (error) {
      console.error("Error submitting review:", error);
      alert("Error al publicar la crónica. Intenta de nuevo.");
    } else if (data) {
      setReviews([data, ...reviews]);
      setNewReview({ user: "", text: "", rating: 5, image: null });
    }
    setSubmittingReview(false);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta crónica?")) return;

    const { error } = await supabase
      .from("product_reviews")
      .delete()
      .eq("id", reviewId);

    if (error) {
      console.error("Error deleting review:", error);
      alert("Error al eliminar la crónica.");
    } else {
      setReviews(reviews.filter((r) => r.id !== reviewId));
    }
  };

  // Admin Product Image Upload
  const handleProductImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    try {
      setIsSaving(true);
      // Validate image locally first
      await safeReadImageAsDataURL(file, 5); // 5MB limit

      const fileExt = file.name.split(".").pop();
      const fileName = `${activeProduct.id}-${Date.now()}.${fileExt}`; // Use activeProduct.id
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type, // Explicitly set content type
        });

      if (uploadError) throw uploadError;

      // Get Public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("products").getPublicUrl(filePath);

      // Update Edit Form state
      setEditForm((prev) => ({ ...prev, image: publicUrl }));
      alert("Imagen subida correctamente. Recuerda guardar los cambios.");
    } catch (error) {
      console.error("Error uploading image:", error);
      alert(
        "Error uploading image: " +
        (error instanceof Error ? error.message : "Unknown error"),
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Gallery Image Upload (Append)
  const handleGalleryImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    try {
      setIsSaving(true);
      await safeReadImageAsDataURL(file, 5);

      const fileExt = file.name.split(".").pop();
      const fileName = `gallery-${activeProduct.id}-${Date.now()}.${fileExt}`;
      const filePath = `gallery/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("products").getPublicUrl(filePath);

      setEditForm((prev) => ({
        ...prev,
        gallery_images: [...(prev.gallery_images || []), publicUrl],
      }));
    } catch (error) {
      console.error("Error uploading gallery image:", error);
      alert("Error: " + (error instanceof Error ? error.message : "Unknown"));
    } finally {
      setIsSaving(false);
    }
  };

  // Remove gallery image
  const handleRemoveGalleryImage = (urlToRemove: string) => {
    setEditForm((prev) => ({
      ...prev,
      gallery_images: (prev.gallery_images || []).filter(
        (url) => url !== urlToRemove,
      ),
    }));
  };

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <Box
        sx={{
          minHeight: "50vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          px: 3,
        }}
      >
        <Typography
          variant="h4"
          color="secondary.main"
          fontWeight="bold"
          gutterBottom
        >
          Artefacto Perdido
        </Typography>
        <Typography color="text.secondary" paragraph>
          El orbe de adivinación no puede localizar este objeto en los archivos.
        </Typography>
        <Button
          onClick={() => setView(ViewState.CATALOG)}
          color="primary"
          sx={{ textDecoration: "underline" }}
        >
          Volver a los Archivos
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 10, px: { xs: 3, sm: 6 } }}>
      {/* Back Button and Breadcrumbs */}
      <Box sx={{ mb: 6, display: "flex", flexDirection: "column", gap: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => setView(ViewState.CATALOG)}
          sx={{
            alignSelf: "flex-start",
            color: "secondary.main",
            textTransform: "uppercase",
            letterSpacing: 2,
            fontWeight: "bold",
            "&:hover": {
              color: "primary.main",
              bgcolor: "transparent",
              transform: "translateX(-4px)",
            },
            transition: "all 0.3s",
          }}
        >
          Volver al Catálogo
        </Button>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: "text.secondary",
            fontSize: "0.85rem",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          <Typography
            sx={{ cursor: "pointer", "&:hover": { color: "primary.main" } }}
            onClick={() => setView(ViewState.CATALOG)}
          >
            Catálogo
          </Typography>
          <Typography color="text.secondary">/</Typography>
          <Typography color="text.secondary">
            {activeProduct.category}
          </Typography>
          <Typography color="text.secondary">/</Typography>
          <Typography color="secondary.main" fontWeight="bold" noWrap>
            {activeProduct.name.replace(/\s*Header\s*/gi, "").trim()}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={6}>
        {/* Left Column: Image Gallery */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {/* Main Image Container */}
            <Paper
              elevation={6}
              ref={mainImageRef}
              sx={{
                position: "relative",
                aspectRatio: "1/1",
                bgcolor: "black",
                borderRadius: 2,
                overflow: "hidden",
                cursor: "crosshair",
                border: 1,
                borderColor: "secondary.main",
              }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {/* Zoom Layer */}
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url("${displayImageUrl}")`,
                  backgroundPosition: zoomProps.show
                    ? `${zoomProps.x}% ${zoomProps.y}%`
                    : "center",
                  backgroundSize: zoomProps.show ? "200%" : "contain",
                  backgroundRepeat: "no-repeat",
                  transition: "transform 0.1s ease-out",
                }}
              />

              {/* Navigation Gutters & Arrows */}
              {galleryViews.length > 1 && (
                <>
                  {/* Left Gutter */}
                  <Box
                    onClick={prevImage}
                    sx={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: "15%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      zIndex: 2,
                      userSelect: "none",
                      "&:hover .nav-arrow": {
                        opacity: 1,
                        color: "primary.main",
                      },
                    }}
                  >
                    <IconButton
                      className="nav-arrow"
                      disableRipple
                      sx={{
                        bgcolor: "rgba(0,0,0,0.6)",
                        color: "white",
                        opacity: 0.7,
                        transition: "none",
                        pointerEvents: "none", // Allow click to pass to gutter
                      }}
                    >
                      <ChevronLeft />
                    </IconButton>
                  </Box>

                  {/* Right Gutter */}
                  <Box
                    onClick={nextImage}
                    sx={{
                      position: "absolute",
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: "15%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      zIndex: 2,
                      userSelect: "none",
                      "&:hover .nav-arrow": {
                        opacity: 1,
                        color: "primary.main",
                      },
                    }}
                  >
                    <IconButton
                      className="nav-arrow"
                      disableRipple
                      sx={{
                        bgcolor: "rgba(0,0,0,0.6)",
                        color: "white",
                        opacity: 0.7,
                        transition: "none",
                        pointerEvents: "none", // Allow click to pass to gutter
                      }}
                    >
                      <ChevronRight />
                    </IconButton>
                  </Box>
                </>
              )}

              {/* Badges and Hints */}

              {!zoomProps.show && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 16,
                    left: "50%",
                    transform: "translateX(-50%)",
                    bgcolor: "rgba(0,0,0,0.6)",
                    borderRadius: 4,
                    px: 2,
                    py: 0.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    backdropFilter: "blur(4px)",
                    border: 1,
                    borderColor: "rgba(255,255,255,0.1)",
                    userSelect: "none",
                    pointerEvents: "none",
                    zIndex: 3,
                  }}
                >
                  <ZoomIn sx={{ fontSize: 16, color: "white" }} />
                  <Typography
                    variant="caption"
                    sx={{
                      color: "white",
                      letterSpacing: 1,
                      textTransform: "uppercase",
                    }}
                  >
                    Mira de cerca para Inspeccionar
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* Thumbnails */}
            <Box sx={{ display: "flex", gap: 2, overflowX: "auto", pb: 1 }}>
              {galleryViews.map((view, i) => (
                <Box
                  key={i}
                  onClick={() => selectView(i)}
                  sx={{
                    width: 80,
                    height: 80,
                    flexShrink: 0,
                    borderRadius: 1,
                    border: 1,
                    borderColor:
                      i === activeImageIndex ? "secondary.main" : "transparent",
                    opacity: i === activeImageIndex ? 1 : 0.5,
                    cursor: "pointer",
                    overflow: "hidden",
                    position: "relative",
                    transition: "all 0.2s",
                    "&:hover": { opacity: 1, borderColor: "secondary.main" },
                  }}
                >
                  <Box
                    component="img"
                    src={view.url}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      bgcolor: "black",
                    }}
                  />
                  {isEditing && view.isGallery && (
                    <Box
                      onClick={(e) => {
                        e.stopPropagation();
                        // Assuming handleRemoveGalleryImage only needs the URL
                        handleRemoveGalleryImage(view.url);
                      }}
                      sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        bgcolor: "error.main", // Solid red
                        color: "white",
                        width: 24,
                        height: 24,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "0 0 0 4px",
                        zIndex: 10, // Ensure on top
                        boxShadow: 2,
                        "&:hover": {
                          bgcolor: "error.dark",
                          transform: "scale(1.1)",
                        },
                      }}
                    >
                      <Close sx={{ fontSize: 16, fontWeight: "bold" }} />
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        </Grid>

        {/* Right Column: Details */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Box sx={{ mb: 1, display: "flex", gap: 2, alignItems: "center" }}>
            <Chip
              label={`Escala ${activeProduct.size || "M"}`}
              variant="outlined"
              color="primary"
              size="small"
              sx={{ fontWeight: "bold" }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ letterSpacing: 1 }}
            >
              REF: {activeProduct.category.toUpperCase()}-
              {activeProduct.id.padStart(3, "0")}
            </Typography>
          </Box>

          {isAdmin && (
            <Paper
              sx={{
                mb: 3,
                p: 2,
                bgcolor: (t) => alpha(t.palette.secondary.main, 0.05),
                border: 1,
                borderStyle: "dashed",
                borderColor: "secondary.main",
                borderRadius: 2,
              }}
            >
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "secondary.main",
                    fontWeight: "bold",
                    letterSpacing: 1,
                  }}
                >
                  CONTROLES DEL ALTO SUPERVISOR
                </Typography>
                <Stack direction="row" spacing={1}>
                  {!isEditing ? (
                    <Button
                      size="small"
                      variant="outlined"
                      color="secondary"
                      startIcon={<Brush />}
                      onClick={handleEditToggle}
                    >
                      Editar Pergamino
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        disabled={isSaving}
                      >
                        {isSaving ? "Guardando..." : "Guardar Cambios"}
                      </Button>
                      <Button
                        size="small"
                        variant="text"
                        color="inherit"
                        onClick={handleEditToggle}
                        disabled={isSaving}
                      >
                        Cancelar
                      </Button>
                    </>
                  )}
                </Stack>
              </Stack>
            </Paper>
          )}

          {isEditing ? (
            <Stack spacing={2} sx={{ mb: 2 }}>
              {/* Image Upload Input */}
              <Box
                sx={{
                  p: 2,
                  border: "1px dashed grey",
                  borderRadius: 1,
                  textAlign: "center",
                }}
              >
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="product-image-upload"
                  type="file"
                  onChange={handleProductImageUpload}
                  disabled={isSaving}
                />
                <label htmlFor="product-image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<AddAPhoto />}
                    disabled={isSaving}
                  >
                    Cambiar Imagen del Artefacto
                  </Button>
                </label>
                {editForm.image && (
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ mt: 1, color: "success.main" }}
                  >
                    Nueva imagen cargada y lista para guardar.
                  </Typography>
                )}
              </Box>

              <TextField
                fullWidth
                name="name"
                label="Nombre del Artefacto (Individual)"
                value={editForm.name}
                onChange={handleEditChange}
              />
              {activeProduct.set_name &&
                activeProduct.set_name !== "Sin set" && (
                  <TextField
                    fullWidth
                    name="set_name"
                    label="Nombre del Set (Grupo)"
                    value={editForm.set_name || ""}
                    onChange={handleEditChange}
                    helperText="Cambiar esto actualizará el nombre del grupo para todos los miembros."
                  />
                )}
            </Stack>
          ) : (
            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                fontStyle: "italic",
                mb: 2,
                color: "common.white",
                minHeight: "6rem",
                display: "flex",
                alignItems: "flex-start",
                lineHeight: 1.2,
              }}
            >
              {/* If part of a set, show Set Name. If not, show Product Name */}
              {activeProduct.set_name && activeProduct.set_name !== "Sin set"
                ? activeProduct.set_name
                : activeProduct.name.replace(/\s*Header\s*/gi, "").trim()}
            </Typography>
          )}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              mb: 4,
              pb: 4,
              borderBottom: 1,
              borderColor: "rgba(197, 160, 89, 0.1)",
            }}
          >
            {isEditing ? (
              <TextField
                name="price"
                type="number"
                label="Precio (GP)"
                value={editForm.price}
                onChange={handleEditChange}
                size="small"
                sx={{ width: 120 }}
              />
            ) : (
              <Typography
                variant="h4"
                sx={{ fontWeight: "bold", color: "secondary.main" }}
              >
                {formatCurrency(activeProduct.price)}
              </Typography>
            )}
            <Divider
              orientation="vertical"
              flexItem
              sx={{ bgcolor: "grey.800" }}
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Rating
                value={averageRating}
                readOnly
                precision={0.5}
                emptyIcon={
                  <Star
                    style={{ opacity: 0.3, color: "grey" }}
                    fontSize="inherit"
                  />
                }
              />
              <Typography variant="caption" color="text.secondary">
                ({reviews.length} Reviews)
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 5 }}>
            <Typography
              variant="overline"
              color="secondary.main"
              fontWeight="bold"
              letterSpacing={2}
              display="block"
              gutterBottom
            >
              Lore y Descripción
            </Typography>
            {isEditing ? (
              <TextField
                fullWidth
                multiline
                rows={4}
                name="description"
                label="Lore del Artefacto"
                value={editForm.description}
                onChange={handleEditChange}
              />
            ) : (
              <Box
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.background.paper, 0.3),
                  p: 3,
                  borderRadius: 2,
                  border: 1,
                  borderColor: (theme) =>
                    alpha(theme.palette.secondary.main, 0.1),
                }}
              >
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    opacity: 0.9,
                    minHeight: "100px",
                    display: "block",
                    textAlign: "justify",
                    lineHeight: 2, // More relaxed line height
                    whiteSpace: "pre-line", // Respect key formatting
                    fontFamily: '"Merriweather", serif', // More readable serif for lore
                  }}
                >
                  {activeProduct.description ||
                    "Un raro artefacto recuperado de las mazmorras más profundas. Los detalles de su origen están envueltos en misterio, pero su artesanía es innegable."}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Gallery Images Management (Admin) */}
          {isEditing && (
            <Box
              sx={{ mb: 4, p: 2, border: "1px dashed grey", borderRadius: 1 }}
            >
              <Typography variant="subtitle2" color="secondary" gutterBottom>
                Galería de Vistas Adicionales
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
                {editForm.gallery_images?.map((url, index) => (
                  <Box
                    key={index}
                    sx={{ position: "relative", width: 80, height: 80 }}
                  >
                    <img
                      src={url}
                      alt={`Gallery ${index}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: 4,
                      }}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: "absolute",
                        top: -10,
                        right: -10,
                        bgcolor: "error.main",
                        color: "white",
                        "&:hover": { bgcolor: "error.dark" },
                      }}
                      onClick={() => handleRemoveGalleryImage(url)}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>

              <input
                accept="image/*"
                style={{ display: "none" }}
                id="gallery-image-upload"
                type="file"
                onChange={handleGalleryImageUpload}
                disabled={isSaving}
              />
              <label htmlFor="gallery-image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<Collections />}
                  size="small"
                  disabled={isSaving}
                >
                  Agregar Vista Adicional
                </Button>
              </label>
            </Box>
          )}

          {/* Unit Composition as Chips */}
          {product?.subItems && product.subItems.length > 0 && (
            <Box sx={{ mb: 4, display: "flex", flexWrap: "wrap", gap: 1.5 }}>
              {/* Header Chip (Principal) */}
              <Chip
                label={product.name.replace(/\s*Header\s*/gi, "").trim()}
                onClick={() => setCurrentProductId(product.id)}
                variant={
                  activeProduct.id === product.id ? "filled" : "outlined"
                }
                color="secondary"
                sx={{
                  fontFamily: "Cinzel",
                  fontWeight: "bold",
                  boxShadow:
                    activeProduct.id === product.id
                      ? (theme) =>
                        `0 0 15px ${alpha(theme.palette.secondary.main, 0.3)}`
                      : "none",
                }}
              />
              {/* Other Set Members */}
              {product.subItems.map((item) => (
                <Chip
                  key={item.id}
                  label={item.name}
                  onClick={() => setCurrentProductId(item.id)}
                  variant={activeProduct.id === item.id ? "filled" : "outlined"}
                  color="secondary"
                  sx={{
                    fontFamily: "Cinzel",
                    fontWeight: 600,
                    boxShadow:
                      activeProduct.id === item.id
                        ? (theme) =>
                          `0 0 15px ${alpha(theme.palette.secondary.main, 0.3)}`
                        : "none",
                  }}
                />
              ))}
            </Box>
          )}

          <BattlemapFootprint size={activeProduct.size || "Medium"} />
          {isEditing && (
            <Box sx={{ mt: 3, mb: 3 }}>
              <TextField
                fullWidth
                name="designer"
                label="Gran Maestro (Diseñador)"
                value={editForm.designer}
                onChange={handleEditChange}
                size="small"
              />
            </Box>
          )}

          {/* Specs */}
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              bgcolor: "transparent",
              borderColor: "rgba(197, 160, 89, 0.1)",
            }}
          >
            <Typography
              variant="overline"
              color="common.white"
              fontWeight="bold"
              letterSpacing={2}
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Build fontSize="small" color="secondary" /> Especificaciones
              Técnicas
            </Typography>
            <Grid container spacing={2}>
              {[
                {
                  label: "Identificador",
                  value: `#${activeProduct.id.slice(0, 8)}`,
                  icon: <VpnKey fontSize="small" />,
                  editableField: null,
                },
                {
                  label: "Categoría",
                  value: activeProduct.category,
                  icon: <Category fontSize="small" />,
                  editableField: "category",
                },
                {
                  label: "Gran Maestro",
                  value: activeProduct.designer,
                  icon: <Person fontSize="small" />,
                  editableField: "designer",
                },
                {
                  label: "Especie",
                  value: activeProduct.creature_type,
                  icon: <BugReport fontSize="small" />,
                  editableField: "creature_type",
                },
                {
                  label: "Arsenales",
                  value: activeProduct.weapon,
                  icon: <Gavel fontSize="small" />,
                  editableField: "weapon",
                },
                {
                  label: "Escala Comandante",
                  value: activeProduct.size,
                  icon: <Straighten fontSize="small" />,
                  editableField: "size",
                },
              ].map((spec, i) => {
                const isEditable = isEditing && spec.editableField;

                // Get unique options for this field if it's editable
                const options = isEditable
                  ? Array.from(
                    new Set(
                      products
                        .map(
                          (p) =>
                            p[spec.editableField as keyof Product] as string,
                        )
                        .filter(Boolean),
                    ),
                  ).sort()
                  : [];

                return (
                  <Grid key={i} size={{ xs: 6, sm: 4 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          color: "secondary.main",
                          display: "flex",
                          mt: isEditable ? 1 : 0,
                        }}
                      >
                        {spec.icon}
                      </Box>
                      <Box sx={{ width: "100%" }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ textTransform: "uppercase", letterSpacing: 1 }}
                        >
                          {spec.label}
                        </Typography>

                        {isEditable ? (
                          <Autocomplete
                            freeSolo
                            options={options}
                            value={
                              editForm[spec.editableField as keyof Product] ||
                              ""
                            }
                            onChange={(event, newValue) => {
                              setEditForm((prev) => ({
                                ...prev,
                                [spec.editableField as string]: newValue,
                              }));
                            }}
                            onInputChange={(event, newInputValue) => {
                              setEditForm((prev) => ({
                                ...prev,
                                [spec.editableField as string]: newInputValue,
                              }));
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                fullWidth
                                variant="standard"
                                size="small"
                                sx={{
                                  input: {
                                    color: "common.white",
                                    fontWeight: 600,
                                    fontSize: "0.875rem",
                                  },
                                }}
                              />
                            )}
                          />
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: "common.white" }}
                          >
                            {spec.value || "Desconocido"}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>

          <Box
            sx={{ mt: 2, display: "flex", gap: 1, alignItems: "flex-start" }}
          >
            <LocalShipping fontSize="small" color="secondary" />
            <Typography
              variant="caption"
              color="text.secondary"
              fontStyle="italic"
            >
              Embalado con encantamientos protectores (plástico de burbujas)
              para asegurar su llegada a salvo.
            </Typography>
          </Box>
          <Box sx={{ mt: 4 }}>
            <Button
              variant="outlined"
              size="large"
              fullWidth
              disabled={isAdding}
              startIcon={<AddShoppingCart />}
              onClick={async () => {
                setIsAdding(true);
                // Simulate a small delay for better UX
                await new Promise((resolve) => setTimeout(resolve, 500));
                addToCart(activeProduct);
                setIsAdding(false);
                setSnackbarOpen(true);
              }}
              sx={{ py: 2, fontSize: "1.1rem", mb: 2 }}
            >
              {isAdding ? "Añadiendo..." : "Añadir al Carrito"}
            </Button>
            <Button
              variant="text"
              fullWidth
              startIcon={
                isWishlisted ? (
                  <Favorite sx={{ color: "primary.main" }} />
                ) : (
                  <FavoriteBorder />
                )
              }
              onClick={() => toggleWishlist(activeProduct.id)}
              sx={{ py: 1 }}
            >
              {isWishlisted ? "En Lista de Deseos" : "Añadir a Deseos"}
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Related Artifacts */}
      {relatedProducts.length > 0 && (
        <Box sx={{ mb: 10, mt: 8 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
            <Divider sx={{ flex: 1, borderColor: "rgba(197, 160, 89, 0.2)" }} />
            <Typography
              variant="h5"
              sx={{
                textTransform: "uppercase",
                letterSpacing: 3,
                fontWeight: "bold",
                fontStyle: "italic",
                color: "common.white",
              }}
            >
              Artefactos Relacionados
            </Typography>
            <Divider sx={{ flex: 1, borderColor: "rgba(197, 160, 89, 0.2)" }} />
          </Box>
          <Grid container spacing={3}>
            {relatedProducts.map((p) => (
              <Grid key={p.id} size={{ xs: 12, md: 4 }}>
                <Card
                  onClick={() => onProductClick?.(p.id)}
                  sx={{
                    bgcolor: "background.paper",
                    border: 1,
                    borderColor: "rgba(197, 160, 89, 0.2)",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    "&:hover": {
                      borderColor: "secondary.main",
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="250"
                    image={p.image}
                    alt={p.name}
                    sx={{
                      opacity: 0.8,
                      objectFit: "contain",
                      bgcolor: "black",
                    }}
                  />
                  <CardContent>
                    <Typography
                      variant="h6"
                      color="common.white"
                      fontWeight="bold"
                    >
                      {p.name}
                    </Typography>
                    <Typography variant="body2" color="secondary">
                      {p.price.toFixed(0)} GP
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Community Gallery */}
      {communityImages.length > 0 && (
        <Box sx={{ mb: 10 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
            <Divider sx={{ flex: 1, borderColor: "rgba(197, 160, 89, 0.2)" }} />
            <Typography
              variant="h5"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                textTransform: "uppercase",
                letterSpacing: 3,
                fontWeight: "bold",
                fontStyle: "italic",
                color: "common.white",
              }}
            >
              <Brush /> Galería de Aventureros
            </Typography>
            <Divider sx={{ flex: 1, borderColor: "rgba(197, 160, 89, 0.2)" }} />
          </Box>
          <Typography
            variant="body2"
            color="grey.500"
            sx={{ textAlign: "center", mb: 3, fontStyle: "italic" }}
          >
            Obras de arte pintadas por nuestra comunidad de aventureros
          </Typography>
          <Box sx={{ display: "flex", gap: 2, overflowX: "auto", pb: 2 }}>
            {communityImages.map((img, i) => (
              <Box
                key={i}
                onClick={() => {
                  setSelectedGalleryImage(img.url);
                  setGalleryOpen(true);
                }}
                sx={{
                  minWidth: 200,
                  maxWidth: 200,
                  position: "relative",
                  borderRadius: 2,
                  overflow: "hidden",
                  border: 1,
                  borderColor: "rgba(197, 160, 89, 0.1)",
                  cursor: "pointer",
                  "&:hover img": { transform: "scale(1.1)" },
                }}
              >
                <Box
                  component="img"
                  src={img.url}
                  sx={{
                    width: "100%",
                    height: 260,
                    objectFit: "cover",
                    transition: "transform 0.5s",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 1.5,
                    background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: "white", fontWeight: "bold" }}
                  >
                    {img.user}
                  </Typography>
                  {isAdmin && (
                    <Tooltip title="Eliminar imagen (Admin)" arrow>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteReview(img.reviewId);
                        }}
                        sx={{
                          color: "grey.400",
                          p: 0.5,
                          "&:hover": { color: "error.main" },
                        }}
                      >
                        <Delete sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Image Lightbox Dialog */}
      <Dialog
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        maxWidth="lg"
        PaperProps={{ sx: { bgcolor: "transparent", boxShadow: "none" } }}
      >
        <DialogContent sx={{ p: 0, position: "relative" }}>
          <IconButton
            onClick={() => setGalleryOpen(false)}
            sx={{ position: "absolute", top: -40, right: 0, color: "white" }}
          >
            <Close />
          </IconButton>
          {selectedGalleryImage && (
            <Box
              component="img"
              src={selectedGalleryImage}
              sx={{
                maxWidth: "90vw",
                maxHeight: "80vh",
                objectFit: "contain",
                borderRadius: 2,
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Reviews Section */}
      <Box sx={{ borderTop: 1, borderColor: "rgba(197, 160, 89, 0.2)", pt: 6 }}>
        <Grid container spacing={6}>
          {/* Form */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Typography
              variant="h6"
              color="secondary.main"
              gutterBottom
              sx={{
                textTransform: "uppercase",
                letterSpacing: 2,
                fontWeight: "bold",
              }}
            >
              Inscribe una Crónica
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              paragraph
              fontStyle="italic"
            >
              Comparte tu experiencia con este artefacto. Tus relatos guían a
              otros aventureros.
            </Typography>

            {user ? (
              <Stack spacing={3} sx={{ mt: 3 }}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "rgba(197, 160, 89, 0.1)",
                    borderRadius: 1,
                    border: 1,
                    borderColor: "rgba(197, 160, 89, 0.2)",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Publicando como
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    color="secondary.main"
                    fontWeight="bold"
                  >
                    {user.name}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    component="legend"
                    variant="caption"
                    color="text.secondary"
                  >
                    Rating
                  </Typography>
                  <Rating
                    value={newReview.rating}
                    onChange={(_, val) =>
                      setNewReview({ ...newReview, rating: val || 5 })
                    }
                    emptyIcon={
                      <Star
                        style={{ opacity: 0.3, color: "grey" }}
                        fontSize="inherit"
                      />
                    }
                  />
                </Box>

                <TextField
                  label="Crónica"
                  multiline
                  rows={4}
                  variant="outlined"
                  fullWidth
                  value={newReview.text}
                  onChange={(e) =>
                    setNewReview({ ...newReview, text: e.target.value })
                  }
                />

                <Box>
                  <Typography
                    variant="caption"
                    display="block"
                    color="text.secondary"
                    gutterBottom
                  >
                    Prueba Visual (Opcional)
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<AddAPhoto />}
                    color="secondary"
                    sx={{ textTransform: "none" }}
                  >
                    Adjuntar Imagen
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </Button>
                  {newReview.image && (
                    <Box
                      sx={{
                        mt: 1,
                        position: "relative",
                        width: 80,
                        height: 80,
                        borderRadius: 1,
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={newReview.image}
                        alt="Preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() =>
                          setNewReview({ ...newReview, image: null })
                        }
                        sx={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          bgcolor: "rgba(0,0,0,0.6)",
                          color: "white",
                        }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>

                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  size="large"
                  onClick={handleSubmitReview}
                  disabled={!newReview.text || submittingReview}
                  sx={{ color: "background.default", fontWeight: "bold" }}
                >
                  {submittingReview ? "Inscribiendo..." : "Publicar Crónica"}
                </Button>
              </Stack>
            ) : (
              <Box
                sx={{
                  mt: 3,
                  p: 4,
                  textAlign: "center",
                  bgcolor: "rgba(0,0,0,0.3)",
                  borderRadius: 2,
                  border: 1,
                  borderColor: "rgba(197, 160, 89, 0.2)",
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  paragraph
                  fontStyle="italic"
                >
                  Debes iniciar sesión para dejar una crónica.
                </Typography>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setView(ViewState.LOGIN)}
                  sx={{ fontWeight: "bold" }}
                >
                  Iniciar Sesión
                </Button>
              </Box>
            )}
          </Grid>

          {/* Log */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 4,
                pb: 2,
                borderBottom: 1,
                borderColor: "rgba(197, 160, 89, 0.2)",
              }}
            >
              <Typography
                variant="h5"
                color="common.white"
                fontWeight="bold"
                sx={{ fontStyle: "italic" }}
              >
                Registro del Escriba
              </Typography>
              <Typography variant="caption" color="secondary.main">
                {reviews.length} Entradas registradas
              </Typography>
            </Box>

            <Stack spacing={4}>
              {reviewsLoading ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography
                    variant="body2"
                    color="grey.500"
                    fontStyle="italic"
                  >
                    Consultando los archivos...
                  </Typography>
                </Box>
              ) : reviews.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography
                    variant="body2"
                    color="grey.500"
                    fontStyle="italic"
                  >
                    Aún no hay crónicas inscritas. ¡Sé el primero en compartir
                    tu experiencia!
                  </Typography>
                </Box>
              ) : (
                reviews.map((review) => (
                  <Paper
                    key={review.id}
                    elevation={0}
                    sx={{
                      p: 3,
                      bgcolor: "background.paper",
                      border: 1,
                      borderColor: "rgba(197, 160, 89, 0.1)",
                      position: "relative",
                    }}
                  >
                    {isAdmin && (
                      <Tooltip title="Eliminar crónica (Admin)" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteReview(review.id)}
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            color: "grey.600",
                            "&:hover": { color: "error.main" },
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Avatar
                          src={review.user_avatar?.includes('images/avatars/') ? DEFAULT_AVATAR_URL : review.user_avatar}
                          alt={review.user_name}
                          sx={{
                            bgcolor: "rgba(197, 160, 89, 0.2)",
                            color: "secondary.main",
                            fontWeight: "bold",
                            border: 1,
                            borderColor: "rgba(197, 160, 89, 0.3)",
                          }}
                        >
                          {review.user_name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            color="common.white"
                            fontWeight="bold"
                          >
                            {review.user_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatRelativeDate(review.created_at)}
                          </Typography>
                        </Box>
                      </Box>
                      <Rating
                        value={review.rating}
                        readOnly
                        size="small"
                        emptyIcon={
                          <Star
                            style={{ opacity: 0.3, color: "grey" }}
                            fontSize="inherit"
                          />
                        }
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontStyle="italic"
                      paragraph
                    >
                      "{review.text}"
                    </Typography>
                    {review.image && (
                      <Box
                        component="img"
                        src={review.image}
                        alt="User upload"
                        onClick={() => {
                          setSelectedGalleryImage(review.image);
                          setGalleryOpen(true);
                        }}
                        sx={{
                          height: 100,
                          borderRadius: 1,
                          border: 1,
                          borderColor: "rgba(255,255,255,0.1)",
                          cursor: "pointer",
                          "&:hover": { opacity: 0.8 },
                        }}
                      />
                    )}
                  </Paper>
                ))
              )}
            </Stack>
          </Grid>
        </Grid>
      </Box>
      <Dialog
        open={!!zoomImage}
        onClose={() => setZoomImage(null)}
        maxWidth="lg"
      >
        <DialogContent
          sx={{
            p: 0,
            position: "relative",
            bgcolor: "black",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box
            component="img"
            src={zoomImage || ""}
            alt="Zoom"
            sx={{ maxWidth: "100%", maxHeight: "90vh", objectFit: "contain" }}
            onClick={() => setZoomImage(null)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        maxWidth="lg"
      >
        <DialogContent
          sx={{
            p: 0,
            position: "relative",
            bgcolor: "black",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box
            component="img"
            src={selectedGalleryImage || ""}
            alt="Gallery Zoom"
            sx={{ maxWidth: "100%", maxHeight: "90vh", objectFit: "contain" }}
            onClick={() => setGalleryOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {activeProduct?.name} añadido a tu inventario.
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductDetail;
