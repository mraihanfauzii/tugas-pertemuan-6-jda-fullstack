// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/authOptions";
import prisma from '@/lib/db'; // Impor Prisma Client

// GET: Mengambil semua produk (Bisa diakses siapa saja)
export async function GET() {
  try {
    const products = await prisma.product.findMany();
    return NextResponse.json({
      status: 'success',
      message: 'Products fetched successfully',
      data: products
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ status: 'error', message: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
}

// POST: Menambahkan produk baru (Hanya Admin)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({
      status: 'error',
      message: 'Unauthorized. Admin access required.'
    }, { status: 403 });
  }

  try {
    const { name, description, price, imageUrl } = await req.json();

    if (!name || !description || typeof price !== 'number' || price <= 0 || !imageUrl) {
      return NextResponse.json({
        status: 'error',
        message: 'Invalid product data: name, description, price (positive number), imageUrl are required.'
      }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price,
        imageUrl,
      },
    });

    return NextResponse.json({
      status: 'success',
      message: 'Product added successfully',
      data: newProduct
    }, { status: 201 });
  } catch (error) {
    console.error("Error adding product:", error);
    return NextResponse.json({
      status: 'error',
      message: 'Internal server error',
      details: (error as Error).message
    }, { status: 500 });
  }
}