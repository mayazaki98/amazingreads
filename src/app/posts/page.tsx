'use client';

import { useEffect, useState } from 'react';
import { Book, BookPost as PrismaBookPost, ReadStatus } from '@prisma/client';
import Image from 'next/image';

type BookPost = PrismaBookPost & {
    book: Book;
};

export default function PostsPage() {
    const [bookPosts, setBookPosts] = useState<BookPost[]>([]);
    const [loading, setLoading] = useState(true);

    const statusOptions = [
        { value: ReadStatus.PLAN_TO_READ, label: '読みたい' },
        { value: ReadStatus.READING, label: '読書中' },
        { value: ReadStatus.COMPLETED, label: '読み終わった' },
    ];

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch('/api/posts/0001');

                if (!response.ok) {
                    throw new Error('Failed to fetch get posts', { cause: response });
                }

                const data: BookPost[] = await response.json();
                setBookPosts(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const handleDelete = async (post: BookPost) => {
        if (confirm('本当に削除しますか？')) {
            try {
                const response = await fetch(`/api/posts/0001/${post.book.googleId}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error('Failed to delete post');
                }

                setBookPosts((prevPosts) => prevPosts.filter((p) => p.id !== post.id));
            } catch (error) {
                console.error(error);
            }
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">マイページ</h1>
                {/* 検索結果を表示する */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {bookPosts.map((post) => (
                        <div
                            key={post.id}
                            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
                        >
                            <div className="p-4">
                                <div className="flex gap-4">
                                    {post.book.thumbnail && (
                                        <div className="relative w-24 h-32 flex-shrink-0">
                                            <Image
                                                src={post.book.thumbnail}
                                                alt={post.book.title}
                                                fill
                                                sizes="(max-width: 768px) 96px, 96px"
                                                className="object-cover rounded-md"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h2 className="text-xl font-bold text-gray-800 mb-4 line-clamp-2">
                                            {post.book.title}
                                        </h2>
                                        <div className="flex gap-1 mb-5">
                                            {[1, 2, 3, 4, 5].map(
                                                (rank) =>
                                                    post.rank &&
                                                    post.rank >= rank && (
                                                        <div
                                                            key={rank}
                                                            className="w-5 h-5 rounded-full bg-yellow-400 transition-colors"
                                                        />
                                                    )
                                            )}
                                        </div>
                                        <div className="flex gap-1 mb-2">
                                            {statusOptions.map(
                                                (status) =>
                                                    post.status === status.value && (
                                                        <div key={status.value}>{status.label}</div>
                                                    )
                                            )}
                                        </div>
                                        <p className="text-gray-500 text-sm mb-4 line-clamp-3">{post.comment}</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.location.href = `/posts/edit/${post.book.googleId}`;
                                                }}
                                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition cursor-pointer"
                                            >
                                                編集
                                            </button>
                                            <button
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    handleDelete(post);
                                                }}
                                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition cursor-pointer"
                                            >
                                                削除
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
