import { apiAuth } from '@/utils/apiAuth';
import { prisma } from '@/utils/prisma';

// POST: 複数のgoogleIdに該当するBookを取得
export async function POST(req: Request) {
    const { errorResponse } = await apiAuth(req);
    if (errorResponse) {
        return errorResponse;
    }

    const { googleIds } = await req.json();

    if (!Array.isArray(googleIds) || googleIds.length === 0) {
        return Response.json({ error: 'Invalid or empty googleIds array', googleIds: googleIds }, { status: 400 });
    }

    try {
        const books = await prisma.book.findMany({
            where: {
                googleId: {
                    in: googleIds,
                },
            },
        });

        return Response.json(books);
    } catch (error) {
        return Response.json({ error: 'Failed to fetch books', details: error, googleIds: googleIds }, { status: 500 });
    }
}
