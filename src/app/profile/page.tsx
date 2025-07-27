"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, status, update } = useSession(); // Dapatkan fungsi 'update'
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sinkronisasi state form dengan data sesi saat komponen dimuat
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
    }
  }, [session]);

  // Redirect jika tidak terautentikasi
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    if (password && password !== confirmPassword) {
      setMessage("New password and confirm password do not match!");
      setIsError(true);
      setIsLoading(false);
      return;
    }

    try {
      // Siapkan payload hanya dengan data yang berubah
      const updatedData: { name?: string; email?: string; password?: string } = {};
      if (name !== session?.user?.name) updatedData.name = name;
      if (email !== session?.user?.email) updatedData.email = email;
      if (password) updatedData.password = password;

      if (Object.keys(updatedData).length === 0) {
        setMessage("No changes to update.");
        setIsError(false);
        setIsLoading(false);
        return;
      }
      
      const res = await fetch(`/api/user`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      const responseData = await res.json();

      if (res.ok) {
        await update({
          ...session,
          user: {
            ...session?.user,
            name: responseData.name,
            email: responseData.email,
          },
        });

        setMessage("Profile updated successfully!");
        setIsError(false);
        setPassword(""); // Reset password field
        setConfirmPassword("");
      } else {
        setMessage(responseData.message || "Failed to update profile.");
        setIsError(true);
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setMessage("An unexpected error occurred.");
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading profile...</p>
      </div>
    );
  }

  // Jika tidak terautentikasi setelah loading selesai (sudah di-redirect oleh useEffect)
  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
          User Profile
        </h2>
        {message && (
          <div
            className={`p-3 rounded-md mb-4 text-center ${
              isError ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
            }`}
          >
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              New Password (leave blank to keep current)
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {isLoading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
        <div className="mt-6 text-center">
            <Link href="/dashboard" className="text-blue-500 hover:underline">
              ← Back to Dashboard
            </Link>
          </div>
      </div>
    </div>
  );
}