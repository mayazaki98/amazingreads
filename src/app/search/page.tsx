'use client';

import { useState } from 'react';

// Google Books APIのレスポンスの型定義
/** Google Books APIのレスポンス */
interface GoogleBooksResponse {
    /** 書籍のリスト */
    items: Book[];
}

/** 書籍の情報 */
interface Book {
    /** 書籍のID */
    id: string;
    volumeInfo: {
        /** 書籍のタイトル */
        title: string;
        /** 著者のリスト */
        authors: string[];
        /** ISBNなどの識別子のリスト */
        industryIdentifiers: Identifier[];
    };
}

/** 識別子の情報 */
interface Identifier {
    /** 識別子のタイプ (例: ISBN_10, ISBN_13) */
    type: string;
    /** 識別子の値 */
    identifier: string;
}

export default function NewPage() {
    const COUNT_BY_PAGE = 10; // 1ページあたりの表示件数

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Book[]>([]); // 検索結果(全件)
    const [nextSearchIndex, setNextSearchIndex] = useState(0); // 次の検索インデックス
    const [currentResults, setCurrentResults] = useState<Book[]>([]); // 検索結果(表示中)
    const [currentPage, setCurrentPage] = useState(1); // 現在のページ番号

    /**
     * 次のページの結果を表示する
     */
    const handleNextButton = () => {
        const nextPage = currentPage + 1; // 次のページ番号
        const index = (nextPage - 1) * COUNT_BY_PAGE; // 次のページの開始インデックス

        if (index < searchResults.length) {
            // 次のページの結果を表示する
            setCurrentResults(searchResults.slice(index, index + COUNT_BY_PAGE));
            setCurrentPage(nextPage); // ページ番号を更新する
        } else {
            // 次のページの結果を取得する
            handleNextSearch(nextSearchIndex);
        }
    };

    /**
     *  前のページの結果を表示する
     */
    const handlePrevButton = () => {
        const prevPage = currentPage - 1; // 前のページ番号
        if (prevPage < 1) return;
        const index = (prevPage - 1) * COUNT_BY_PAGE; // 前のページの開始インデックス
        setCurrentResults(searchResults.slice(index, index + COUNT_BY_PAGE)); // 前のページの結果を保存する
        setCurrentPage(prevPage); // ページ番号を更新する
    };

    /**
     * 検索を行い、結果を表示する
     * @param startIndex 検索開始インデックス
     */
    const handleNextSearch = async (startIndex: number) => {
        console.log('Searching for:', searchQuery);
        let nextIndex = startIndex;
        let results: Book[] = [];
        let requestTimes = 0;

        while (results.length < COUNT_BY_PAGE && requestTimes < 10) {
            // 検索結果が10件未満かつリクエスト回数が10回未満の間ループする
            requestTimes++;
            try {
                const response = await fetch(
                    `https://www.googleapis.com/books/v1/volumes?q=intitle:${searchQuery}&startIndex=${nextIndex}`
                );
                const data: GoogleBooksResponse = await response.json();
                console.log('Search results:', data);

                // レスポンスにitemsがない場合はループを終了
                if (!data.items) break;

                // 追加の結果がない場合はループを終了
                if (data.items.length === 0) break;

                // ISBN-13の識別子を持つ書籍のみを抽出する
                const filteredResults = data.items.filter((book) =>
                    book.volumeInfo.industryIdentifiers?.some((identifier) => identifier.type === 'ISBN_13')
                );

                // 重複を排除する
                const uniqueResults = filteredResults.filter(
                    (book) => !results.some((result) => result.id === book.id)
                );

                // 結果を追加する
                results = [...results, ...uniqueResults];

                if (results.length > 10) {
                    // 10件になるように結果を切り詰める
                    results = results.splice(0, 10);
                    break;
                }

                nextIndex += data.items.length;
            } catch (error) {
                console.error('Error:', error);
                break;
            }
        }

        if (startIndex === 0) {
            // 最初の検索の場合
            setSearchResults(results); // 結果を上書き保存する
            setCurrentPage(1); // ページ番号を更新する
        } else {
            // 2回目以降の検索の場合
            if (results.length > 0) {
                setSearchResults([...searchResults, ...results]); // 結果を追加する
                setCurrentPage(currentPage + 1); // ページ番号を更新する
            }
        }
        setCurrentResults(results); // 現在の結果を保存する
        setNextSearchIndex(nextIndex); // 次のインデックスを保存する
    };

    /**
     * 書籍を登録する
     * @param book 登録する書籍
     */
    const handleRegister = (book: Book) => {
        console.log('Registering book:', book);
        // 登録処理をここに追加
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8">
            <h1 className="text-2xl font-bold mb-4">Search Page</h1>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border p-2 rounded"
                    placeholder="Enter search query"
                />
                <button onClick={() => handleNextSearch(0)} className="bg-blue-500 text-white p-2 rounded">
                    Search
                </button>
            </div>
            {/* 検索結果を表示する */}
            <div className="mt-4">
                {currentResults.map((result) => (
                    <div key={result.id} className="border p-2 rounded mb-2">
                        <h2 className="font-bold">{result.volumeInfo.title}</h2>
                        <p>{result.volumeInfo.authors?.join(', ')}</p>
                        <p>
                            {result.volumeInfo.industryIdentifiers
                                ?.filter((identifier) => identifier.type === 'ISBN_13')
                                .map((identifier) => (
                                    <span key={identifier.identifier}>ISBN: {identifier.identifier}</span>
                                ))}
                        </p>
                        <button
                            onClick={() => handleRegister(result)}
                            className="bg-green-500 text-white p-2 rounded mt-2"
                        >
                            登録
                        </button>
                    </div>
                ))}
            </div>
            {/* ボタンを二つ横に並べて配置 */}
            <div className="flex gap-2 mt-4">
                <button
                    onClick={() => handlePrevButton()}
                    className={`p-2 rounded ${
                        currentPage === 1 ? 'bg-gray-300 text-gray-700' : 'bg-gray-500 text-white'
                    }`}
                    disabled={currentPage === 1}
                >
                    前ページ
                </button>
                <span>{currentPage}</span>
                <span> / </span>
                <span>{Math.ceil(searchResults.length / COUNT_BY_PAGE)}</span>
                <span>ページ</span>
                <button
                    onClick={() => handleNextButton()}
                    className={`p-2 rounded ${
                        currentResults.length < COUNT_BY_PAGE ? 'bg-gray-300 text-gray-700' : 'bg-gray-500 text-white'
                    }`}
                    disabled={currentResults.length < COUNT_BY_PAGE}
                >
                    次ページ
                </button>
            </div>
        </div>
    );
}
