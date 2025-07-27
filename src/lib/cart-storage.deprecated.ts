// Sudah tidak digunakan karena sudah menggunakan neon - postgre tetapi file tidak dihapus agar 
// dapat digunakan jika ingin mengubahnya kembali menjadi menggunakan penyimpanan local
import { Product } from '@prisma/client';

export interface CartItem extends Product {
  quantity: number;
}

const getCartKey = (userId: string) => `cart_${userId}`;

export const getCart = (userId: string): CartItem[] => {
  if (typeof window === 'undefined' || !userId) return [];
  try {
    const storedCart = localStorage.getItem(getCartKey(userId));
    return storedCart ? JSON.parse(storedCart) : [];
  } catch (error) {
    console.error("Failed to parse cart from localStorage:", error);
    return [];
  }
};

export const saveCart = (userId: string, cart: CartItem[]): void => {
  if (typeof window === 'undefined' || !userId) return;
  try {
    localStorage.setItem(getCartKey(userId), JSON.stringify(cart));
  } catch (error) {
    console.error("Failed to save cart to localStorage:", error);
  }
};

export const clearCart = (userId: string): void => {
  if (typeof window === 'undefined' || !userId) return;
  try {
    localStorage.removeItem(getCartKey(userId));
  } catch (error) {
    console.error("Failed to clear cart from localStorage:", error);
  }
};