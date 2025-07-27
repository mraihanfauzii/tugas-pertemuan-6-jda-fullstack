"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@prisma/client";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const res = await fetch("/api/products");
        if (!res.ok) {
          console.error("Failed to fetch products:", res.statusText);
          setProducts([]);
          return;
        }
        const responseData = await res.json();
        if (responseData.status === 'success' && Array.isArray(responseData.data)) {
            setProducts(responseData.data);
        } else {
            console.error("API response for products was not as expected:", responseData);
            setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    if (status === "authenticated") {
        fetchProducts();
    }
  }, [status]);

  if (status === "loading" || isLoadingProducts) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl">Loading dashboard and products...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="bg-white p-8 rounded-lg shadow-md mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to Your Dashboard!</h1>
        {session && (
          <p className="text-lg">Hello, {session.user?.name || session.user?.email}!</p>
        )}
        <p className="mt-2 text-gray-600">Explore our products below.</p>
      </div>

      <h2 className="text-4xl font-bold text-center mb-10">Our Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.length === 0 && !isLoadingProducts ? (
            <p className="col-span-full text-center text-gray-600 text-lg">No products found. Add some as an Admin!</p>
        ) : (
            products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden transform transition-transform hover:scale-105">
                <Link href={`/products/${product.id}`}>
                  <Image
                    src={product.imageUrl || '/default-product.png'}
                    alt={product.name}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover"
                  />
                </Link>
                <div className="p-5">
                  <h3 className="text-xl font-semibold mb-2">
                    <Link href={`/products/${product.id}`} className="hover:text-blue-600">
                      {product.name}
                    </Link>
                  </h3>
                  <p className="text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                  <p className="text-blue-600 font-bold text-lg">
                    Rp{product.price.toLocaleString('id-ID')}
                  </p>
                  <Link href={`/products/${product.id}`} className="mt-4 block text-center bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors">
                    View Details
                  </Link>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}