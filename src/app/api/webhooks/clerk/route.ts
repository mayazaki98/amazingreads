import { prisma } from '@/utils/prisma';
import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { NextRequest } from 'next/server';

export async function POST(req: Request) {
    let evt = null;
    try {
        evt = await verifyWebhook(new NextRequest(req));
    } catch (err) {
        console.error('Error verifying webhook:', err);
        return new Response('Error verifying webhook', { status: 400 });
    }

    switch (evt.type) {
        case 'user.created':
            try {
                await prisma.user.create({
                    data: {
                        id: evt.data.id,
                        email: evt.data.email_addresses[0]?.email_address,
                        name: evt.data.username ?? '',
                        avatarUrl: evt.data.image_url,
                    },
                });
            } catch (error) {
                console.error('Error creating user:', error);
                return new Response('Error creating user', { status: 500 });
            }
            break;

        case 'user.updated':
            try {
                await prisma.user.update({
                    where: { id: evt.data.id },
                    data: {
                        id: evt.data.id,
                        email: evt.data.email_addresses[0]?.email_address,
                        name: evt.data.username ?? '',
                        avatarUrl: evt.data.image_url,
                    },
                });
            } catch (error) {
                console.error('Error updating user:', error);
                return new Response('Error updating user', { status: 500 });
            }
            break;

        case 'user.deleted':
            try {
                await prisma.user.delete({
                    where: { id: evt.data.id },
                });
            } catch (error) {
                console.error('Error deleting user:', error);
                return new Response('Error deleting user', { status: 500 });
            }
            break;

        default:
            console.log('Unhandled event type:', evt.type);
            return new Response('Unhandled event type', { status: 400 });
    }

    return new Response('Webhook received', { status: 200 });
}
