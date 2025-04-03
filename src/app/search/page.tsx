'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Book, BookPost as PrismaBookPost } from '@prisma/client';

/** 書籍の情報 */
interface AmazingBook {
    /** 書籍のID */
    id: string;
    /** 書籍のタイトル */
    title: string;
    /** 書籍の説明 */
    description: string;
    /** 著者のリスト */
    authors: string;
    /** サムネイルのURL */
    thumbnail: string;
    /** 書籍が投稿されているかどうか */
    isPosted: boolean;
}

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

type BookPost = PrismaBookPost & {
    book: {
        googleId: string;
    };
};

export default function NewPage() {
    const MAX_BY_REQUEST = 40; // 1リクエスト当たりの取得数

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<AmazingBook[]>([]); // 検索結果
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
        let amazingBooks: AmazingBook[] = [];

        try {
            // Google Books APIから検索結果を取得する
            const response = await fetch(
                `https://www.googleapis.com/books/v1/volumes?q=intitle:${searchQuery}&startIndex=${nextIndex}&maxResults=${MAX_BY_REQUEST}&key=${process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY}`
            );
            const data: GoogleBooksResponse = await response.json();
            console.log('Search results:', data);

            // 追加の結果がない場合は終了
            if (!data.items || data.items.length === 0) {
                return;
            }

            if (data.items.length === MAX_BY_REQUEST) {
                // 結果がMAX_BY_REQUEST件なら、次の検索でさらに検索結果が取得できる可能性ありなので、
                // 次の検索インデックスを更新する
                nextIndex += data.items.length;
            }

            // 既存の検索結果と重複する書籍を除外する
            const existingIds = new Set(searchResults.map((book) => book.id));
            data.items = data.items.filter((item) => !existingIds.has(item.id));

            // AmazingBookに変換する
            amazingBooks = data.items.map((googleBook) => {
                return {
                    id: googleBook.id,
                    title: googleBook.volumeInfo?.title,
                    description: googleBook.volumeInfo?.description,
                    authors: googleBook.volumeInfo?.authors?.join(','),
                    thumbnail: googleBook.volumeInfo?.imageLinks?.thumbnail,
                    isPosted: false,
                };
            });
        } catch (error) {
            console.error('Error:', error);
            return;
        }

        try {
            // 検索結果の書籍IDを使ってBookPostを取得
            const response = await fetch('/api/posts/bulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: '0001',
                    googleIds: amazingBooks.map((book) => book.id),
                }),
            });
            const bookPosts: BookPost[] = await response.json();
            if (bookPosts && bookPosts.length > 0) {
                // BookPost が存在する書籍をマーキング
                console.log('BookPosts:', bookPosts);
                amazingBooks.forEach((book) => {
                    const postedBook = bookPosts.find((post) => post.book.googleId === book.id);
                    if (postedBook) {
                        book.isPosted = true; // 書籍が投稿されていることをマーキング
                    }
                });
                console.log('amazingBooks:', amazingBooks);
            }
        } catch (error) {
            console.error('Failed to fetch bookPosts:', error);
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
    const handleRegister = async (book: AmazingBook) => {
        console.log('handleRegister book:', book);

        // 書籍の登録処理を実行する
        let registerdBook: Book;
        try {
            const responseBook = await fetch('/api/books/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    googleId: book.id,
                    title: book.title,
                    description: book.description,
                    authors: book.authors,
                    thumbnail: book.thumbnail,
                }),
            });

            registerdBook = await responseBook.json();
            console.log('/api/books/ POST result:', registerdBook);
        } catch (error) {
            console.error('Error:', error);
            alert('書籍の登録に失敗しました');
            return;
        }

        // 書籍投稿の登録処理を実行する
        let registerdPost: BookPost;
        try {
            const responsePost = await fetch('/api/posts/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: '0001',
                    bookId: registerdBook.id,
                }),
            });

            registerdPost = await responsePost.json();
            console.log('/api/posts/ POST result:', registerdPost);
        } catch (error) {
            console.error('Error:', error);
            alert('書籍投稿の登録に失敗しました');
            return;
        }
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
                        <button
                            onClick={() => handleNextSearch(0)}
                            className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 cursor-pointer hover:shadow-md active:shadow-sm"
                        >
                            検索
                        </button>
                    </div>
                </div>
                {/* 検索結果を表示する */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {searchResults.map((result) => (
                        <div
                            key={result.id}
                            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
                        >
                            <div className="p-4">
                                <div className="flex gap-4">
                                    {result.thumbnail && (
                                        <div className="relative w-24 h-32 flex-shrink-0">
                                            <Image
                                                src={result.thumbnail}
                                                alt={result.title}
                                                fill
                                                sizes="(max-width: 768px) 96px, 96px"
                                                className="object-cover rounded-md"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                                            {result.title}
                                        </h2>
                                        <p className="text-gray-600 mb-2 line-clamp-1">{result.authors}</p>
                                        <p className="text-gray-500 text-sm mb-4 line-clamp-3">{result.description}</p>
                                        <button
                                            onClick={() => handleRegister(result)}
                                            className="w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white py-2 rounded-md transition-colors duration-200 cursor-pointer hover:shadow-md active:shadow-sm"
                                        >
                                            登録
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {/* さらに検索ボタン */}
                {nextSearchIndex > 0 && !isLoading && (
                    <div className="mt-8 text-center">
                        <button
                            onClick={() => handleNextSearch(nextSearchIndex)}
                            className="bg-purple-500 hover:bg-purple-600 active:bg-purple-700 text-white px-8 py-3 rounded-lg transition-colors duration-200 cursor-pointer hover:shadow-md active:shadow-sm"
                        >
                            さらに検索
                        </button>
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
}
