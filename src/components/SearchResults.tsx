'use client';

import { useState } from 'react';
import { Book } from '@prisma/client';
import SearchResultItem from '@/components/SearchResultItem';
import { BookPostWithBook, BookWithPosted } from '@/utils/amazingTypes';
import { PutButton } from './parts/Button';
import { useAuth } from '@clerk/nextjs';

/** Google Books APIのレスポンス */
interface GoogleBooksResponse {
    /** 書籍のリスト */
    items: GoogleBook[];
}

/** Google 書籍の情報 */
interface GoogleBook {
    /** 書籍のID */
    id: string;
    volumeInfo: {
        /** 書籍のタイトル */
        title: string;
        /** 書籍の説明 */
        description: string;
        /** 著者のリスト */
        authors: string[];
        /** ISBNなどの識別子のリスト */
        industryIdentifiers: GoogleIdentifier[];
        /** サムネイルのURL */
        imageLinks: {
            thumbnail: string;
        };
    };
}

/** Google 識別子の情報 */
interface GoogleIdentifier {
    /** 識別子のタイプ (例: ISBN_10, ISBN_13) */
    type: string;
    /** 識別子の値 */
    identifier: string;
}

type Props = {
    query: string;
};

const SearchResults = ({ query }: Props) => {
    const MAX_BY_REQUEST = 40; // 1リクエスト当たりの取得数

    const { getToken, userId } = useAuth(); // 認証情報
    const [searchQuery, setSearchQuery] = useState(query); // 検索クエリ
    const [searchResults, setSearchResults] = useState<BookWithPosted[]>([]); // 検索結果
    const [nextSearchIndex, setNextSearchIndex] = useState(0); // 次の検索インデックス
    const [isLoading, setIsLoading] = useState(false); // ローディング状態

    /**
     * 検索を行い、結果を表示する
     * @param startIndex 検索開始インデックス
     */
    const handleNextSearch = async (startIndex: number) => {
        setIsLoading(true);
        console.log('handleNextSearch searchQuery:', searchQuery, 'startIndex:', startIndex);
        let nextIndex = startIndex;
        let amazingBooks: BookWithPosted[] = [];

        try {
            // Google Books APIから検索結果を取得する
            const response = await fetch(
                `https://www.googleapis.com/books/v1/volumes?q=intitle:${searchQuery}&startIndex=${nextIndex}&maxResults=${MAX_BY_REQUEST}&key=${process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY}`
            );

            if (!response.ok) {
                throw new Error(`検索結果の取得に失敗しました: ${response.status}`);
            }

            const data: GoogleBooksResponse = await response.json();
            console.log('Search results:', data);

            if (data.items && data.items.length > 0) {
                if (data.items.length === MAX_BY_REQUEST) {
                    // 結果がMAX_BY_REQUEST件なら、次の検索でさらに検索結果が取得できる可能性ありなので、
                    // 次の検索インデックスを更新する
                    nextIndex += data.items.length;
                }

                if (startIndex > 0) {
                    // 既存の検索結果と重複する書籍を除外する
                    const existingIds = new Set(searchResults.map((book) => book.googleId));
                    data.items = data.items.filter((item) => !existingIds.has(item.id));
                }

                // AmazingBookに変換する
                amazingBooks = data.items.map((googleBook) => {
                    return {
                        id: '', // PrismaのIDは空にしておく
                        googleId: googleBook.id,
                        title: googleBook.volumeInfo?.title,
                        description: googleBook.volumeInfo?.description,
                        authors: googleBook.volumeInfo?.authors?.join(','),
                        thumbnail: googleBook.volumeInfo?.imageLinks?.thumbnail,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        isPosted: false,
                    };
                });
            }
        } catch (error) {
            console.error('Error:', error);
            alert('検索に失敗しました');
            return;
        }

        if (amazingBooks.length > 0) {
            try {
                // 検索結果の書籍IDを使ってBookPostを取得
                const token = await getToken();
                if (token) {
                    const response = await fetch('/api/posts/bulk', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            userId: userId,
                            googleIds: amazingBooks.map((book) => book.googleId),
                        }),
                    });

                    if (!response.ok) {
                        throw new Error(`投稿の取得に失敗しました: ${response.status}`);
                    }

                    const bookPosts: BookPostWithBook[] = await response.json();
                    if (bookPosts && bookPosts.length > 0) {
                        // BookPost が存在する書籍をマーキング
                        console.log('BookPosts:', bookPosts);
                        amazingBooks.forEach((book) => {
                            const postedBook = bookPosts.find((post) => post.book.googleId === book.googleId);
                            if (postedBook) {
                                book.isPosted = true; // 書籍が投稿されていることをマーキング
                            }
                        });
                        console.log('amazingBooks:', amazingBooks);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch bookPosts:', error);
                alert('投稿の取得に失敗しました');
            }
        }

        if (startIndex === 0) {
            // 最初の検索の場合
            setSearchResults(amazingBooks); // 結果を上書き保存する
        } else if (amazingBooks.length > 0) {
            // 2回目以降の検索の場合
            setSearchResults([...searchResults, ...amazingBooks]); // 結果を追加する
        }

        if (startIndex !== nextIndex) {
            // インデックスの更新があった場合
            setNextSearchIndex(nextIndex); // 次のインデックスを保存する
        } else {
            // インデックス更新が無ければこれ以上の検索は不要なので0にする
            setNextSearchIndex(0); // 次のインデックスを保存する
        }
        setIsLoading(false);
    };

    /**
     * 書籍を登録する
     * @param book 登録する書籍
     */
    const handleRegister = async ({ googleId, title, description, authors, thumbnail }: Book) => {
        console.log('handleRegister book:', { googleId, title, description, authors, thumbnail });

        // 書籍の登録処理を実行する
        let registerdBook: Book;
        try {
            const response = await fetch('/api/books/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ googleId, title, description, authors, thumbnail }),
            });

            if (!response.ok) {
                throw new Error(`書籍登録に失敗しました: ${response.status}`);
            }

            registerdBook = await response.json();
            console.log('/api/books/ POST result:', registerdBook);
        } catch (error) {
            console.error('Error:', error);
            alert('書籍登録に失敗しました');
            return;
        }

        // 書籍投稿の登録処理を実行する
        let registerdPost: BookPostWithBook;
        try {
            const token = await getToken();
            const response = await fetch('/api/posts/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    userId: userId,
                    bookId: registerdBook.id,
                }),
            });

            if (!response.ok) {
                throw new Error(`投稿に失敗しました: ${response.status}`);
            }

            registerdPost = await response.json();
            console.log('/api/posts/ POST result:', registerdPost);
        } catch (error) {
            console.error('Error:', error);
            alert('投稿に失敗しました');
            return;
        }

        // 登録した書籍のisPostedをtrueに設定し、検索結果を更新
        const updatedResults = searchResults.map((item) =>
            item.googleId === googleId ? { ...item, isPosted: true } : item
        );
        setSearchResults(updatedResults);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">書籍検索</h1>
                <div className="max-w-2xl mx-auto">
                    <div className="flex gap-2 mb-8">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleNextSearch(0);
                                }
                            }}
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="書籍名を入力してください"
                        />
                        <PutButton label="検索" onClick={() => handleNextSearch(0)} />
                    </div>
                </div>
                {/* 検索結果を表示する */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {searchResults.map((result) => (
                        <SearchResultItem key={result.googleId} book={result} handleRegister={handleRegister} />
                    ))}
                </div>
                {/* さらに検索ボタン */}
                {nextSearchIndex > 0 && !isLoading && (
                    <div className="mt-8 text-center">
                        <PutButton label="さらに検索" onClick={() => handleNextSearch(nextSearchIndex)} />
                    </div>
                )}
                {/* ローディング表示 */}
                {isLoading && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-600">検索中...</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResults;
