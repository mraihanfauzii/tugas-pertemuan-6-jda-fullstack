import NextAuth from "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: 'user' | 'admin';
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role?: 'user' | 'admin';
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: 'user' | 'admin';
  }
}