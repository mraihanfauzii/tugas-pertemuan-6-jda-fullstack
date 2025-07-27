// src/app/api/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db'; // Impor Prisma Client

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ status: 'error', message: 'Name, email, and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ status: 'error', message: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    // Periksa apakah email sudah terdaftar di database
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return NextResponse.json({ status: 'error', message: 'Email already registered' }, { status: 409 });
    }

    // Hash password sebelum disimpan
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru di database
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'user', // Default role
      },
      select: { // Hanya pilih field yang ingin dikembalikan, jangan password
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({ status: 'success', message: 'Registration successful', user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json({ status: 'error', message: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
}