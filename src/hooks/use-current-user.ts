"use client";

import { useSession } from "next-auth/react";

export const useCurrentUser = () => {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    isAdmin: session?.user?.role === 'admin',
    isUser: session?.user?.role === 'user',
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isUnauthenticated: status === 'unauthenticated',
  };
};