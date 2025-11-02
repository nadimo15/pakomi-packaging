// This file is now primarily for managing the local shopping cart in localStorage.
// All other data operations are handled by api.ts, which communicates with the backend.
import { CartItem, CustomizationDetails } from './types.ts';

// Re-exporting API functions to minimize breaking changes in components that still import from db.ts
export * from './api.ts';

const CART_KEY = 'pakomi_cart_v2';

// Dispatch a custom event that hooks can listen to, ensuring UI updates on cart changes.
const dispatchStorageEvent = () => window.dispatchEvent(new Event('storage'));

// --- CART (Remains in localStorage) ---
export const getCartItems = (): CartItem[] => {
    try {
        const data = localStorage.getItem(CART_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) { 
        console.error("Failed to parse cart from localStorage", e);
        return []; 
    }
};

const writeCart = (cart: CartItem[]) => {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        dispatchStorageEvent();
    } catch (e) {
        console.error("Failed to write cart to localStorage", e);
    }
};

export const addToCart = (itemDetails: CustomizationDetails, unitPrice: number, itemWeight: number) => {
    const cart = getCartItems();
    const newItem: CartItem = {
        ...itemDetails,
        logoUrl: itemDetails.logoUrl,
        cartItemId: `cart-${Date.now()}`,
        unitPrice,
        itemWeight
    };
    cart.push(newItem);
    writeCart(cart);
};

export const removeFromCart = (cartItemId: string) => {
    let cart = getCartItems();
    cart = cart.filter(item => item.cartItemId !== cartItemId);
    writeCart(cart);
};

export const updateCartItemQuantity = (cartItemId: string, newQuantity: number) => {
    const cart = getCartItems();
    const itemIndex = cart.findIndex(item => item.cartItemId === cartItemId);
    if (itemIndex > -1 && newQuantity > 0) {
        cart[itemIndex].quantity = newQuantity;
        writeCart(cart);
    }
};

export const clearCart = () => {
    writeCart([]);
};

// initializeDb is no longer needed as the backend handles data initialization.
export const initializeDb = () => {
  // This function is now obsolete but is kept to avoid breaking old imports.
  // The backend database is seeded and managed by Prisma.
};
