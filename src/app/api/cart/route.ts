import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/db';

// GET: Mengambil semua item di keranjang user yang sedang login
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: userId },
      include: { // Sertakan detail produk
        product: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Format ulang data agar lebih mudah digunakan di frontend
    const formattedCart = cartItems.map(item => ({
      id: item.productId, // ID produk
      cartItemId: item.id, // ID item keranjang di database
      name: item.product.name,
      description: item.product.description || '',
      price: item.product.price,
      imageUrl: item.product.imageUrl || '/default-product.png',
      quantity: item.quantity,
    }));

    return NextResponse.json({ status: 'success', message: 'Cart fetched successfully', data: formattedCart }, { status: 200 });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ status: 'error', message: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
}

// POST: Menambahkan produk ke keranjang atau memperbarui kuantitas
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { productId, quantity } = await req.json();
    const userId = session.user.id;

    if (!productId || typeof quantity !== 'number' || quantity <= 0) {
      return NextResponse.json({ status: 'error', message: 'Invalid product ID or quantity' }, { status: 400 });
    }

    // Cek apakah produk ada
    const productExists = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!productExists) {
      return NextResponse.json({ status: 'error', message: 'Product not found' }, { status: 404 });
    }

    // Cari item keranjang yang sudah ada untuk user dan produk ini
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: { // Menggunakan unique constraint
          userId: userId,
          productId: productId,
        },
      },
    });

    let updatedCartItem;
    if (existingCartItem) {
      // Jika item sudah ada, update kuantitasnya
      updatedCartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
      });
    } else {
      // Jika item belum ada, buat yang baru
      updatedCartItem = await prisma.cartItem.create({
        data: {
          userId: userId,
          productId: productId,
          quantity: quantity,
        },
      });
    }

    return NextResponse.json({ status: 'success', message: 'Product added to cart', data: updatedCartItem }, { status: 200 });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json({ status: 'error', message: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
}

// PUT: Memperbarui kuantitas item di keranjang
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { cartItemId, quantity } = await req.json(); // cartItemId adalah ID dari entri CartItem di DB
    const userId = session.user.id;

    if (!cartItemId || typeof quantity !== 'number' || quantity < 0) {
      return NextResponse.json({ status: 'error', message: 'Invalid cart item ID or quantity' }, { status: 400 });
    }

    if (quantity === 0) {
      // Jika kuantitas 0, hapus item dari keranjang
      await prisma.cartItem.deleteMany({ // deleteMany untuk memastikan user yang benar
        where: { id: cartItemId, userId: userId },
      });
      return NextResponse.json({ status: 'success', message: 'Cart item removed' }, { status: 200 });
    } else {
      // Update kuantitas
      const updatedItem = await prisma.cartItem.updateMany({ // updateMany untuk memastikan user yang benar
        where: { id: cartItemId, userId: userId },
        data: { quantity: quantity },
      });

      if (updatedItem.count === 0) {
        return NextResponse.json({ status: 'error', message: 'Cart item not found or not owned by user' }, { status: 404 });
      }

      return NextResponse.json({ status: 'success', message: 'Cart item quantity updated' }, { status: 200 });
    }
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    return NextResponse.json({ status: 'error', message: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
}

// DELETE: Menghapus item dari keranjang (berdasarkan cartItemId) atau mengosongkan seluruh keranjang
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    const { cartItemId, clearAll } = await req.json(); // Bisa menghapus satu item atau semua

    if (clearAll) {
      // Hapus semua item keranjang untuk user ini
      await prisma.cartItem.deleteMany({
        where: { userId: userId },
      });
      return NextResponse.json({ status: 'success', message: 'Cart cleared successfully' }, { status: 200 });
    } else if (cartItemId) {
      // Hapus item keranjang tertentu
      const deletedItem = await prisma.cartItem.deleteMany({ // deleteMany untuk memastikan user yang benar
        where: { id: cartItemId, userId: userId },
      });

      if (deletedItem.count === 0) {
        return NextResponse.json({ status: 'error', message: 'Cart item not found or not owned by user' }, { status: 404 });
      }
      return NextResponse.json({ status: 'success', message: 'Cart item removed successfully' }, { status: 200 });
    } else {
      return NextResponse.json({ status: 'error', message: 'Invalid request: provide cartItemId or set clearAll to true' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error deleting cart item(s):', error);
    return NextResponse.json({ status: 'error', message: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
}