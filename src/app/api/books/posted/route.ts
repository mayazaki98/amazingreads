import { PostedByBook } from '@/utils/amazingTypes';
import { apiAuth } from '@/utils/apiAuth';
import { prisma } from '@/utils/prisma';

// POST: googleIdごとの投稿有無を取得
export async function POST(req: Request) {
    const { userId } = await apiAuth(req);
    const { googleIds } = await req.json();

    if (!Array.isArray(googleIds) || googleIds.length === 0) {
        return Response.json(
            { error: 'Invalid or empty googleIds array is required', googleIds: googleIds },
            { status: 400 }
        );
    }

    try {
        // googleIds をキーにしてBookを取得
        const books = await prisma.book.findMany({
            where: {
                googleId: {
                    in: googleIds,
                },
            },
            include: {
                _count: {
                    select: { bookPosts: true },
                },
            },
        });

        // 取得したBookのgoogleIdをキーにして、投稿有無を管理するマップを作成
        const postedByBookMap = new Map<string, { existsSomethingPost: boolean; existsMyPost: boolean }>();
        if (books) {
            books.forEach((book) => {
                postedByBookMap.set(book.googleId, {
                    existsSomethingPost: (book._count.bookPosts ?? 0) > 0, // 投稿有無
                    existsMyPost: false, // 自分の投稿有無  初期値はfalse
                });
            });
        }

        if (userId) {
            // googleIds, userId をキーにして自分が投稿したBookPostを取得
            const posts = await prisma.bookPost.findMany({
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

            // 取得した投稿をマップに反映
            if (posts) {
                posts.forEach((post) => {
                    const googleId = post.book.googleId;
                    if (postedByBookMap.has(googleId)) {
                        const existingData = postedByBookMap.get(googleId);
                        if (existingData) {
                            existingData.existsMyPost = true; // 自分の投稿がある場合はtrueに更新
                        }
                    }
                });
            }
        }

        // Mapの値をPostedByBookに変換
        const postedByBooks: PostedByBook[] = [];
        postedByBookMap.forEach((value, key) => {
            postedByBooks.push({
                googleId: key,
                existsMyPost: value.existsMyPost,
                existsSomethingPost: value.existsSomethingPost,
            });
        });

        return Response.json(postedByBooks);
    } catch (error) {
        return Response.json(
            { error: 'Failed to fetch books and bookPosts', details: error, googleIds: googleIds, userId: userId },
            { status: 500 }
        );
    }
}
