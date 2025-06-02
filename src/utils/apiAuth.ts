import { verifyToken } from '@clerk/nextjs/server';

export async function apiAuth(req: Request): Promise<{ errorResponse: Response | null; userId: string | null }> {
    let errorResponse: Response | null = null;
    let userId: string | null = null;

    // Authorization ヘッダーから Bearer トークンを取得
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        errorResponse = Response.json({ error: 'Unauthorized' }, { status: 401 });
        return { errorResponse, userId };
    }
    const token = authHeader.split(' ')[1];
    console.log('Token token:', token);

    try {
        // トークンを検証
        const payload = await verifyToken(token, {
            jwtKey: process.env.CLERK_JWT_KEY,
            authorizedParties: ['http://localhost:3000', 'https://amazingreads.vercel.app'],
        });
        console.log('Token payload:', payload);

        // 認証成功時は userId を取得
        userId = payload.sub;
        if (!userId) {
            errorResponse = Response.json({ error: 'Unauthorized' }, { status: 401 });
            return { errorResponse, userId };
        }

        return { errorResponse, userId };
    } catch (error) {
        console.error('Token verification failed:', error);
        errorResponse = Response.json({ error: 'Unauthorized' }, { status: 401 });
        return { errorResponse, userId };
    }
}
