import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem } from '../types';
import { supabase } from '../src/supabase';
import { playCoinSound, playSwordSound } from '../utils/sounds';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  totalItems: number;
  totalPrice: number;
  clearCart: () => void;
  playAddSound: () => void;
  playRemoveSound: () => void;
  loading: boolean;
  discount: number;
  couponCode: string | null;
  applyCoupon: (code: string, percent: number) => void;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState<string | null>(null);

  // Load cart from Supabase when user changes
  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: cartItems, error } = await supabase
            .from('cart_items')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;

          // Transform database items to CartItem format
          const transformedItems: CartItem[] = cartItems.map(item => ({
            id: item.product_id,
            name: item.product_name,
            category: item.product_category,
            scale: item.product_scale,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          }));

          setItems(transformedItems);
        } else {
          // User not logged in, clear cart
          setItems([]);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadCart();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadCart();
    });

    return () => subscription.unsubscribe();
  }, []);

  // Helper function to save to database
  const saveToDatabase = async (userId: string, cartItems: CartItem[]) => {
    try {
      // Clear existing cart items
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);

      // Insert new items
      if (cartItems.length > 0) {
        const itemsToInsert = cartItems.map(item => ({
          user_id: userId,
          product_id: item.id,
          product_name: item.name,
          product_category: item.category,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        }));

        await supabase
          .from('cart_items')
          .insert(itemsToInsert);
      }
    } catch (error) {
      console.error('Error saving cart to database:', error);
    }
  };

  const addToCart = async (product: Product) => {
    playAddSound();
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      let newItems: CartItem[];

      if (existing) {
        newItems = prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...prev, { ...product, quantity: 1 }];
      }

      // Save to database asynchronously
      (async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await saveToDatabase(user.id, newItems);
        }
      })();

      return newItems;
    });
  };

  const removeFromCart = async (productId: string) => {
    playRemoveSound();
    setItems(prev => {
      const newItems = prev.filter(item => item.id !== productId);

      // Save to database asynchronously
      (async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await saveToDatabase(user.id, newItems);
        }
      })();

      return newItems;
    });
  };

  const updateQuantity = async (productId: string, delta: number) => {
    if (delta > 0) playAddSound();
    else playRemoveSound();

    setItems(prev => {
      const newItems = prev.map(item => {
        if (item.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      }).filter(item => item.quantity > 0); // Remove items with quantity 0

      // Save to database asynchronously
      (async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await saveToDatabase(user.id, newItems);
        }
      })();

      return newItems;
    });
  };

  const clearCart = async () => {
    setItems([]);

    // Clear from database
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);
    }
  };

  const playAddSound = () => {
    playCoinSound();
  };

  const playRemoveSound = () => {
    playSwordSound();
  };

  const applyCoupon = (code: string, percent: number) => {
    setCouponCode(code);
    setDiscount(percent);
  };

  const removeCoupon = () => {
    setCouponCode(null);
    setDiscount(0);
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      totalItems,
      totalPrice,
      clearCart,
      playAddSound,
      playRemoveSound,
      loading,
      discount,
      couponCode,
      applyCoupon,
      removeCoupon
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};