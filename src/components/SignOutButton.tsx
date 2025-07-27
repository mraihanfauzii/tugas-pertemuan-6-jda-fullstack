"use client";

import { signOut } from "next-auth/react";
import React from "react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/auth/signin" })}
      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm"
    >
      Sign Out
    </button>
  );
}