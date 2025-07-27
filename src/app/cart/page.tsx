"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface CartItemDisplay {
  id: string; // Ini adalah productId
  cartItemId: string; // Ini adalah ID dari entri CartItem di database
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItemDisplay[]>([]);
  const [isLoadingCart, setIsLoadingCart] = useState(true); // State loading untuk keranjang
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const userId = session?.user?.id;

  // Fungsi untuk mengambil keranjang dari API
  const fetchCart = useCallback(async () => {
    if (!userId) {
      setIsLoadingCart(false);
      return;
    }
    setIsLoadingCart(true);
    setMessage(null);
    setIsError(false);
    try {
      const res = await fetch('/api/cart'); // Panggil API GET /api/cart
      const responseData = await res.json();

      if (res.ok && responseData.status === 'success') {
        setCartItems(responseData.data);
      } else {
        setMessage(responseData.message || "Failed to load cart.");
        setIsError(true);
        setCartItems([]);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setMessage("An unexpected error occurred while loading cart.");
      setIsError(true);
      setCartItems([]);
    } finally {
      setIsLoadingCart(false);
    }
  }, [userId]); // userId sebagai dependency

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin"); // Redirect jika belum login
      return;
    }
    if (status === "authenticated" && userId) {
      fetchCart(); // Muat keranjang dari API
    }
  }, [status, router, userId, fetchCart]); // fetchCart sebagai dependency

  if (status === "loading" || isLoadingCart) { // Gabungkan loading state
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl font-semibold">Loading cart...</div>
      </div>
    );
  }

  if (status === "unauthenticated" || !userId) {
    return null; // Atau tampilkan pesan "Please login to view your cart"
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleQuantityChange = async (cartItemId: string, newQuantity: number) => {
    setMessage(null);
    setIsError(false);

    if (newQuantity < 0) return; // Jangan izinkan kuantitas negatif

    try {
      const res = await fetch('/api/cart', { // <--- Panggil API PUT /api/cart
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cartItemId, quantity: newQuantity }),
      });

      const responseData = await res.json();

      if (res.ok && responseData.status === 'success') {
        fetchCart(); // Refresh keranjang setelah update
        setMessage("Cart updated successfully!");
        setIsError(false);
      } else {
        setMessage(responseData.message || "Failed to update cart quantity.");
        setIsError(true);
      }
    } catch (error) {
      console.error("Error updating cart quantity:", error);
      setMessage("An unexpected error occurred while updating cart quantity.");
      setIsError(true);
    } finally {
        setTimeout(() => {
            setMessage(null);
            setIsError(false);
        }, 3000);
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    setMessage(null);
    setIsError(false);
    if (!confirm("Are you sure you want to remove this item from your cart?")) {
      return;
    }

    try {
      const res = await fetch('/api/cart', { // <--- Panggil API DELETE /api/cart
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cartItemId }), // Kirim cartItemId
      });

      const responseData = await res.json();

      if (res.ok && responseData.status === 'success') {
        fetchCart(); // Refresh keranjang setelah menghapus
        setMessage("Item removed from cart!");
        setIsError(false);
      } else {
        setMessage(responseData.message || "Failed to remove item from cart.");
        setIsError(true);
      }
    } catch (error) {
      console.error("Error removing item:", error);
      setMessage("An unexpected error occurred while removing item.");
      setIsError(true);
    } finally {
        setTimeout(() => {
            setMessage(null);
            setIsError(false);
        }, 3000);
    }
  };

  const handleCheckout = async () => {
    setMessage(null);
    setIsError(false);
    if (!confirm("Proceeding to checkout! (This is a mock checkout). Do you want to clear your cart?")) {
      return;
    }

    try {
        const res = await fetch('/api/cart', { // <--- Panggil API DELETE /api/cart untuk clear all
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ clearAll: true }), // Kirim clearAll: true
        });

        const responseData = await res.json();

        if (res.ok && responseData.status === 'success') {
            setMessage("Checkout successful! Your cart has been cleared.");
            setIsError(false);
            setCartItems([]); // Kosongkan tampilan keranjang
            router.push("/dashboard");
        } else {
            setMessage(responseData.message || "Failed to proceed to checkout and clear cart.");
            setIsError(true);
        }
    } catch (error) {
        console.error("Error during checkout:", error);
        setMessage("An unexpected error occurred during checkout.");
        setIsError(true);
    } finally {
        setTimeout(() => {
            setMessage(null);
            setIsError(false);
        }, 3000);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>
      {message && (
        <p className={`mb-4 font-medium ${isError ? "text-red-600" : "text-green-600"}`}>{message}</p>
      )}
      {cartItems.length === 0 ? (
        <p className="text-gray-600">Your cart is empty.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Product</th>
                  <th className="py-3 px-6 text-center">Price</th>
                  <th className="py-3 px-6 text-center">Quantity</th>
                  <th className="py-3 px-6 text-center">Total</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm font-light">
                {cartItems.map((item) => (
                  <tr key={item.cartItemId} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      <div className="flex items-center">
                        <img src={item.imageUrl || '/default-product.png'} alt={item.name} className="w-16 h-16 object-cover rounded-md mr-4" />
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-center">Rp {item.price.toLocaleString('id-ID')}</td>
                    <td className="py-3 px-6 text-center">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.cartItemId, parseInt(e.target.value))}
                        className="w-16 text-center border rounded-md py-1"
                      />
                    </td>
                    <td className="py-3 px-6 text-center">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</td>
                    <td className="py-3 px-6 text-center">
                      <button
                        onClick={() => handleRemoveItem(item.cartItemId)}
                        className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-8 flex justify-end items-center">
            <div className="text-right">
              <p className="text-xl font-bold text-gray-800">Total: Rp {calculateTotal().toLocaleString('id-ID')}</p>
              <button
                onClick={handleCheckout}
                className="mt-4 bg-green-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition duration-300"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}