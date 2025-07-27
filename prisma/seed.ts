import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // --- Hashing Passwords for Default Users ---
  const adminPassword = await bcrypt.hash('adminpassword', 10);
  const userPassword = await bcrypt.hash('password123', 10);

  // --- Create Default Users ---
  // Hapus user yang mungkin sudah ada agar tidak duplikat email
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['admin@example.com', 'user@example.com'],
      },
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
    },
  });
  console.log(`Created admin user with ID: ${adminUser.id}`);

  const regularUser = await prisma.user.create({
    data: {
      name: 'Regular User',
      email: 'user@example.com',
      password: userPassword,
      role: 'user',
    },
  });
  console.log(`Created regular user with ID: ${regularUser.id}`);

  // --- Create Default Products ---
  // Hapus semua produk yang ada untuk menghindari duplikasi saat seeding
  await prisma.product.deleteMany({});

  const products = [
    { name: "DJI Mini 4 Pro", description: "Drone kamera mini yang ringkas namun bertenaga dengan kamera 4K/60fps HDR dan deteksi rintangan omnidirectional. Ideal untuk pemula dan profesional.", price: 9900000, imageUrl: "/dji-mini-4-pro.jpg" },
    { name: "Sony Alpha a7 III", description: "Kamera mirrorless full-frame dengan sensor 24.2MP, stabilisasi gambar 5-axis, dan perekaman video 4K. Cocok untuk fotografi dan videografi profesional.", price: 25000000, imageUrl: "/sony-a7iii.jpg" },
    { name: "Logitech MX Master 3S", description: "Mouse ergonomis canggih dengan presisi tinggi dan scroll wheel MagSpeed. Dirancang untuk para profesional kreatif dan programmer.", price: 1500000, imageUrl: "/logitech-mx-master-3s.jpg" },
    { name: "Apple MacBook Air M3", description: "Laptop tipis dan ringan dengan chip Apple M3 yang super cepat, layar Liquid Retina yang memukau, dan daya tahan baterai hingga 18 jam.", price: 18000000, imageUrl: "/macbook-air-m3.jpg" },
    { name: "Samsung Galaxy S24 Ultra", description: "Smartphone flagship dengan kamera 200MP, S Pen terintegrasi, dan kekuatan Galaxy AI. Desain premium dengan Titanium Frame.", price: 21999000, imageUrl: "/samsung-s24-ultra.jpg" },
    { name: "GoPro HERO12 Black", description: "Kamera aksi dengan kualitas video 5.3K60, stabilisasi HyperSmooth 6.0, dan daya tahan baterai yang ditingkatkan. Tahan air hingga 10m.", price: 6500000, imageUrl: "/gopro-hero12.jpg" },
    { name: "Dell XPS 15", description: "Laptop premium dengan layar InfinityEdge 15.6 inci, performa tinggi untuk pekerjaan kreatif, dan desain yang elegan.", price: 23000000, imageUrl: "/dell-xps-15.jpg" },
    { name: "Canon EOS R6 Mark II", description: "Kamera mirrorless full-frame dengan kecepatan tinggi, autofokus canggih, dan kemampuan video yang luar biasa. Ideal untuk fotografer dan videografer profesional.", price: 38000000, imageUrl: "/canon-r6-mk2.jpg" },
    { name: "DJI Mavic 3 Classic", description: "Drone profesional dengan kamera Hasselblad 4/3 CMOS, jangkauan transmisi yang luas, dan deteksi rintangan omnidirectional. Menghasilkan gambar yang menakjubkan.", price: 27000000, imageUrl: "/dji-mavic-3-classic.jpg" },
    { name: "LG C3 OLED TV 65-inch", description: "Smart TV OLED dengan kualitas gambar hitam sempurna, prosesor AI a9 Gen6, dan fitur gaming canggih. Pengalaman hiburan yang imersif.", price: 28000000, imageUrl: "/lg-c3-oled.jpg" },
    { name: "HyperX QuadCast S", description: "Mikrofon gaming USB serbaguna dengan empat pola polar yang dapat dipilih, pencahayaan RGB yang dinamis, dan filter pop bawaan. Sempurna untuk streaming dan podcasting.", price: 1800000, imageUrl: "/hyperx-quadcast-s.jpg" },
    { name: "Bose QuietComfort Earbuds II", description: "Earbud nirkabel dengan teknologi pembatalan bising terbaik di kelasnya, suara imersif, dan desain yang nyaman. Cocok untuk mendengarkan musik dan panggilan telepon.", price: 3900000, imageUrl: "/bose-qc-earbuds-ii.jpg" }
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
    console.log(`Created product: ${product.name}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });