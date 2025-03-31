import { prisma } from '@/utils/prisma';

// POST: 新しいBookを作成
export async function POST(req: Request) {
    const data = await req.json();
    const { googleId } = data;
    try {
        const book = await prisma.book.findUnique({
            where: { googleId },
        });

        if (book) {
            return Response.json(book, { status: 201 });
        }

        const newBook = await prisma.book.create({
            data,
        });
        return Response.json(newBook, { status: 201 });
    } catch (error) {
        return Response.json({ error: 'Failed to create book', details: error }, { status: 400 });
    }
}
