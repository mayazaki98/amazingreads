import { Book as PrismaBook, BookPost as PrismaBookPost, User as PrismaUser } from '@prisma/client';

export type BookWithPosted = PrismaBook & {
    isPosted: boolean;
};

export type BookPostWithBook = PrismaBookPost & {
    book: PrismaBook;
};

export type BookWithPostsAndUser = PrismaBook & {
    bookPosts: (PrismaBookPost & {
        user: PrismaUser;
        _count: {
            likes: number;
            replies: number;
        };
    })[];
    _count: {
        bookPosts: number;
    };
};
