'use client';

import { useEffect, useState } from 'react';
import { BookPostWithBook } from '@/utils/amazingTypes';
import BookPostItem from '@/components/BookPostItem';
import BookPostEdit from '@/components/BookPostEdit';
import { useAuth } from '@clerk/nextjs';

const BookPosts = () => {
    const { getToken, userId } = useAuth(); // 認証情報
    const [bookPosts, setBookPosts] = useState<BookPostWithBook[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingPost, setEditingPost] = useState<BookPostWithBook | null>(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const token = await getToken();
                const response = await fetch(`/api/posts/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

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
    }, [getToken, userId]);

    useEffect(() => {
        if (editingPost) {
            document.body.style.overflow = 'hidden'; // 背景スクロールを無効化
        } else {
            document.body.style.overflow = ''; // 元に戻す
        }
        return () => {
            document.body.style.overflow = ''; // クリーンアップ
        };
    }, [editingPost]);

    const handleDelete = async (post: BookPostWithBook) => {
        if (confirm('本当に削除しますか？')) {
            try {
                const token = await getToken();
                const response = await fetch(`/api/posts/${userId}/${post.book.googleId}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
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

    const handleEdit = (post: BookPostWithBook) => {
        setEditingPost(post);
    };

    const handleExitEditModal = (isUpdate: boolean, post: BookPostWithBook | null) => {
        setEditingPost(null);

        if (isUpdate && post) {
            setBookPosts((prevPosts) => prevPosts.map((p) => (p.id === post.id ? post : p)));
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 編集モーダル */}
            {editingPost && (
                <div className="fixed inset-0 bg-black/75 flex items-start justify-center z-50 overflow-y-auto">
                    <BookPostEdit post={editingPost} handleExit={handleExitEditModal} />
                </div>
            )}
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">マイページ</h1>
                {/* 検索結果を表示する */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {bookPosts.map((post) => (
                        <BookPostItem key={post.id} post={post} handleDelete={handleDelete} handleEdit={handleEdit} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BookPosts;
