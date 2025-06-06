'use client';

import { useEffect, useState, use } from 'react';
import { BookPostWithBook } from '@/utils/amazingTypes';
import BookPostEdit from '@/components/BookPostEdit';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

interface EditPageProps {
    params: Promise<{
        googleId: string;
    }>;
}

export default function EditPage({ params }: EditPageProps) {
    const router = useRouter();
    const { getToken, userId } = useAuth(); // 認証情報
    const { googleId } = use(params);
    const [bookPost, setBookPost] = useState<BookPostWithBook | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBookAndPost = async () => {
            try {
                // 投稿情報を取得
                const token = await getToken();
                const postResponse = await fetch(`/api/posts/${userId}/${googleId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!postResponse.ok) throw new Error('投稿の取得に失敗しました', { cause: postResponse });
                const postData = await postResponse.json();
                setBookPost(postData);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookAndPost();
    }, [googleId, getToken, userId]);

    const handleExit = () => {
        router.back();
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

    return <BookPostEdit post={bookPost} handleExit={handleExit} />;
}
