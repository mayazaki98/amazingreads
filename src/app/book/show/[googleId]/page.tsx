import { prisma } from '@/utils/prisma';
import BookShow from '@/components/BookShow';

export default async function BookShowPage({ params }: { params: { googleId: string } }) {
    // Bookデータをprismaから取得
    const book = await prisma.book.findUnique({
        where: { googleId: params.googleId },
        include: {
            bookPosts: {
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: true,
                    _count: { select: { likes: true, replies: true } },
                },
            },
            _count: { select: { bookPosts: true } },
        },
    });

    if (!book) {
        return <div>本が見つかりませんでした。</div>;
    }
    return <BookShow book={book} />;
}
