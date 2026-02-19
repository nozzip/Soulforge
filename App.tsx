/// <reference lib="dom" />
import React, { useState, useEffect, Suspense, useMemo } from "react";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Wishlist from "./pages/Wishlist";
import Admin from "@/src/features/admin";
import Orders from "./pages/Orders";
import Feedback from "./pages/Feedback";
import HowToBuy from "./pages/HowToBuy";
import NewAdventurerGuide from "./pages/NewAdventurerGuide";
import {
  ForumHome,
  Category,
  Thread,
  CreateThread,
  LFGBoard,
} from "@/src/features/forum";
import { useCatalogMetadata } from "./src/hooks/useCatalogMetadata";
import { useQueryClient } from "@tanstack/react-query";
import Profile from "./pages/Profile";
import EditorTest from "./pages/EditorTest";
import ErrorBoundary from "./components/ErrorBoundary";
import ForgeLoader from "./components/ForgeLoader";
import { ViewState, Product, Profile as ProfileType } from "./types";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { fantasyTheme, warhammerTheme } from "./src/theme";
import { supabase } from "./src/supabase";
import { User } from "@supabase/supabase-js";
import { updatePageMeta, getSEOForView } from "./utils/seo";
import { DEFAULT_AVATAR_URL } from "./constants";
import { HelmetProvider } from "react-helmet-async";
import SEO from "./components/SEO";
import SmoothScroll from "./src/components/SmoothScroll";

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null,
  );
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

  // Scroll persistence for main views
  const [viewScrollPositions, setViewScrollPositions] = useState<
    Record<string, number>
  >({});

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

  // Products State - Removed (Migrated to React Query)
  // Loading State - Removed (Migrated to Suspense)

  // Dynamic Metadata State
  const { data: metadata } = useCatalogMetadata();
  const allCategories = metadata?.categories || [];
  const allSizes = metadata?.sizes || [];
  const queryClient = useQueryClient();

  // User State
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userProfile, setUserProfile] = useState<ProfileType | null>(null);

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

  const fetchProfile = async () => {
    if (!user) {
      setUserProfile(null);
      return;
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (!error && data) {
      setUserProfile(data);
    } else if (!error && !data) {
      // Fallback for new users without profile yet
      const metadataAvatar = user.user_metadata?.avatar_url;
      const finalAvatar =
        metadataAvatar && !metadataAvatar.includes("images/avatars/")
          ? metadataAvatar
          : DEFAULT_AVATAR_URL;

      setUserProfile({
        id: user.id,
        avatar_url: finalAvatar,
        username: user.user_metadata?.full_name || user.email?.split("@")[0],
        full_name: user.user_metadata?.full_name || "",
        xp: 0,
        level: 1,
      } as ProfileType);
    }
  };

  // Fetch profile when user changes
  useEffect(() => {
    fetchProfile();
  }, [user]);

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
      const saved = localStorage.getItem("wishlist");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
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
    navigateTo(ViewState.PRODUCT_DETAIL);
  };

  const navigateTo = (view: ViewState, options?: { resetScroll?: boolean }) => {
    const prevView = currentView;

    // Vistas que preservan su scroll al salir
    const mainViews = [
      ViewState.CATALOG,
      ViewState.FORUM_HOME,
      ViewState.FORUM_CATEGORY,
      ViewState.HOW_TO_BUY,
      ViewState.NEW_ADVENTURER,
    ];

    if (mainViews.includes(prevView)) {
      setViewScrollPositions((prev) => ({
        ...prev,
        [prevView]: window.scrollY,
      }));
    }

    // Identificar si es una navegación de "regreso" a un padre
    const isBackNav =
      (prevView === ViewState.PRODUCT_DETAIL && view === ViewState.CATALOG) ||
      (prevView === ViewState.FORUM_THREAD &&
        view === ViewState.FORUM_CATEGORY) ||
      (prevView === ViewState.FORUM_CATEGORY && view === ViewState.FORUM_HOME);

    const shouldRestore = isBackNav && options?.resetScroll !== true;

    // console.log('[Navigation] Navigating:', { from: prevView, to: view, isBackNav, resetScroll: options?.resetScroll, shouldRestore, savedScroll: viewScrollPositions[view] });

    if (shouldRestore) {
      const savedPos = viewScrollPositions[view] || 0;
      // console.log("[Navigation] Restoring scroll to:", savedPos);
      setCurrentView(view);

      // Robust scroll restoration
      const attemptRestore = (attempt: number) => {
        if (attempt > 10) return; // Stop after 10 attempts (~1.5s)

        const currentScroll = window.scrollY;
        const maxScroll =
          document.documentElement.scrollHeight - window.innerHeight;

        // If page is too short to restore to savedPos, wait for it to grow
        if (savedPos > maxScroll && maxScroll < 5000) {
          // ...
          setTimeout(() => attemptRestore(attempt + 1), 150);
          return;
        }

        // Special case: If returning to Catalog and savedPos is near 0 (banner),
        // try to scroll to content ensuring user sees filters/products not just banner.
        if (view === ViewState.CATALOG && savedPos < 300) {
          const catalogContent = document.getElementById("catalog-content");
          if (catalogContent) {
            // console.log(
            //   "[Navigation] Low saved scroll on Catalog return. Scrolling to content anchor.",
            // );
            catalogContent.scrollIntoView({ behavior: "smooth" });
            return; // Done
          }
        }

        if (Math.abs(currentScroll - savedPos) > 50) {
          window.scrollTo({ top: savedPos, behavior: "instant" });
          setTimeout(() => attemptRestore(attempt + 1), 100);
        } else {
          // console.log("[Navigation] Scroll restored successfully");
        }
      };

      // Start attempts
      // If we are restoring to < 300 in catalog, skip instant scroll to 0 and let attemptRestore handle anchor
      if (!(view === ViewState.CATALOG && savedPos < 300)) {
        window.scrollTo({ top: savedPos, behavior: "instant" });
      }
      setTimeout(() => attemptRestore(1), 50);
    } else {
      // console.log("[Navigation] Resetting scroll");
      // Navegación nueva o forzada al top
      setViewScrollPositions((prev) => ({ ...prev, [view]: 0 }));
      setCurrentView(view);

      if (view === ViewState.CATALOG) {
        // Force scroll to content, skipping banner even on fresh visits
        setTimeout(() => {
          const catalogContent = document.getElementById("catalog-content");
          if (catalogContent) {
            catalogContent.scrollIntoView({ behavior: "smooth" });
          } else {
            window.scrollTo(0, 0);
          }
        }, 100);
      } else {
        window.scrollTo(0, 0);
      }
    }

    if (view === ViewState.CATALOG && !shouldRestore) {
      setGlobalSearchQuery("");
      setCatalogState((prev) => ({ ...prev, page: 1 }));
    }
  };

  const handleSetView = (
    view: ViewState,
    options?: { resetScroll?: boolean },
  ) => {
    navigateTo(view, options);
  };

  const handleNavigateWithFilters = (filters: {
    categories?: string[];
    creatureTypes?: string[];
  }) => {
    setGlobalSearchQuery("");
    setCatalogState((prev) => ({
      ...prev,
      page: 1,
      searchQuery: "",
      selectedCategories: filters.categories || [],
      selectedCreatureTypes: filters.creatureTypes || [],
      selectedSizes: [],
      selectedDesigners: [],
      selectedWeapons: [],
    }));
    // Al navegar desde Home, siempre vamos al top
    setViewScrollPositions((prev) => ({ ...prev, [ViewState.CATALOG]: 0 }));
    window.scrollTo(0, 0);
    setCurrentView(ViewState.CATALOG);
  };

  const handleSearch = (query: string) => {
    setGlobalSearchQuery(query);
    setCatalogState((prev) => ({ ...prev, searchQuery: query, page: 1 }));
    setViewScrollPositions((prev) => ({ ...prev, [ViewState.CATALOG]: 0 }));
    window.scrollTo(0, 0);
    setCurrentView(ViewState.CATALOG);
  };

  // Update SEO metadata when view or product changes
  // Update SEO metadata when view changes
  const seoData = getSEOForView(currentView, null); // Default SEO for views. Pages can override.

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

  // Admin Handlers - Now just invalidates queries as data is derived
  const handleAddCategory = (cat: string) => {
    // In a real app, Admin would add this to DB. Here we just re-fetch.
    queryClient.invalidateQueries({ queryKey: ["catalog-metadata"] });
  };

  const handleAddSize = (size: string) => {
    queryClient.invalidateQueries({ queryKey: ["catalog-metadata"] });
  };

  const handleDeleteCategory = (cat: string) => {
    queryClient.invalidateQueries({ queryKey: ["catalog-metadata"] });
  };

  const handleDeleteSize = (size: string) => {
    queryClient.invalidateQueries({ queryKey: ["catalog-metadata"] });
  };

  // Forum Handlers
  const handleForumCategorySelect = (categoryId: string) => {
    setSelectedForumCategoryId(categoryId);
    navigateTo(ViewState.FORUM_CATEGORY);
  };

  const handleForumThreadSelect = (threadId: string) => {
    setSelectedForumThreadId(threadId);
    setGlobalSearchQuery("");
    navigateTo(ViewState.FORUM_THREAD);
  };

  const handleForumBackToHome = () => {
    setSelectedForumCategoryId(null);
    navigateTo(ViewState.FORUM_HOME);
  };

  const handleForumBackToCategory = () => {
    setSelectedForumThreadId(null);
    navigateTo(ViewState.FORUM_CATEGORY);
  };

  const handleLFGClick = () => {
    setCurrentView(ViewState.FORUM_LFG);
  };

  const handleProfileClick = (userId: string) => {
    setSelectedProfileId(userId);
    navigateTo(ViewState.PROFILE);
  };

  const renderView = () => {
    return (
      <ErrorBoundary>
        {(() => {
          switch (currentView) {
            case ViewState.HOME:
              return (
                <Home
                  setView={handleSetView}
                  onFilterNavigate={handleNavigateWithFilters}
                  user={user}
                  isAdmin={isAdmin}
                />
              );
            case ViewState.CATALOG:
              return (
                <Catalog
                  categories={metadata?.categories || []}
                  sizes={metadata?.sizes || []}
                  designers={metadata?.designers || []}
                  creatureTypes={metadata?.creatureTypes || []}
                  weapons={metadata?.weapons || []}
                  onProductClick={handleProductClick}
                  initialSearchQuery={globalSearchQuery}
                  wishlist={wishlist}
                  toggleWishlist={toggleWishlist}
                  isAdmin={isAdmin}
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
                  productId={selectedProductId}
                  setView={handleSetView}
                  wishlist={wishlist}
                  toggleWishlist={toggleWishlist}
                  isAdmin={isAdmin}
                  user={
                    user
                      ? {
                          name:
                            user.user_metadata?.full_name ||
                            user.email ||
                            "Usuario",
                          id: user.id,
                          avatar: userProfile?.avatar_url || DEFAULT_AVATAR_URL,
                        }
                      : null
                  }
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
                <Feedback
                  setView={handleSetView}
                  user={user}
                  onLogin={handleLogin}
                />
              );
            case ViewState.HOW_TO_BUY:
              return <HowToBuy setView={handleSetView} />;
            case ViewState.NEW_ADVENTURER:
              return <NewAdventurerGuide setView={handleSetView} />;
            case ViewState.ADMIN:
              return (
                <Admin
                  setView={handleSetView}
                  categories={allCategories}
                  sizes={allSizes}
                  onAddCategory={handleAddCategory}
                  onAddSize={handleAddSize}
                  onDeleteCategory={handleDeleteCategory}
                  onDeleteSize={handleDeleteSize}
                  isAdmin={isAdmin}
                />
              );
            case ViewState.FORUM_HOME:
              return (
                <ForumHome
                  onCategorySelect={handleForumCategorySelect}
                  onThreadSelect={handleForumThreadSelect}
                  onProductSelect={handleProductClick}
                  onLFGClick={handleLFGClick}
                  onProfileClick={handleProfileClick}
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
                  onCreateThread={() =>
                    handleSetView(ViewState.FORUM_CREATE_THREAD)
                  }
                  user={user}
                  isAdmin={isAdmin}
                  onProfileClick={handleProfileClick}
                />
              ) : (
                <ForumHome
                  onCategorySelect={handleForumCategorySelect}
                  user={user}
                  isAdmin={isAdmin}
                  onProfileClick={handleProfileClick}
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
                  onProfileClick={handleProfileClick}
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
                  onGoHome={handleForumBackToHome}
                  onProfileClick={handleProfileClick}
                />
              ) : selectedForumCategoryId ? (
                <Category
                  categoryId={selectedForumCategoryId}
                  onThreadSelect={handleForumThreadSelect}
                  onBack={handleForumBackToHome}
                  onCreateThread={() =>
                    handleSetView(ViewState.FORUM_CREATE_THREAD)
                  }
                  user={user}
                  isAdmin={isAdmin}
                  onProfileClick={handleProfileClick}
                />
              ) : (
                <ForumHome
                  onCategorySelect={handleForumCategorySelect}
                  user={user}
                  isAdmin={isAdmin}
                  onProfileClick={handleProfileClick}
                />
              );
            case ViewState.PROFILE:
              return (
                <Profile
                  user={user}
                  viewedUserId={selectedProfileId || user?.id}
                  onProfileUpdate={fetchProfile}
                />
              );
            case ViewState.EDITOR_TEST:
              return <EditorTest />;
            default:
              return (
                <Home
                  setView={handleSetView}
                  onFilterNavigate={handleNavigateWithFilters}
                />
              );
          }
        })()}
      </ErrorBoundary>
    );
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
    <HelmetProvider>
      <ThemeProvider theme={isWarhammer ? warhammerTheme : fantasyTheme}>
        <CssBaseline />
        <SmoothScroll>
          <SEO {...seoData} />

          <CartProvider>
            <ToastProvider>
              <Suspense fallback={<ForgeLoader />}>
                <Layout
                  setView={handleSetView}
                  currentView={currentView}
                  onSearch={handleSearch}
                  onProductSelect={handleProductClick}
                  user={
                    user ? user.user_metadata?.full_name || user.email : null
                  }
                  userProfile={userProfile}
                  isAdmin={isAdmin}
                  onLogout={handleLogout}
                  isWarhammer={isWarhammer}
                  onToggleTheme={toggleTheme}
                >
                  {renderView()}
                </Layout>
              </Suspense>
            </ToastProvider>
          </CartProvider>
        </SmoothScroll>
      </ThemeProvider>
    </HelmetProvider>
  );
};

export default App;
