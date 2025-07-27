// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/authOptions";
import prisma from '@/lib/db'; // Impor Prisma Client

// GET: Mengambil satu produk berdasarkan ID (Bisa diakses siapa saja)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: id },
    });

    if (!product) {
      return NextResponse.json({
        status: 'error',
        message: 'Product not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      status: 'success',
      message: 'Product fetched successfully',
      data: product
    }, { status: 200 });
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return NextResponse.json({ status: 'error', message: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
}

// PUT: Mengupdate produk berdasarkan ID (Hanya Admin)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({
      status: 'error',
      message: 'Unauthorized. Admin access required.'
    }, { status: 403 });
  }

  const { id } = params;
  try {
    const updatedData = await req.json();

    if (Object.keys(updatedData).length === 0) {
      return NextResponse.json({
        status: 'error',
        message: 'No data provided for update'
      }, { status: 400 });
    }
    if (updatedData.price !== undefined && (typeof updatedData.price !== 'number' || updatedData.price <= 0)) {
        return NextResponse.json({
          status: 'error',
          message: 'Price must be a positive number'
        }, { status: 400 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: id },
      data: updatedData,
    });

    if (!updatedProduct) { // Ini mungkin tidak akan null jika where match, tapi tetap baik untuk error handling
      return NextResponse.json({
        status: 'error',
        message: 'Product not found or failed to update'
      }, { status: 404 });
    }

    return NextResponse.json({
      status: 'success',
      message: 'Product updated successfully',
      data: updatedProduct
    }, { status: 200 });
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    return NextResponse.json({
      status: 'error',
      message: 'Internal server error',
      details: (error as Error).message
    }, { status: 500 });
  }
}

// DELETE: Menghapus produk berdasarkan ID (Hanya Admin)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({
      status: 'error',
      message: 'Unauthorized. Admin access required.'
    }, { status: 403 });
  }

  const { id } = params;
  try {
    await prisma.product.delete({
      where: { id: id },
    });
    return NextResponse.json({
      status: 'success',
      message: 'Product deleted successfully'
    }, { status: 200 });
  } catch (error) {
    // Prisma akan melempar error jika ID tidak ditemukan (P2025)
    if ((error as any).code === 'P2025') {
        return NextResponse.json({ status: 'error', message: 'Product not found' }, { status: 404 });
    }
    console.error(`Error deleting product ${id}:`, error);
    return NextResponse.json({ status: 'error', message: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
}