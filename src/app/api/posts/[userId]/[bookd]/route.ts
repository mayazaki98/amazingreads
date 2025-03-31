import { prisma } from '@/utils/prisma';

// GET: 特定のBookPostを取得
export async function GET(req: Request, { params }: { params: Promise<{ userId: string; bookId: string }> }) {
    const { userId, bookId } = await params;

    const bookPost = await prisma.bookPost.findUnique({
        where: {
            userId_bookId: {
                userId,
                bookId,
            },
        },
    });

    if (!bookPost) {
        return Response.json({ error: 'BookPost not found' }, { status: 404 });
    }

    return Response.json(bookPost);
}

// PUT: 特定のBookPostを更新
export async function PUT(req: Request, { params }: { params: Promise<{ userId: string; bookId: string }> }) {
    const { userId, bookId } = await params;

    const data = await req.json();

    try {
        const updatedBookPost = await prisma.bookPost.update({
            where: {
                userId_bookId: {
                    userId,
                    bookId,
                },
            },
            data,
        });
        return Response.json(updatedBookPost);
    } catch (error) {
        return Response.json({ error: 'Failed to update bookPost', details: error }, { status: 400 });
    }
}

// DELETE: 特定のBookPostを削除
export async function DELETE(req: Request, { params }: { params: Promise<{ userId: string; bookId: string }> }) {
    const { userId, bookId } = await params;

    try {
        const deletedBookPost = await prisma.bookPost.delete({
            where: {
                userId_bookId: {
                    userId,
                    bookId,
                },
            },
        });
        return Response.json(deletedBookPost);
    } catch (error) {
        return Response.json({ error: 'Failed to delete bookPost', details: error }, { status: 400 });
    }
}
