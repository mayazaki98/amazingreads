'use client';

import { BookWithPostsAndUser } from '@/utils/amazingTypes';
import { Like, User } from '@prisma/client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Profile from './Profile';
import { useAuth } from '@clerk/nextjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';

type Props = {
    book: BookWithPostsAndUser;
    userId: string | null;
};
const BookShow = ({ book, userId }: Props) => {
    const { getToken } = useAuth();
    const [liking, setLiking] = useState<string | null>(null);
    const [profileUser, setProfileUser] = useState<null | User>(null);
    const [showProfile, setShowProfile] = useState(false);
    const [posts, setPosts] = useState(book.bookPosts);

    useEffect(() => {
        if (showProfile) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [showProfile]);

    const handleUserClick = (user: User) => {
        setProfileUser(user);
        setShowProfile(true);
    };

    const getDisplayName = (user: User) => {
        if (user?.name) return user.name;
        if (user?.email) return user.email.split('@')[0];
        return '名無しさん';
    };

    // いいね処理
    const handleLike = async (bookPostId: string, isPost: boolean) => {
        let postedLike: Like | null = null;
        try {
            setLiking(bookPostId);
            const token = await getToken();
            if (isPost) {
                const response = await fetch('/api/likes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ bookPostId }),
                });
                if (!response.ok) {
                    throw new Error(`いいねの登録に失敗しました: ${response.status}`);
                }
                postedLike = await response.json();
            } else {
                const response = await fetch('/api/likes', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ bookPostId }),
                });
                if (!response.ok) {
                    throw new Error(`いいねの取り消しに失敗しました: ${response.status}`);
                }
            }
        } catch (error) {
            console.error('いいねの処理中にエラーが発生しました:', error);
            return;
        } finally {
            setLiking(null);
        }

        // ローカルstateを即時更新
        setPosts((prev) =>
            prev.map((post) =>
                post.id === bookPostId
                    ? {
                          ...post,
                          likes: postedLike ? [postedLike] : [],
                          _count: {
                              ...post._count,
                              likes: postedLike ? post._count.likes + 1 : post._count.likes - 1,
                          },
                      }
                    : post
            )
        );
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* 左カラム: 書籍の詳細情報 */}
                <div className="md:col-span-1 bg-white rounded-lg shadow-md p-6">
                    {book.thumbnail && (
                        <div className="mb-4">
                            <Image
                                src={book.thumbnail}
                                alt={book.title}
                                width={128}
                                height={192}
                                className="object-cover rounded-md w-32 h-48"
                                priority
                            />
                        </div>
                    )}
                    <h1 className="text-2xl font-bold mb-2">{book.title}</h1>
                    <p className="text-gray-600 mb-2">{book.authors}</p>
                    <p className="text-gray-500 text-sm">{book.description}</p>
                </div>

                {/* 右カラム: 投稿一覧 */}
                <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4">投稿一覧</h2>
                    {posts.length > 0 ? (
                        <ul className="space-y-4">
                            {posts.map((post) => (
                                <li key={post.id} className="border-b pb-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <button
                                            type="button"
                                            className="text-blue-700 font-bold text-sm hover:underline focus:outline-none"
                                            onClick={() => handleUserClick(post.user)}
                                        >
                                            {getDisplayName(post.user)}
                                        </button>
                                        {/* プロフィールポップアップ */}
                                        {showProfile && profileUser && (
                                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 bg-opacity-60">
                                                <Profile
                                                    user={profileUser}
                                                    getDisplayName={getDisplayName}
                                                    onClose={() => setShowProfile(false)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-gray-800 font-semibold">{post.comment}</p>
                                    <p className="text-gray-600 text-sm">評価: {post.rank}</p>
                                    <p className="text-gray-500 text-sm">ステータス: {post.status}</p>
                                    <button
                                        className={`ml-2 flex items-center gap-1 text-pink-600 transition-transform ${
                                            liking === post.id || userId == null || userId !== post.userId
                                                ? ''
                                                : 'hover:scale-110'
                                        }`}
                                        disabled={liking === post.id || userId == null || userId !== post.userId}
                                        onClick={() => handleLike(post.id, post.likes.length === 0)}
                                    >
                                        <FontAwesomeIcon
                                            icon={post.likes.length > 0 ? solidHeart : regularHeart}
                                            className={userId ? 'text-pink-600' : 'text-gray-400'}
                                        />
                                        <span className="ml-1">{post._count.likes}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">投稿がありません。</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookShow;
