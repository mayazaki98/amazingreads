import { Book as PrismaBook, BookPost as PrismaBookPost } from '@prisma/client';

export type BookWithPosted = PrismaBook & {
    isPosted: boolean;
};

export type BookPostWithBook = PrismaBookPost & {
    book: PrismaBook;
};
