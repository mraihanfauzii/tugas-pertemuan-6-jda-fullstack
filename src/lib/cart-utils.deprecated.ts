// Sudah tidak digunakan karena sudah menggunakan neon - postgre tetapi file tidak dihapus agar 
// dapat digunakan jika ingin mengubahnya kembali menjadi menggunakan penyimpanan local
import { Product } from '@prisma/client';

export interface CartItem extends Product {
  quantity: number;
}

const CART_STORAGE_KEY = 'ecommerce_cart';

export const getCart = (): CartItem[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  const cartJson = localStorage.getItem(CART_STORAGE_KEY);
  return cartJson ? JSON.parse(cartJson) : [];
};

export const saveCart = (cart: CartItem[]): void => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
};

export const addToCart = (product: Product, quantity: number = 1): CartItem[] => {
  const cart = getCart();
  const existingItemIndex = cart.findIndex(item => item.id === product.id);

  if (existingItemIndex > -1) {
    // Jika produk sudah ada, tambahkan kuantitasnya
    cart[existingItemIndex].quantity += quantity;
  } else {
    // Jika produk belum ada, tambahkan sebagai item baru
    cart.push({ ...product, quantity });
  }
  saveCart(cart);
  return cart;
};

export const removeFromCart = (productId: string): CartItem[] => {
  const cart = getCart();
  const updatedCart = cart.filter(item => item.id !== productId);
  saveCart(updatedCart);
  return updatedCart;
};

export const updateCartItemQuantity = (productId: string, quantity: number): CartItem[] => {
  const cart = getCart();
  const itemIndex = cart.findIndex(item => item.id === productId);

  if (itemIndex > -1) {
    if (quantity <= 0) {
      // Hapus item jika kuantitasnya 0 atau kurang
      cart.splice(itemIndex, 1);
    } else {
      cart[itemIndex].quantity = quantity;
    }
    saveCart(cart);
  }
  return cart;
};

export const clearCart = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(CART_STORAGE_KEY);
};