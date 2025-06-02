import { prisma } from '@/utils/prisma';
import { apiAuth } from '@/utils/apiAuth';

// POST: いいね追加
export async function POST(req: Request) {
    const { errorResponse, userId } = await apiAuth(req);
    if (errorResponse || !userId) return errorResponse!;

    const { bookPostId } = await req.json();
    if (!bookPostId) {
        return Response.json({ error: 'bookPostId is required' }, { status: 400 });
    }

    try {
        // すでにLikeが存在する場合は何もしない
        const existing = await prisma.like.findUnique({
            where: { userId_bookPostId: { userId, bookPostId } },
        });
        if (existing) {
            return Response.json({ message: 'Already liked' }, { status: 200 });
        }
        const like = await prisma.like.create({
            data: { userId, bookPostId },
        });
        return Response.json(like, { status: 201 });
    } catch (error) {
        return Response.json({ error: 'Failed to like', details: error }, { status: 500 });
    }
}

// DELETE: いいね削除
export async function DELETE(req: Request) {
    const { errorResponse, userId } = await apiAuth(req);
    if (errorResponse || !userId) return errorResponse!;

    const { bookPostId } = await req.json();
    if (!bookPostId) {
        return Response.json({ error: 'bookPostId is required' }, { status: 400 });
    }

    try {
        await prisma.like.delete({
            where: { userId_bookPostId: { userId, bookPostId } },
        });
        return Response.json({ message: 'Unliked' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: 'Failed to unlike', details: error }, { status: 500 });
    }
}
