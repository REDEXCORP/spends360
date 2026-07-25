import { Response, Request } from 'express';

export class CookieConfig {
    public static ACCESS_TOKEN_COOKIE_NAME = process.env.AUTH_ACCESS_TOKEN_COOKIE_NAME!

    static setCookie(res: Response, name: string, value: string, maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): void {
        const isProd = process.env.NODE_ENV === 'prod';
        res.cookie(name, value, {
            httpOnly: true,
            secure: isProd,
            sameSite: (isProd ? 'none' : 'lax') as any,
            path: '/',
            maxAge: maxAgeMs,
        });
    }

    static getCookieValue(req: Request, name: string): string | null {
        return req.cookies?.[name] || null;
    }

    static clearCookie(res: Response, name: string): void {
        const isProd = process.env.NODE_ENV === 'prod';
        res.clearCookie(name, {
            httpOnly: true,
            secure: isProd,
            sameSite: (isProd ? 'none' : 'lax') as any,
            path: '/',
        });
    }
}
