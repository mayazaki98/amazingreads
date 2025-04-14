'use client';

import { useEffect, useState } from 'react';
import { BookPostWithBook } from '@/utils/amazingTypes';
import BookPostItem from '@/components/BookPostItem';

export default function PostsPage() {
    const [bookPosts, setBookPosts] = useState<BookPostWithBook[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch('/api/posts/0001');

                if (!response.ok) {
                    throw new Error('Failed to fetch get posts', { cause: response });
                }

                const data: BookPostWithBook[] = await response.json();
                setBookPosts(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const handleDelete = async (post: BookPostWithBook) => {
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
                        <BookPostItem key={post.id} post={post} handleDelete={handleDelete} />
                    ))}
                </div>
            </div>
        </div>
    );
}
