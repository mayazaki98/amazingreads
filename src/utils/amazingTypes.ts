import { Book as PrismaBook, BookPost as PrismaBookPost, User as PrismaUser } from '@prisma/client';

export type PostedByBook = {
    googleId: string;
    existsMyPost: boolean;
    existsSomethingPost: boolean;
};

export type BookWithPosted = PrismaBook & {
    existsMyPost: boolean;
    existsSomethingPost: boolean;
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
