import { Book as PrismaBook } from '@prisma/client';

export type BookWithPosted = PrismaBook & {
    isPosted: boolean;
};
