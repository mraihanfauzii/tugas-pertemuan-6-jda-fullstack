"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Product } from '@prisma/client';
import Link from "next/link";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useAppDispatch } from '@/redux/hooks';
import { addNotification } from '@/redux/features/notificationSlice';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const { user, isAdmin, isAuthenticated, isLoading: isLoadingUser } = useCurrentUser();
  const userId = user?.id;

  const dispatch = useAppDispatch(); // Inisialisasi dispatch hook

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        setIsLoadingProduct(true);
        try {
          const res = await fetch(`/api/products/${productId}`);
          if (!res.ok) {
            console.error(`Failed to fetch product with ID ${productId}:`, res.statusText);
            if (res.status === 404) {
              router.push("/not-found");
            } else {
                dispatch(addNotification({ message: "Failed to load product. Please try again.", type: "error" }));
            }
            return;
          }
          const responseData = await res.json();
          if (responseData.status === 'success' && responseData.data) {
            setProduct(responseData.data);
          } else {
            throw new Error(responseData.message || "Failed to get product data.");
          }
        } catch (error) {
          console.error("Error fetching product:", error);
          router.push("/not-found");
        } finally {
          setIsLoadingProduct(false);
        }
      };
      fetchProduct();
    }
  }, [productId, router, dispatch]);

  const handleAddToCart = async () => {
    if (!isAuthenticated || !userId) {
      router.push('/auth/signin');
      return;
    }

    if (!product) { // Pastikan produk sudah terload
        dispatch(addNotification({ message: "Product data not available to add to cart.", type: "error" }));
        return;
    }

    try {
        const res = await fetch('/api/cart', { // <--- Panggil API cart POST
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productId: product.id,
                quantity: quantity,
            }),
        });

        const responseData = await res.json();

        if (res.ok && responseData.status === 'success') {
            dispatch(addNotification({ message: `${quantity} ${product.name} added to cart!`, type: "success" }));
            setQuantity(1); // Reset quantity setelah berhasil
        } else {
            dispatch(addNotification({ message: responseData.message || "Failed to add product to cart.", type: "error" }));
        }
    } catch (error) {
        console.error("Error adding to cart:", error);
        dispatch(addNotification({ message: "An unexpected error occurred while adding to cart.", type: "error" }));
    }
  };

  const handleEditProduct = () => {
    if (isAdmin) {
      router.push(`/products?edit=${productId}`);
    }
  };

  if (isLoadingUser || isLoadingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
        <div className="min-h-screen flex items-center justify-center flex-col bg-gray-100">
            <p className="text-xl">Product not found.</p>
            <Link href="/dashboard" className="text-blue-500 hover:underline mt-4">
              ← Back to Products
            </Link>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="md:w-1/2">
          <Image
            src={product.imageUrl || '/default-product.png'}
            alt={product.name}
            width={600}
            height={450}
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
        <div className="md:w-1/2">
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-700 text-lg mb-6">{product.description}</p>
          <p className="text-blue-600 font-extrabold text-3xl mb-6">
            Rp{product.price.toLocaleString('id-ID')}
          </p>

          {isAdmin ? (
            <button
              onClick={handleEditProduct}
              className="bg-yellow-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-yellow-700 transition-colors"
            >
              Edit Product
            </button>
          ) : (
            <>
              <div className="flex items-center mb-6">
                <label htmlFor="quantity" className="mr-4 text-lg font-medium">Quantity:</label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 p-2 border border-gray-300 rounded-md text-center"
                />
              </div>
              <button
                onClick={handleAddToCart}
                className={`${
                  isAuthenticated
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-400 cursor-not-allowed"
                } text-white py-3 px-6 rounded-lg text-lg font-semibold transition-colors`}
                title={isAuthenticated ? "" : "Login to add to cart"}
                disabled={!isAuthenticated}
              >
                Add to Cart
              </button>
            </>
          )}

          <div className="mt-8">
            <Link href="/dashboard" className="text-blue-500 hover:underline">
              ← Back to Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}