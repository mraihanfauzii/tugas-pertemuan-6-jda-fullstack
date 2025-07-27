// src/app/api/user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db'; // Impor Prisma Client

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, email, password } = await req.json();
    const userId = session.user.id;

    const updatedData: { name?: string; email?: string; password?: string } = {};
    if (name !== undefined) updatedData.name = name;
    if (email !== undefined) updatedData.email = email;

    if (password !== undefined) {
      if (password.length < 8) {
          return NextResponse.json({ status: 'error', message: 'New password must be at least 8 characters long' }, { status: 400 });
      }
      updatedData.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updatedData).length === 0) {
        return NextResponse.json({ status: 'info', message: 'No data provided for update' }, { status: 200 });
    }

    // Update user di database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updatedData,
      select: { // Hanya pilih field yang ingin dikembalikan
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!updatedUser) {
      return NextResponse.json({ status: 'error', message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ status: 'success', message: 'Profile updated successfully!', user: updatedUser }, { status: 200 });

  } catch (error) {
    console.error("Profile update API error:", error);
    return NextResponse.json({ status: 'error', message: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
}