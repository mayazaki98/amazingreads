import { prisma } from '@/utils/prisma';
import { NextResponse } from 'next/server';

// GET: 特定のBookを取得
export async function GET(req: Request, { params }: { params: { googleId: string } }) {
  const { googleId } = params;
  const book = await prisma.book.findUnique({
    where: { googleId },
  });

  if (!book) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 });
  }

  return NextResponse.json(book);
}

// POST: 新しいBookを作成
export async function POST(req: Request) {
  const data = await req.json();
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
export async function PUT(req: Request, { params }: { params: { googleId: string } }) {
  const { googleId } = params;
  const data = await req.json();

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
export async function DELETE(req: Request, { params }: { params: { googleId: string } }) {
  const { googleId } = params;

  try {
    await prisma.book.delete({
      where: { googleId },
    });
    return NextResponse.json({ message: 'Book deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete book', details: error }, { status: 400 });
  }
}
