import { prisma } from '@/utils/prisma';
import BookShow from '@/components/BookShow';

type BookShowPageProps = {
    params: { googleId: string };
};

export default async function BookShowPage({ params }: BookShowPageProps) {
    const { googleId } = params;

    // Bookデータをprismaから取得
    const book = await prisma.book.findUnique({
        where: { googleId: googleId },
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
