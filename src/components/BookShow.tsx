'use client';

import { BookWithPostsAndUser } from '@/utils/amazingTypes';
import { User } from '@prisma/client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Profile from './Profile';

type Props = {
    book: BookWithPostsAndUser;
};
const BookShow = ({ book }: Props) => {
    const [profileUser, setProfileUser] = useState<null | User>(null);
    const [showProfile, setShowProfile] = useState(false);

    const handleUserClick = (user: User) => {
        setProfileUser(user);
        setShowProfile(true);
    };

    const getDisplayName = (user: User) => {
        if (user?.name) return user.name;
        if (user?.email) return user.email.split('@')[0];
        return '名無しさん';
    };

    useEffect(() => {
        if (showProfile) {
            document.body.style.overflow = 'hidden'; // 背景スクロールを無効化
        } else {
            document.body.style.overflow = ''; // 元に戻す
        }
        return () => {
            document.body.style.overflow = ''; // クリーンアップ
        };
    }, [showProfile]);

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
                    {book.bookPosts.length > 0 ? (
                        <ul className="space-y-4">
                            {book.bookPosts.map((post) => (
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
