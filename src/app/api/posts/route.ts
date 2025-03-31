import { prisma } from '@/utils/prisma';

// POST: 新しいBookPostを作成
export async function POST(req: Request) {
    const data = await req.json();

    try {
        const newBookPost = await prisma.bookPost.create({
            data,
        });
        return Response.json(newBookPost, { status: 201 });
    } catch (error) {
        return Response.json({ error: 'Failed to create bookPost', details: error }, { status: 400 });
    }
}
