import { prisma } from '@/utils/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET: 特定のBookを取得
export async function GET(
  request: NextRequest,
  context: { params: { googleId: string } }
) {
  const { googleId } = context.params;
  const book = await prisma.book.findUnique({
    where: { googleId },
  });

  if (!book) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 });
  }

  return NextResponse.json(book);
}

// POST: 新しいBookを作成
export async function POST(request: NextRequest) {
  const data = await request.json();
  try {
    const newBook = await prisma.book.create({
      data,
    });
    return NextResponse.json(newBook, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create book', details: error }, { status: 400 });
  }
}

// PUT: 特定のBookを更新
export async function PUT(
  request: NextRequest,
  context: { params: { googleId: string } }
) {
  const { googleId } = context.params;
  const data = await request.json();

  try {
    const updatedBook = await prisma.book.update({
      where: { googleId },
      data,
    });
    return NextResponse.json(updatedBook);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update book', details: error }, { status: 400 });
  }
}

// DELETE: 特定のBookを削除
export async function DELETE(
  request: NextRequest,
  context: { params: { googleId: string } }
) {
  const { googleId } = context.params;

  try {
    await prisma.book.delete({
      where: { googleId },
    });
    return NextResponse.json({ message: 'Book deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete book', details: error }, { status: 400 });
  }
}