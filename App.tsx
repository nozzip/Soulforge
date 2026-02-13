/// <reference lib="dom" />
import React, { useState, useEffect } from "react";
import { CartProvider } from "./context/CartContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Wishlist from "./pages/Wishlist";
import Admin from "./pages/Admin";
import Orders from "./pages/Orders";
import Feedback from "./pages/Feedback";
import HowToBuy from "./pages/HowToBuy";
import NewAdventurerGuide from "./pages/NewAdventurerGuide";
import ForumHome from "./pages/Forum/ForumHome";
import Category from "./pages/Forum/Category";
import Thread from "./pages/Forum/Thread";
import CreateThread from "./pages/Forum/CreateThread";
import LFGBoard from "./pages/Forum/LFG/LFGBoard";
import Profile from "./pages/Profile";
import EditorTest from "./pages/EditorTest";
import { ViewState, Product } from "./types";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { fantasyTheme, warhammerTheme } from "./src/theme";
import { supabase } from "./src/supabase";
import { User } from "@supabase/supabase-js";
import { updatePageMeta, getSEOForView } from "./utils/seo";

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [selectedForumCategoryId, setSelectedForumCategoryId] = useState<
    string | null
  >(null);
  const [selectedForumThreadId, setSelectedForumThreadId] = useState<
    string | null
  >(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("token")) {
      setCurrentView(ViewState.FEEDBACK);
    }
  }, []);

  // Catalog state persistence
  const [catalogState, setCatalogState] = useState({
    page: 1,
    searchQuery: "",
    selectedCategories: [] as string[],
    selectedSizes: [] as string[],
    selectedDesigners: [] as string[],
    selectedCreatureTypes: [] as string[],
    selectedWeapons: [] as string[],
    sortOption: "newest",
  });

  // Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Products from Supabase
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
    } else if (data) {
      setProducts(data as Product[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Dynamic Metadata State
  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("resinforge_categories");
      return saved
        ? JSON.parse(saved)
        : ["D&D", "Warhammer", "Sci-Fi", "Anime", "Cine"];
    } catch (e) {
      return ["D&D", "Warhammer", "Sci-Fi", "Anime", "Cine"];
    }
  });

  const [sizes, setSizes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("resinforge_sizes");
      return saved
        ? JSON.parse(saved)
        : ["Small", "Medium", "Large", "Huge", "Gargantuan"];
    } catch (e) {
      return ["Small", "Medium", "Large", "Huge", "Gargantuan"];
    }
  });

  // Persistence Effects

  useEffect(() => {
    localStorage.setItem("resinforge_categories", JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem("resinforge_sizes", JSON.stringify(sizes));
  }, [sizes]);

  // User State
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check if user is admin
  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data, error } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      const adminStatus = !error && !!data;
      setIsAdmin(adminStatus);
    };

    checkAdminStatus();
  }, [user]);

  // Wishlist State - Syncs with Supabase when user is logged in
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("resinforge_wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // MUI Theme handles class toggling via CssBaseline and ThemeProvider

  // Load wishlist from Supabase when user logs in
  useEffect(() => {
    const loadWishlist = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("wishlists")
          .select("product_id")
          .eq("user_id", user.id);

        if (!error && data) {
          const productIds = data.map((item) => item.product_id);
          setWishlist(productIds);
          localStorage.setItem(
            "resinforge_wishlist",
            JSON.stringify(productIds),
          );
        }
      }
    };
    loadWishlist();
  }, [user]);

  // Persist Wishlist to localStorage
  useEffect(() => {
    localStorage.setItem("resinforge_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = async (productId: string) => {
    const isInWishlist = wishlist.includes(productId);

    // Optimistic update
    setWishlist((prev) => {
      if (isInWishlist) {
        return prev.filter((id) => id !== productId);
      }
      return [...prev, productId];
    });

    // Sync with Supabase if user is logged in
    if (user) {
      if (isInWishlist) {
        await supabase
          .from("wishlists")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);
      } else {
        await supabase
          .from("wishlists")
          .insert({ user_id: user.id, product_id: productId });
      }
    }
  };

  const handleProductClick = (id: string) => {
    setSelectedProductId(id);
    setCurrentView(ViewState.PRODUCT_DETAIL);
  };

  const handleSearch = (query: string) => {
    setGlobalSearchQuery(query);
    setCatalogState((prev) => ({ ...prev, searchQuery: query, page: 1 }));
    setCurrentView(ViewState.CATALOG);
  };

  const handleSetView = (view: ViewState) => {
    if (view === ViewState.CATALOG) {
      setGlobalSearchQuery("");
    }
    setCurrentView(view);
  };

  // Update SEO metadata when view or product changes
  useEffect(() => {
    const currentProduct = selectedProductId
      ? products.find((p) => p.id === selectedProductId)
      : null;
    const seoData = getSEOForView(currentView, currentProduct);
    updatePageMeta(seoData);
  }, [currentView, selectedProductId, products]);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    // Don't redirect away from FEEDBACK view - let the user continue their review
    if (currentView !== ViewState.FEEDBACK) {
      setCurrentView(ViewState.HOME);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentView(ViewState.HOME);
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleDeleteProduct = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      alert("Error al eliminar producto: " + error.message);
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)),
    );

    // Auto-add new category to global list if it doesn't exist
    if (
      updatedProduct.category &&
      !categories.includes(updatedProduct.category)
    ) {
      setCategories((prev) => [...prev, updatedProduct.category]);
    }

    // Auto-add new size to global list if it doesn't exist
    if (updatedProduct.size && !sizes.includes(updatedProduct.size)) {
      setSizes((prev) => [...prev, updatedProduct.size]);
    }
  };

  const handleAddCategory = (cat: string) => {
    if (!categories.includes(cat)) setCategories((prev) => [...prev, cat]);
  };

  const handleAddSize = (size: string) => {
    if (!sizes.includes(size)) setSizes((prev) => [...prev, size]);
  };

  const handleDeleteCategory = (cat: string) => {
    setCategories((prev) => prev.filter((c) => c !== cat));
  };

  const handleDeleteSize = (size: string) => {
    setSizes((prev) => prev.filter((s) => s !== size));
  };

  // Forum Handlers
  const handleForumCategorySelect = (categoryId: string) => {
    setSelectedForumCategoryId(categoryId);
    setCurrentView(ViewState.FORUM_CATEGORY);
  };

  const handleForumThreadSelect = (threadId: string) => {
    setSelectedForumThreadId(threadId);
    setGlobalSearchQuery(""); // Clear search when entering thread
    setCurrentView(ViewState.FORUM_THREAD);
  };

  const handleForumBackToHome = () => {
    setSelectedForumCategoryId(null);
    setCurrentView(ViewState.FORUM_HOME);
  };

  const handleForumBackToCategory = () => {
    setSelectedForumThreadId(null);
    setCurrentView(ViewState.FORUM_CATEGORY);
  };

  const handleLFGClick = () => {
    setCurrentView(ViewState.FORUM_LFG);
  };

  const renderView = () => {
    const designers = Array.from(
      new Set(products.map((p) => p.designer).filter(Boolean)),
    ) as string[];
    const creatureTypes = Array.from(
      new Set(products.map((p) => p.creature_type).filter(Boolean)),
    ) as string[];
    const weapons = Array.from(
      new Set(
        products
          .map((p) => p.weapon)
          .filter(Boolean)
          .flatMap((w) => (w as string).split("/").map((s) => s.trim())),
      ),
    ).sort() as string[];

    switch (currentView) {
      case ViewState.HOME:
        return <Home setView={handleSetView} />;
      case ViewState.CATALOG:
        return (
          <Catalog
            products={products}
            categories={categories}
            sizes={sizes}
            onProductClick={handleProductClick}
            initialSearchQuery={globalSearchQuery}
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
            loading={loading}
            designers={designers}
            creatureTypes={creatureTypes}
            weapons={weapons}
            isAdmin={isAdmin}
            onDeleteProduct={handleDeleteProduct}
            onUpdateProduct={handleUpdateProduct}
            onRefreshProducts={fetchProducts}
            catalogState={catalogState}
            onCatalogStateChange={setCatalogState}
          />
        );
      case ViewState.CART:
        return <Cart setView={handleSetView} />;
      case ViewState.CHECKOUT:
        return <Checkout />;
      case ViewState.PRODUCT_DETAIL:
        return (
          <ProductDetail
            products={products}
            productId={selectedProductId}
            setView={handleSetView}
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
            isAdmin={isAdmin}
            user={
              user
                ? {
                    name:
                      user.user_metadata?.full_name || user.email || "Usuario",
                    id: user.id,
                  }
                : null
            }
            onUpdateProduct={handleUpdateProduct}
            onProductClick={handleProductClick}
          />
        );
      case ViewState.LOGIN:
        return <Login setView={handleSetView} onLogin={handleLogin} />;
      case ViewState.SIGNUP:
        return <Signup setView={handleSetView} onLogin={handleLogin} />;
      case ViewState.WISHLIST:
        return (
          <Wishlist
            products={products}
            setView={handleSetView}
            onProductClick={handleProductClick}
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
          />
        );
      case ViewState.ORDERS:
        return <Orders setView={handleSetView} />;
      case ViewState.FEEDBACK:
        return (
          <Feedback setView={handleSetView} user={user} onLogin={handleLogin} />
        );
      case ViewState.HOW_TO_BUY:
        return <HowToBuy setView={handleSetView} />;
      case ViewState.NEW_ADVENTURER:
        return <NewAdventurerGuide setView={handleSetView} />;
      case ViewState.ADMIN:
        return (
          <Admin
            setView={handleSetView}
            onAddProduct={handleAddProduct}
            categories={categories}
            sizes={sizes}
            onAddCategory={handleAddCategory}
            onAddSize={handleAddSize}
            onDeleteCategory={handleDeleteCategory}
            onDeleteSize={handleDeleteSize}
          />
        );
      case ViewState.FORUM_HOME:
        return (
          <ForumHome
            onCategorySelect={handleForumCategorySelect}
            onThreadSelect={handleForumThreadSelect}
            onProductSelect={handleProductClick}
            onLFGClick={handleLFGClick}
            user={user}
            isAdmin={isAdmin}
          />
        );
      case ViewState.FORUM_CATEGORY:
        return selectedForumCategoryId ? (
          <Category
            categoryId={selectedForumCategoryId}
            onThreadSelect={handleForumThreadSelect}
            onBack={handleForumBackToHome}
            onCreateThread={() => handleSetView(ViewState.FORUM_CREATE_THREAD)}
            user={user}
            isAdmin={isAdmin}
          />
        ) : (
          <ForumHome
            onCategorySelect={handleForumCategorySelect}
            user={user}
            isAdmin={isAdmin}
          />
        );
      case ViewState.FORUM_CREATE_THREAD:
        return selectedForumCategoryId ? (
          <CreateThread
            categoryId={selectedForumCategoryId}
            onCancel={() => handleSetView(ViewState.FORUM_CATEGORY)}
            onThreadCreated={(threadId) => {
              handleForumThreadSelect(threadId);
            }}
            user={user}
          />
        ) : (
          <ForumHome
            onCategorySelect={handleForumCategorySelect}
            user={user}
            isAdmin={isAdmin}
          />
        );
      case ViewState.FORUM_LFG:
        return <LFGBoard onBack={handleForumBackToHome} />;
      case ViewState.FORUM_THREAD:
        return selectedForumThreadId ? (
          <Thread
            threadId={selectedForumThreadId}
            onBack={handleForumBackToCategory}
            user={user}
            isAdmin={isAdmin}
          />
        ) : selectedForumCategoryId ? (
          <Category
            categoryId={selectedForumCategoryId}
            onThreadSelect={handleForumThreadSelect}
            onBack={handleForumBackToHome}
            onCreateThread={() => handleSetView(ViewState.FORUM_CREATE_THREAD)}
            user={user}
            isAdmin={isAdmin}
          />
        ) : (
          <ForumHome
            onCategorySelect={handleForumCategorySelect}
            user={user}
            isAdmin={isAdmin}
          />
        );
      case ViewState.PROFILE:
        return user ? (
          <Profile user={user} />
        ) : (
          <Login setView={handleSetView} onLogin={handleLogin} />
        );
      case ViewState.EDITOR_TEST:
        return <EditorTest />;
      default:
        return <Home setView={handleSetView} />;
    }
  };

  // Theme State
  const [isWarhammer, setIsWarhammer] = useState<boolean>(() => {
    try {
      return localStorage.getItem("resinforge_theme") === "warhammer";
    } catch (e) {
      return false;
    }
  });

  const toggleTheme = () => {
    setIsWarhammer((prev) => !prev);
  };

  useEffect(() => {
    localStorage.setItem(
      "resinforge_theme",
      isWarhammer ? "warhammer" : "fantasy",
    );
  }, [isWarhammer]);

  // ... (rest of state items are unchanged if possible, or I need to preserve them)

  // Wait, replace_file_content replaces a block.
  // I should use rewrite the whole return statement to include ThemeProvider.

  // Let me re-read App.tsx content from previous step to ensure I capture everything.
  // I will use multi_replace to insert imports and wrap the return.

  return (
    <ThemeProvider theme={isWarhammer ? warhammerTheme : fantasyTheme}>
      <CssBaseline />
      <CartProvider>
        <Layout
          products={products}
          setView={handleSetView}
          currentView={currentView}
          onSearch={handleSearch}
          onProductSelect={handleProductClick}
          user={user ? user.user_metadata.full_name || user.email : null}
          isAdmin={isAdmin}
          onLogout={handleLogout}
          isWarhammer={isWarhammer}
          onToggleTheme={toggleTheme}
        >
          {renderView()}
        </Layout>
      </CartProvider>
    </ThemeProvider>
  );
};

export default App;
