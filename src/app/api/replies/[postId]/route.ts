import { apiAuth } from '@/utils/apiAuth';
import { prisma } from '@/utils/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ postId: string }> }) {
    const { postId } = await params;

    const replies = await prisma.reply.findMany({
        where: {
            bookPostId: postId,
        },
        include: {
            user: true,
        },
        orderBy: {
            createdAt: 'asc',
        },
    });

    if (!replies) {
        return Response.json({ error: 'replies not found' }, { status: 404 });
    }

    return Response.json(replies);
}

export async function POST(req: Request) {
    const { errorResponse, userId } = await apiAuth(req);
    if (errorResponse || !userId) return errorResponse!;

    const data = await req.json();

    try {
        const newReply = await prisma.reply.create({
            data,
            include: {
                user: true,
            },
        });
        return Response.json(newReply, { status: 201 });
    } catch (error) {
        return Response.json({ error: 'Failed to create reply', details: error }, { status: 400 });
    }
}
