import { prisma } from '@/utils/prisma';

// GET: 複数のgoogleIdに該当するBookを取得
export async function GET(req: Request, { params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;

    if (!userId) {
        return Response.json({ error: 'Invalid or empty userId is required', userId: userId }, { status: 400 });
    }

    try {
        // userId をキーにしてBookPostを取得
        const bookPosts = await prisma.bookPost.findMany({
            where: {
                userId: userId,
            },
            include: {
                book: true,
            },
        });

        return Response.json(bookPosts);
    } catch (error) {
        return Response.json({ error: 'Failed to fetch bookPosts', details: error, userId: userId }, { status: 500 });
    }
}
