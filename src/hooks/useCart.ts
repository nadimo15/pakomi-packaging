import { useState, useEffect, useCallback } from 'react';
import { getCartItems, addToCart as dbAddToCart, removeFromCart as dbRemoveFromCart, updateCartItemQuantity as dbUpdateCartItemQuantity, clearCart as dbClearCart } from '../db.ts';
import type { CartItem, CustomizationDetails } from '../types.ts';

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>(getCartItems());

  const handleStorageChange = useCallback(() => {
    setCartItems(getCartItems());
  }, []);

  useEffect(() => {
    // Listen for the custom 'storage' event dispatched from db.ts
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for actual storage events from other tabs to sync state
    const syncTabs = (e: StorageEvent) => {
        if (e.key === 'pakomi_cart_v2') { // Ensure it's the correct key
            handleStorageChange();
        }
    };
    window.addEventListener('storage', syncTabs);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage', syncTabs);
    };
  }, [handleStorageChange]);

  const itemCount = cartItems.length;

  // Wrap db functions to provide a consistent API from the hook
  const addToCart = (itemDetails: CustomizationDetails, unitPrice: number, itemWeight: number) => {
    dbAddToCart(itemDetails, unitPrice, itemWeight);
  };

  const removeFromCart = (cartItemId: string) => {
    dbRemoveFromCart(cartItemId);
  };

  const updateCartItemQuantity = (cartItemId: string, newQuantity: number) => {
    dbUpdateCartItemQuantity(cartItemId, newQuantity);
  };
  
  const clearCart = () => {
      dbClearCart();
  };

  return { cartItems, itemCount, addToCart, removeFromCart, updateCartItemQuantity, clearCart };
};
