import { prisma } from '@/utils/prisma';

// GET: 特定のBookを取得
export async function GET(req: Request, { params }: { params: Promise<{ googleId: string }> }) {
    const { googleId } = await params;

    const book = await prisma.book.findUnique({
        where: { googleId },
    });

    if (!book) {
        return Response.json({ error: 'Book not found' }, { status: 404 });
    }

    return Response.json(book);
}

// PUT: 特定のBookを更新
export async function PUT(req: Request, { params }: { params: Promise<{ googleId: string }> }) {
    const { googleId } = await params;

    const data = await req.json();

    try {
        const updatedBook = await prisma.book.update({
            where: { googleId },
            data,
        });
        return Response.json(updatedBook);
    } catch (error) {
        return Response.json({ error: 'Failed to update book', details: error }, { status: 400 });
    }
}

// DELETE: 特定のBookを削除
export async function DELETE(req: Request, { params }: { params: Promise<{ googleId: string }> }) {
    const { googleId } = await params;

    try {
        const deletedBook = await prisma.book.delete({
            where: { googleId },
        });
        return Response.json(deletedBook);
    } catch (error) {
        return Response.json({ error: 'Failed to delete book', details: error }, { status: 400 });
    }
}
