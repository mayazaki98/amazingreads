import { Like, Book as PrismaBook, BookPost as PrismaBookPost, User as PrismaUser, Reply } from '@prisma/client';

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
    _count: {
        bookPosts: number;
    };
    bookPosts: (PrismaBookPost & {
        _count: {
            likes: number;
            replies: number;
        };
        user: PrismaUser;
        likes: Like[];
        replies: (Reply & {
            user: PrismaUser;
        })[];
    })[];
};
