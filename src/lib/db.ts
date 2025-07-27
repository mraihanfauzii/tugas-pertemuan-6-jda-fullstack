import { PrismaClient } from '@prisma/client';

// Declare a global variable for PrismaClient to prevent multiple instances in development
// This is a common pattern for Next.js to avoid hot-reloading issues
declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;