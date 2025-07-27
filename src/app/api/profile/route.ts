import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/authOptions";
import { findUserById, updateUser } from '@prisma/client';

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, email, password } = await req.json();

    if (!name && !email && !password) {
      return NextResponse.json({ message: 'No data provided for update' }, { status: 400 });
    }

    const userId = session.user.id;
    const existingUser = findUserById(userId);

    if (!existingUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const updatedData: { name?: string; email?: string; password?: string } = {};
    if (name !== undefined) updatedData.name = name;
    if (email !== undefined) updatedData.email = email;
    if (password !== undefined) {
      updatedData.password = password;
    }

    const updatedUser = updateUser(userId, updatedData);

    if (updatedUser) {
      const { password: _, ...userWithoutPassword } = updatedUser;
      return NextResponse.json(userWithoutPassword, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Failed to update user' }, { status: 500 });
    }

  } catch (error) {
    console.error("Profile update API error:", error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}