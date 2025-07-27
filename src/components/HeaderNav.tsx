"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import SignOutButton from "@/components/SignOutButton";

export default function HeaderNav() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === 'admin';

  if (status === "loading") {
    return (
      <ul className="flex space-x-6 items-center">
        <li><div className="h-6 w-20 bg-blue-700 rounded animate-pulse"></div></li>
        <li><div className="h-6 w-24 bg-blue-700 rounded animate-pulse"></div></li>
      </ul>
    );
  }

  return (
    <ul className="flex space-x-6 items-center">
      {session ? (
        <>
          <li>
            <Link href="/dashboard" className="hover:text-blue-200">
              Dashboard
            </Link>
          </li>
          {isAdmin && (
            <li>
              <Link href="/products" className="hover:text-blue-200">
                Manage Products
              </Link>
            </li>
          )}
          <li>
            <Link href="/profile" className="hover:text-blue-200">
              Profile
            </Link>
          </li>
          {!isAdmin && (
            <li>
              <Link href="/cart" className="hover:text-blue-200">
                Cart
              </Link>
            </li>
          )}
          <li>
            <SignOutButton />
          </li>
        </>
      ) : (
        <>
          <li>
            <Link href="/auth/signin" className="hover:text-blue-200">
              Sign In
            </Link>
          </li>
          <li>
            <Link href="/auth/register" className="hover:text-blue-200">
              Register
            </Link>
          </li>
        </>
      )}
    </ul>
  );
}