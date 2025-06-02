import { prisma } from '@/utils/prisma';
import BookShow from '@/components/BookShow';
import { auth } from '@clerk/nextjs/server';
import { BookWithPostsAndUser } from '@/utils/amazingTypes';

type BookShowPageProps = {
    params: Promise<{ googleId: string }>;
};

export default async function BookShowPage({ params }: BookShowPageProps) {
    const { googleId } = await params;
    const { userId } = await auth();

    // Bookデータをprismaから取得
    const book: BookWithPostsAndUser | null = await prisma.book.findUnique({
        where: { googleId: googleId },
        include: {
            _count: { select: { bookPosts: true } },
            bookPosts: {
                take: 10, // 最新の10件を取得
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: { select: { likes: true, replies: true } },
                    user: true,
                    likes: { where: userId ? { userId } : undefined },
                    replies: {
                        take: 10, // 最新の10件を取得
                        orderBy: { createdAt: 'desc' },
                        include: { user: true },
                    },
                },
            },
        },
    });

    if (!book) {
        return <div>本が見つかりませんでした。</div>;
    }
    return <BookShow book={book} userId={userId} />;
}
