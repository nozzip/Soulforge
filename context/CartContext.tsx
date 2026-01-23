import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product, CartItem } from '../types';
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([
    // Pre-populate with some data as seen in the mockup for "Review Your Loot"
    {
      id: '1',
      name: "Ancient Cinder Wyrm",
      category: "D&D",
      scale: "Colossal",
      price: 85.00,
      quantity: 1,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOt5aQZidteyosgKEH6adeFrjY70HvrEfGe899g00U3xAIYG56c8fgeqBKxO8l7H88pIM9fvKCjOFj31ZRGXSNJMm0amjBByouYk2tQS9cJlO5tRXVypnfYTl4GOedXMMTeHteiT4YEek0yhThUIU-I3adq46F_jGdWXWA81N4fXwHAGu-qCKql3q3IOj_6RX7xJ3VDGhUy-IG7TOmabJh_2bG_B3XyQLiG6dKr1cd6iFYDBbZoCfADZlGEJy_eQT0j1kbKsuRM9c"
    },
    {
      id: '4',
      name: "Oathbreaker Vanguard",
      category: "D&D",
      scale: "Medium",
      price: 44.00,
      quantity: 2,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB3o4U20eQujlqlLivp6dfCAP5GGzSX_QIVGCsZjAW44J4Cn5dH3fh--dQTkyhXBkrF8FhFqEkEYr9RQT-DUD067sGwueG54R6I2D9AWpl0SZeHcNNNBlpw-hJcGf44E_evb6KJAvH1iUIbN3XlyqFqu1eAkxpckNTqSho97MfodGIWlijVtftnohk4UDHDDFQLMabvPPyGlPuNecTztgQfAeFoes10LMhaiBmRzvnS1bSmrAv4HZDh04MXIr9oLJX0zf3HFw_Us5E"
    }
  ]);

  const addToCart = (product: Product) => {
    playAddSound();
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    playRemoveSound();
    setItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    if (delta > 0) playAddSound();
    else playRemoveSound();

    setItems(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const clearCart = () => {
    setItems([]);
  };

  const playAddSound = () => {
    playCoinSound();
  };

  const playRemoveSound = () => {
    playSwordSound();
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, totalItems, totalPrice, clearCart, playAddSound, playRemoveSound }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};