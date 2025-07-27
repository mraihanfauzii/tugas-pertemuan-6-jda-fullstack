import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "../provider";
import Link from "next/link";
import HeaderNav from "@/components/HeaderNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My E-commerce App",
  description: "A professional e-commerce application built with Next.js",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <header className="bg-blue-600 text-white p-4 shadow-md">
            <nav className="container mx-auto flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold hover:text-blue-200">
                My E-commerce
              </Link>
              <HeaderNav />
            </nav>
          </header>
          <main className="flex-grow">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}