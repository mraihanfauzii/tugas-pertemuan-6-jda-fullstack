// Sudah tidak digunakan karena sudah menggunakan neon - postgre tetapi file tidak dihapus agar 
// dapat digunakan jika ingin mengubahnya kembali menjadi menggunakan penyimpanan local
import bcrypt from 'bcryptjs';

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

// Data mock disimpan di memori, akan reset jika server restart
let nextUserId = 1;
export let mockUsers: User[] = [
  // User default untuk testing
  { id: String(nextUserId++), name: "Admin User", email: "admin@example.com", password: "adminpassword", role: 'admin' },
  { id: String(nextUserId++), name: "Regular User", email: "user@example.com", password: "password123", role: 'user' },
];

// Hash password awal saat aplikasi pertama kali berjalan
(async () => {
  for (const user of mockUsers) {
    if (user.password && !user.password.startsWith('$2a$')) {
      user.password = await bcrypt.hash(user.password, 10);
      console.log(`✅ Initial password for ${user.email} hashed.`);
    }
  }
})();

let nextProductId = 1;
export let mockProducts: Product[] = [
  // ... data produk Anda tidak perlu diubah, sudah bagus ...
  { id: String(nextProductId++), name: "DJI Flip", description: "DJI Flip - Camera Drone | Foldable Full-Coverage Propeller Guard | Under 249 g | 4K/60fps HDR Video - RC-N3.", price: 6000000, imageUrl: "/dji-flip.jpg" },
  { id: String(nextProductId++), name: "DJI Osmo Pocket 3", description: "Sensor : 1-inch CMOS, Layar : 2 inch OLED touchscreen, Resolusi Video Low-Light Video : 4K (16:9): 3840×2160@24/25/30fps - 1080p: 1920×1080@24/25/30fps.", price: 8000000, imageUrl: "/dji-osmo-pocket-3.png" },
  { id: String(nextProductId++), name: "Samsung Galaxy S24", description: "Samsung Galaxy S24 Basic, Processor : Exynos2400 for Galaxy, Size : 6,2 inch, Technology : Dynamic AMOLED 2X, 1-120Hz, Resolution : FHD+ (2340 X 1080), Rear Camera Resolution : 50 MP + 12 MP + 10 MP.", price: 9399000, imageUrl: "/samsung-s-24.jpg" },
  { id: String(nextProductId++), name: "Samsung Galaxy Tab 10 FE", description: "Samsung Galaxy Tab S10 FE adalah tablet AI terbaru dari Samsung yang menggabungkan performa handal, desain modern, dan fitur pintar untuk mendukung berbagai kebutuhan digital Anda. Ditenagai oleh prosesor Exynos 1580 dan dipadukan dengan RAM 8GB, tablet ini mampu memberikan kinerja yang mulus untuk berbagai aktivitas, mulai dari multitasking hingga hiburan. Dengan kapasitas penyimpanan internal 128GB, pengguna memiliki ruang yang cukup untuk menyimpan dokumen, aplikasi, dan media favorit mereka.", price: 8649000, imageUrl: "/samsung-tab-10-fe.jpg" },
];


// --- FUNGSI HELPER USER ---

export const getNextUserId = (): string => String(nextUserId++);
export const findUserByEmail = (email: string): User | undefined => mockUsers.find(user => user.email === email);
export const findUserById = (id: string): User | undefined => mockUsers.find(user => user.id === id);

export function addUser(newUser: Omit<User, 'id' | 'role'> & { password: string }): User {
  const userToAdd: User = {
    id: getNextUserId(),
    name: newUser.name,
    email: newUser.email,
    password: newUser.password, // Password sudah di-hash dari API
    role: 'user',
  };
  mockUsers.push(userToAdd);
  return userToAdd;
}
export function updateUser(id: string, updatedData: Partial<Omit<User, 'id' | 'role'>>): User | null {
  const userIndex = mockUsers.findIndex(user => user.id === id);
  if (userIndex === -1) {
    return null; // User tidak ditemukan
  }
  
  const updatedUser = {
    ...mockUsers[userIndex], // Salin semua properti lama
    ...updatedData,          // Timpa dengan properti baru
  };

  mockUsers[userIndex] = updatedUser;
  return updatedUser; // Mengembalikan objek yang sudah diperbarui
}

export async function comparePassword(plainPassword: string, hashedPassword?: string): Promise<boolean> {
  if (!hashedPassword) return false;
  return bcrypt.compare(plainPassword, hashedPassword);
}


// --- FUNGSI HELPER PRODUK ---

export const getAllProducts = (): Product[] => mockProducts;
export const findProductById = (id: string): Product | undefined => mockProducts.find(product => product.id === id);

export const addProduct = (product: Omit<Product, 'id'>): Product => {
  const newProduct: Product = {
    id: String(nextProductId++),
    ...product
  };
  mockProducts.push(newProduct);
  return newProduct;
};

export const updateProduct = (id: string, updatedData: Partial<Product>): Product | undefined => {
  const productIndex = mockProducts.findIndex(product => product.id === id);
  if (productIndex > -1) {
    mockProducts[productIndex] = { ...mockProducts[productIndex], ...updatedData };
    return mockProducts[productIndex];
  }
  return undefined;
};

export const deleteProduct = (id: string): boolean => {
  const index = mockProducts.findIndex(product => product.id === id);
  if (index > -1) {
    mockProducts.splice(index, 1); // Hapus 1 item pada index yang ditemukan
    return true;
  }
  return false; // Produk tidak ditemukan
};