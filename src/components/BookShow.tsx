'use client';

import { BookWithPostsAndUser } from '@/utils/amazingTypes';
import { BookPost, Like, User } from '@prisma/client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Profile from './Profile';
import { useAuth } from '@clerk/nextjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
// 追加: 星アイコン
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons';

type Props = {
    book: BookWithPostsAndUser;
    userId: string | null;
};
const BookShow = ({ book, userId }: Props) => {
    const { getToken } = useAuth();
    const [liking, setLiking] = useState<string | null>(null);
    const [profileUser, setProfileUser] = useState<null | User>(null);
    const [showProfile, setShowProfile] = useState(false);
    // 自分の投稿が一番上に来るようにソート
    const [posts, setPosts] = useState(() => {
        const arr = [...book.bookPosts];
        if (userId) {
            arr.sort((a, b) => {
                if (a.userId === userId && b.userId !== userId) return -1;
                if (a.userId !== userId && b.userId === userId) return 1;
                return 0;
            });
        }
        return arr;
    });
    // ★ ポップアップ外クリックで閉じる
    // 追加: 編集用state
    const [editingStatusPostId, setEditingStatusPostId] = useState<string | null>(null);

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

    useEffect(() => {
        if (!editingStatusPostId) return;
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.relative.inline-block')) {
                setEditingStatusPostId(null);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [editingStatusPostId]);

    const handleUserClick = (user: User) => {
        setProfileUser(user);
        setShowProfile(true);
    };

    const getDisplayName = (user: User) => {
        if (user?.name) return user.name;
        if (user?.email) return user.email.split('@')[0];
        return '名無しさん';
    };

    // ステータス表示用関数を追加
    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PLAN_TO_READ':
                return '読みたい';
            case 'READING':
                return '読書中';
            case 'COMPLETED':
                return '読み終わった';
            default:
                return status;
        }
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

    // 投稿更新処理
    const handlePostUpdate = async (post: BookPost) => {
        try {
            const token = await getToken();
            const response = await fetch(`/api/posts/${userId}/${book.googleId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    status: post.status,
                    rank: post.rank,
                    comment: post.comment,
                }),
            });
            if (!response.ok) {
                console.error('失敗 ', response.body);
                throw new Error('評価の更新に失敗しました');
            }
            // ローカルstateを即時更新
            setPosts((prevPosts) =>
                prevPosts.map((prevPost) =>
                    prevPost.id === post.id
                        ? { ...prevPost, rank: post.rank, comment: post.comment, status: post.status }
                        : prevPost
                )
            );
        } catch (e) {
            console.error(e);
        }
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
                                        {/* ユーザー名 */}
                                        <button
                                            type="button"
                                            className="text-blue-700 font-bold text-sm hover:underline focus:outline-none cursor-pointer"
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
                                    {/* 評価: 星5段階表示 */}
                                    <div className="flex items-center text-yellow-400 text-sm mb-1">
                                        {Array.from({ length: 5 }).map((_, i) =>
                                            post.userId === userId ? (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    className="focus:outline-none cursor-pointer transition-transform"
                                                    onClick={() => handlePostUpdate({ ...post, rank: i + 1 })}
                                                    aria-label={`評価 ${i + 1} にする`}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={i < (post.rank ?? 0) ? solidStar : regularStar}
                                                        className="mr-0.5"
                                                    />
                                                </button>
                                            ) : (
                                                <FontAwesomeIcon
                                                    key={i}
                                                    icon={i < (post.rank ?? 0) ? solidStar : regularStar}
                                                    className="mr-0.5"
                                                />
                                            )
                                        )}
                                    </div>
                                    {/* ステータス */}
                                    {post.userId === userId ? (
                                        <div className="relative inline-block">
                                            <button
                                                type="button"
                                                className="text-gray-500 text-sm cursor-pointer hover:scale-110 transition-transform px-2 py-1 rounded hover:bg-gray-100"
                                                onClick={() =>
                                                    setEditingStatusPostId(
                                                        editingStatusPostId === post.id ? null : post.id
                                                    )
                                                }
                                            >
                                                {getStatusLabel(post.status ?? '')}
                                            </button>
                                            {typeof editingStatusPostId !== 'undefined' &&
                                                editingStatusPostId === post.id && (
                                                    <div
                                                        className="absolute z-10 mt-2 left-0 bg-white border border-gray-300 rounded shadow-lg"
                                                        style={{ minWidth: '8rem' }}
                                                    >
                                                        {[
                                                            { value: 'PLAN_TO_READ', label: '読みたい' },
                                                            { value: 'READING', label: '読書中' },
                                                            { value: 'COMPLETED', label: '読み終わった' },
                                                        ].map((opt) => (
                                                            <button
                                                                key={opt.value}
                                                                className={`block w-full text-left px-4 py-2 hover:bg-blue-100 transition-colors ${
                                                                    post.status === opt.value
                                                                        ? 'font-bold text-blue-600'
                                                                        : ''
                                                                }`}
                                                                onClick={() => {
                                                                    setEditingStatusPostId(null);
                                                                    handlePostUpdate({
                                                                        ...post,
                                                                        status: opt.value as BookPost['status'],
                                                                    });
                                                                }}
                                                            >
                                                                {opt.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-sm">{getStatusLabel(post.status ?? '')}</p>
                                    )}
                                    {/* コメント */}
                                    <p className="text-gray-800">{post.comment}</p>
                                    {/* いいね */}
                                    <button
                                        className={`ml-2 flex items-center gap-1 text-pink-600 transition-transform ${
                                            liking === post.id || userId == null || userId === post.userId
                                                ? ''
                                                : 'hover:scale-110 cursor-pointer'
                                        }`}
                                        disabled={liking === post.id || userId == null || userId === post.userId}
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
