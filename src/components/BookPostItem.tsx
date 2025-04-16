import { BookPostWithBook } from '@/utils/amazingTypes';
import { ReadStatus } from '@prisma/client';
import Image from 'next/image';

type Props = {
    post: BookPostWithBook;
    handleDelete: (post: BookPostWithBook) => Promise<void>;
    handleEdit: (post: BookPostWithBook) => void;
};

const BookPostItem = ({ post, handleDelete, handleEdit }: Props) => {
    const statusOptions = [
        { value: ReadStatus.PLAN_TO_READ, label: '読みたい' },
        { value: ReadStatus.READING, label: '読書中' },
        { value: ReadStatus.COMPLETED, label: '読み終わった' },
    ];
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
            <div className="p-4">
                <div className="flex gap-4">
                    {post.book.thumbnail && (
                        <div className="relative w-24 h-32 flex-shrink-0">
                            <Image
                                src={post.book.thumbnail}
                                alt={post.book.title}
                                fill
                                sizes="(max-width: 768px) 96px, 96px"
                                className="object-cover rounded-md"
                            />
                        </div>
                    )}
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 line-clamp-2">{post.book.title}</h2>
                        <div className="flex gap-1 mb-5">
                            {[1, 2, 3, 4, 5].map(
                                (rank) =>
                                    post.rank &&
                                    post.rank >= rank && (
                                        <div
                                            key={rank}
                                            className="w-5 h-5 rounded-full bg-yellow-400 transition-colors"
                                        />
                                    )
                            )}
                        </div>
                        <div className="flex gap-1 mb-2">
                            {statusOptions.map(
                                (status) => post.status === status.value && <div key={status.value}>{status.label}</div>
                            )}
                        </div>
                        <p className="text-gray-500 text-sm mb-4 line-clamp-3">{post.comment}</p>
                        <div className="flex gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(post);
                                }}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition cursor-pointer"
                            >
                                編集
                            </button>
                            <button
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    handleDelete(post);
                                }}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition cursor-pointer"
                            >
                                削除
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookPostItem;
