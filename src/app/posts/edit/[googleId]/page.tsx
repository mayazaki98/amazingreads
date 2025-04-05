'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Book, BookPost as PrismaBookPost, ReadStatus } from '@prisma/client';
import Image from 'next/image';

type BookPost = PrismaBookPost & {
    book: Book;
};

interface EditPageProps {
    params: Promise<{
        googleId: string;
    }>;
}

export default function EditPage({ params }: EditPageProps) {
    const { googleId } = use(params);
    const router = useRouter();
    const [bookPost, setBookPost] = useState<BookPost | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [rank, setRank] = useState<number>(0);
    const [comment, setComment] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    const statusOptions = [
        { value: ReadStatus.PLAN_TO_READ, label: '読みたい' },
        { value: ReadStatus.READING, label: '読書中' },
        { value: ReadStatus.COMPLETED, label: '読み終わった' },
    ];

    useEffect(() => {
        const fetchBookAndPost = async () => {
            try {
                // 投稿情報を取得
                const postResponse = await fetch(`/api/posts/0001/${googleId}`);
                if (!postResponse.ok) throw new Error('投稿の取得に失敗しました', { cause: postResponse });
                const postData = await postResponse.json();
                setBookPost(postData);
                setRank(postData.rank || 0);
                setComment(postData.comment || '');
                setStatus(postData.status || null);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookAndPost();
    }, [googleId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bookPost) return;

        try {
            const response = await fetch(`/api/posts/${bookPost.userId}/${googleId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status,
                    rank,
                    comment,
                }),
            });

            if (!response.ok) throw new Error('更新に失敗しました', { cause: response });
            //router.push('/posts');
        } catch (error) {
            console.error('Error:', error);
            alert('更新に失敗しました');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2">読み込み中...</span>
            </div>
        );
    }

    if (!bookPost) {
        return <div className="text-center p-4">書籍が見つかりませんでした</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">書籍の編集</h1>
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex gap-6 mb-6">
                    {bookPost.book.thumbnail && (
                        <div className="relative w-32 h-48 flex-shrink-0">
                            <Image
                                src={bookPost.book.thumbnail}
                                alt={bookPost.book.title}
                                fill
                                priority
                                sizes="(max-width: 768px) 128px, 128px"
                                className="object-cover rounded-md"
                            />
                        </div>
                    )}
                    <div>
                        <h2 className="text-xl font-bold mb-2">{bookPost.book.title}</h2>
                        <p className="text-gray-600 mb-2">{bookPost.book.authors}</p>
                        <p className="text-gray-500 text-sm">{bookPost.book.description}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">読書状態</label>
                        <div className="flex gap-4">
                            {statusOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setStatus(option.value)}
                                    className={`px-4 py-2 rounded-md ${
                                        status === option.value ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                                    } transition-colors`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">評価</label>
                        <div className="flex gap-4">
                            {[1, 2, 3, 4, 5].map((value) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setRank(value)}
                                    className={`w-10 h-10 rounded-full ${
                                        rank >= value ? 'bg-yellow-400' : 'bg-gray-200'
                                    } transition-colors`}
                                >
                                    {value}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">コメント</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="この本の感想を書いてください"
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                        >
                            更新する
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
                        >
                            キャンセル
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
