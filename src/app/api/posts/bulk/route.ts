import { prisma } from '@/utils/prisma';

// POST: 複数のgoogleIdに該当するBookを取得
export async function POST(req: Request) {
    const { googleIds, userId } = await req.json();

    if (!Array.isArray(googleIds) || googleIds.length === 0 || !userId) {
        return Response.json(
            { error: 'Invalid or empty googleIds array or userId is required', googleIds: googleIds, userId: userId },
            { status: 400 }
        );
    }

    try {
        // googleIds, userId をキーにしてBookPostを取得
        const bookPosts = await prisma.bookPost.findMany({
            where: {
                userId: userId,
                book: {
                    googleId: {
                        in: googleIds,
                    },
                },
            },
            include: {
                book: true,
            },
        });

        return Response.json(bookPosts);
    } catch (error) {
        return Response.json(
            { error: 'Failed to fetch bookPosts', details: error, googleIds: googleIds, userId: userId },
            { status: 500 }
        );
    }
}
