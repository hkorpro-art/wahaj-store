"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import type { CartItem, Product } from "@/lib/types";

type CartContextType = {
  cart: Record<string, CartItem>;
  cartItems: CartItem[];
  cartTotal: number;
  cartCount: number;
  addToCart: (product: Product) => void;
  updateQuantity: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
};

const CART_STORAGE_KEY = "wahaj_cart";

const CartContext = createContext<CartContextType | null>(null);

function loadCart(): Record<string, CartItem> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      const saved = loadCart();
      if (Object.keys(saved).length > 0) {
        setCart(saved);
      }
    } else {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      } catch {
        // storage full or unavailable
      }
    }
  }, [cart]);

  const addToCart = useCallback((product: Product) => {
    setCart((current) => {
      const item = current[product.id];
      return {
        ...current,
        [product.id]: {
          product,
          quantity: item ? item.quantity + 1 : 1,
        },
      };
    });
  }, []);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart((current) => {
      const item = current[productId];
      if (!item) return current;
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        const { [productId]: _, ...rest } = current;
        return rest;
      }
      return { ...current, [productId]: { ...item, quantity: newQty } };
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((current) => {
      const { [productId]: _, ...rest } = current;
      return rest;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart({});
  }, []);

  const cartItems = Object.values(cart);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, cartItems, cartTotal, cartCount, addToCart, updateQuantity, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
