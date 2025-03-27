import { prisma } from '@/utils/prisma';
import { NextResponse } from 'next/server';

// POST: 複数のgoogleIdに該当するBookを取得
export async function POST(req: Request) {
  const { googleIds } = await req.json();

  if (!Array.isArray(googleIds) || googleIds.length === 0) {
    return NextResponse.json({ error: 'Invalid or empty googleIds array' }, { status: 400 });
  }

  try {
    const books = await prisma.book.findMany({
      where: {
        googleId: {
          in: googleIds,
        },
      },
    });

    return NextResponse.json(books);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch books', details: error }, { status: 500 });
  }
}
