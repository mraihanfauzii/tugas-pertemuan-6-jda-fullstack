import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import { User as PrismaUser } from '@prisma/client';

// Extend the NextAuth User type to include 'role'
declare module "next-auth" {
  interface User extends PrismaUser {}
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        // Cari user di database menggunakan Prisma
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null; // User not found
        }

        // Bandingkan password yang diberikan dengan hash yang tersimpan
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null; // Invalid password
        }

        // Pastikan role disertakan dalam objek user yang dikembalikan
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        } as PrismaUser; // Cast to PrismaUser type
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as PrismaUser).role; // Tambahkan role ke JWT token
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'user' | 'admin'; // Tambahkan role ke session user
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.AUTH_SECRET,
};