"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [globalMessage, setGlobalMessage] = useState<string | null>(null); // Untuk pesan sukses/error dari backend
  const [isSuccessMessage, setIsSuccessMessage] = useState(false); // Untuk menentukan warna pesan

  // Live validation errors
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const router = useRouter();

  // Validation functions
  const validateName = (name: string) => {
    if (!name.trim()) {
      return "Name is required.";
    }
    return null;
  };

  const validateEmail = (email: string) => {
    if (!email) {
      return "Email is required.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Invalid email format.";
    }
    return null;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return "Password is required.";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    return null;
  };

  // Handlers for input changes and blur events
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    setNameError(validateName(newName));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setEmailError(validateEmail(newEmail));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordError(validatePassword(newPassword));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalMessage(null);

    // Final validation before submission
    const finalNameError = validateName(name);
    const finalEmailError = validateEmail(email);
    const finalPasswordError = validatePassword(password);

    if (finalNameError || finalEmailError || finalPasswordError) {
      setNameError(finalNameError);
      setEmailError(finalEmailError);
      setPasswordError(finalPasswordError);
      setGlobalMessage("Please correct the errors above.");
      setIsSuccessMessage(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        setGlobalMessage("Registration successful! Redirecting to login page...");
        setIsSuccessMessage(true);
        setName("");
        setEmail("");
        setPassword("");
        // Redirect ke halaman login setelah registrasi berhasil
        setTimeout(() => {
          router.push("/auth/signin");
        }, 1500);
      } else {
        const errorData = await res.json();
        setGlobalMessage(errorData.message || "Registration failed.");
        setIsSuccessMessage(false);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setGlobalMessage("An unexpected error occurred during registration.");
      setIsSuccessMessage(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
          Register
        </h2>
        {globalMessage && (
          <div
            className={`p-3 rounded-md mb-4 text-center ${
              isSuccessMessage ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {globalMessage}
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
              className={`mt-1 block w-full px-3 py-2 border ${nameError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              value={name}
              onChange={handleNameChange}
              onBlur={() => setNameError(validateName(name))}
            />
            {nameError && <p className="text-red-500 text-xs italic mt-1">{nameError}</p>}
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
              className={`mt-1 block w-full px-3 py-2 border ${emailError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              value={email}
              onChange={handleEmailChange}
              onBlur={() => setEmailError(validateEmail(email))}
            />
            {emailError && <p className="text-red-500 text-xs italic mt-1">{emailError}</p>}
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className={`mt-1 block w-full px-3 py-2 border ${passwordError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              value={password}
              onChange={handlePasswordChange}
              onBlur={() => setPasswordError(validatePassword(password))}
            />
            {passwordError && <p className="text-red-500 text-xs italic mt-1">{passwordError}</p>}
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Register
            </button>
          </div>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/auth/signin"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}