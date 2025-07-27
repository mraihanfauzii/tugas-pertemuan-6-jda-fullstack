import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    const { pathname, searchParams } = req.nextUrl;
    const token = req.nextauth.token;

    // Redirect dari root '/'
    if (pathname === "/") {
      if (token) {
        // Jika sudah login, arahkan ke dashboard
        return NextResponse.redirect(new URL("/dashboard", req.url));
      } else {
        // Jika belum login, arahkan ke halaman login
        return NextResponse.redirect(new URL("/auth/signin", req.url));
      }
    }

    // Melindungi halaman dashboard
    if (pathname.startsWith("/dashboard")) {
      if (!token) {
        // Jika belum login, arahkan ke halaman login
        const url = new URL("/auth/signin", req.url);
        url.searchParams.set("callbackUrl", pathname + searchParams.toString());
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({  }) => {
        return true;
      },
    },
    // Pastikan Anda telah menetapkan secret di .env.local
    // secret: process.env.AUTH_SECRET, // tidak perlu lagi disini karena withAuth sudah secara internal mengambilnya
  }
);

// Konfigurasi matcher untuk middleware
export const config = {
  matcher: [
    "/", // Untuk root path
    "/dashboard/:path*", // Melindungi semua path di bawah /dashboard
    "/auth/signin", // Mengizinkan middleware untuk juga memeriksa halaman signin (untuk mencegah redirect loop)
  ],
};