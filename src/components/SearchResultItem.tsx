import { BookWithPosted } from '@/utils/amazingTypes';
import { Book } from '@prisma/client';
import Image from 'next/image';

type Props = {
    book: BookWithPosted;
    handleRegister: (book: Book) => Promise<void>;
};

const SearchResultItem = ({ book, handleRegister }: Props) => {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
            <div className="p-4">
                <div className="flex gap-4">
                    {book.thumbnail && (
                        <div className="relative w-24 h-32 flex-shrink-0">
                            <Image
                                src={book.thumbnail}
                                alt={book.title}
                                fill
                                sizes="(max-width: 768px) 96px, 96px"
                                className="object-cover rounded-md"
                            />
                        </div>
                    )}
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{book.title}</h2>
                        <p className="text-gray-600 mb-2 line-clamp-1">{book.authors}</p>
                        <p className="text-gray-500 text-sm mb-4 line-clamp-3">{book.description}</p>
                        {!book.isPosted && (
                            <button
                                onClick={() => handleRegister(book)}
                                className="w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white py-2 rounded-md transition-colors duration-200 cursor-pointer hover:shadow-md active:shadow-sm"
                            >
                                登録
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchResultItem;
