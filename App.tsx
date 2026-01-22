/// <reference lib="dom" />
import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Wishlist from './pages/Wishlist';
import Admin from './pages/Admin';
import Orders from './pages/Orders';
import { ViewState, Product } from './types';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { fantasyTheme, warhammerTheme } from './src/theme';
import { supabase } from './src/supabase';
import { User } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
      } else if (data) {
        setProducts(data as Product[]);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  // Dynamic Metadata State
  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('resinforge_categories');
      return saved ? JSON.parse(saved) : ["D&D", "Warhammer", "Sci-Fi", "Anime", "Movies"];
    } catch (e) {
      return ["D&D", "Warhammer", "Sci-Fi", "Anime", "Movies"];
    }
  });

  const [scales, setScales] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('resinforge_scales');
      return saved ? JSON.parse(saved) : ["Medium", "Large", "Gargantuan", "Colossal"];
    } catch (e) {
      return ["Medium", "Large", "Gargantuan", "Colossal"];
    }
  });

  // Persistence Effects

  useEffect(() => {
    localStorage.setItem('resinforge_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('resinforge_scales', JSON.stringify(scales));
  }, [scales]);

  // User State
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Wishlist State
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('resinforge_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // MUI Theme handles class toggling via CssBaseline and ThemeProvider

  // Persist Wishlist
  useEffect(() => {
    localStorage.setItem('resinforge_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  };

  const handleProductClick = (id: string) => {
    setSelectedProductId(id);
    setCurrentView(ViewState.PRODUCT_DETAIL);
  };

  const handleSearch = (query: string) => {
    setGlobalSearchQuery(query);
    setCurrentView(ViewState.CATALOG);
  };

  const handleSetView = (view: ViewState) => {
    if (view === ViewState.CATALOG) {
      setGlobalSearchQuery('');
    }
    setCurrentView(view);
  };

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    setCurrentView(ViewState.HOME);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentView(ViewState.HOME);
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev]);
  };

  const handleAddCategory = (cat: string) => {
    if (!categories.includes(cat)) setCategories(prev => [...prev, cat]);
  };

  const handleAddScale = (scale: string) => {
    if (!scales.includes(scale)) setScales(prev => [...prev, scale]);
  };

  const handleDeleteCategory = (cat: string) => {
    setCategories(prev => prev.filter(c => c !== cat));
  };

  const handleDeleteScale = (scale: string) => {
    setScales(prev => prev.filter(s => s !== scale));
  };

  const renderView = () => {
    switch (currentView) {
      case ViewState.HOME:
        return <Home setView={handleSetView} />;
      case ViewState.CATALOG:
        return (
          <Catalog
            products={products}
            categories={categories}
            scales={scales}
            onProductClick={handleProductClick}
            initialSearchQuery={globalSearchQuery}
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
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
      case ViewState.ADMIN:
        return (
          <Admin
            setView={handleSetView}
            onAddProduct={handleAddProduct}
            categories={categories}
            scales={scales}
            onAddCategory={handleAddCategory}
            onAddScale={handleAddScale}
            onDeleteCategory={handleDeleteCategory}
            onDeleteScale={handleDeleteScale}
          />
        );
      default:
        return <Home setView={handleSetView} />;
    }
  };

  // Theme State
  const [isWarhammer, setIsWarhammer] = useState<boolean>(() => {
    try {
      return localStorage.getItem('resinforge_theme') === 'warhammer';
    } catch (e) {
      return false;
    }
  });

  const toggleTheme = () => {
    setIsWarhammer(prev => !prev);
  };

  useEffect(() => {
    localStorage.setItem('resinforge_theme', isWarhammer ? 'warhammer' : 'fantasy');
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
          user={user ? (user.user_metadata.full_name || user.email) : null}
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