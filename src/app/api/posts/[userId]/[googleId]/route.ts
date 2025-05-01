import { auth } from '@/utils/auth';
import { prisma } from '@/utils/prisma';

// GET: 特定のBookPostを取得
export async function GET(req: Request, { params }: { params: Promise<{ userId: string; googleId: string }> }) {
    const { errorResponse } = await auth(req);
    if (errorResponse) {
        return errorResponse;
    }

    const { userId, googleId } = await params;

    const bookPost = await prisma.bookPost.findFirst({
        where: {
            userId,
            book: {
                googleId,
            },
        },
        include: {
            book: true,
        },
    });

    if (!bookPost) {
        return Response.json({ error: 'BookPost not found' }, { status: 404 });
    }

    return Response.json(bookPost);
}

// PUT: 特定のBookPostを更新
export async function PUT(req: Request, { params }: { params: Promise<{ userId: string; googleId: string }> }) {
    const { errorResponse } = await auth(req);
    if (errorResponse) {
        return errorResponse;
    }

    const { userId, googleId } = await params;

    const data = await req.json();

    try {
        const bookPost = await prisma.bookPost.findFirst({
            where: {
                userId,
                book: {
                    googleId,
                },
            },
        });

        if (!bookPost) {
            return Response.json({ error: 'BookPost not found' }, { status: 404 });
        }

        const updatedBookPost = await prisma.bookPost.update({
            where: {
                id: bookPost.id,
            },
            data,
            include: {
                book: true,
            },
        });
        return Response.json(updatedBookPost);
    } catch (error) {
        return Response.json({ error: 'Failed to update bookPost', details: error }, { status: 400 });
    }
}

// DELETE: 特定のBookPostを削除
export async function DELETE(req: Request, { params }: { params: Promise<{ userId: string; googleId: string }> }) {
    const { errorResponse } = await auth(req);
    if (errorResponse) {
        return errorResponse;
    }

    const { userId, googleId } = await params;

    try {
        const bookPost = await prisma.bookPost.findFirst({
            where: {
                userId,
                book: {
                    googleId,
                },
            },
        });

        if (!bookPost) {
            return Response.json({ error: 'BookPost not found' }, { status: 404 });
        }

        const deletedBookPost = await prisma.bookPost.delete({
            where: {
                id: bookPost.id,
            },
            include: {
                book: true,
            },
        });
        return Response.json(deletedBookPost);
    } catch (error) {
        return Response.json({ error: 'Failed to delete bookPost', details: error }, { status: 400 });
    }
}
