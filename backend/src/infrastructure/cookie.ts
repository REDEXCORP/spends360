import { Response, Request } from 'express';

export class CookieConfig {
    public static readonly ACCESS_TOKEN_COOKIE_NAME = 'access_token_reach';

    static setCookie(res: Response, name: string, value: string, maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): void {
        const isProd = process.env.NODE_ENV === 'production';
        res.cookie(name, value, {
            httpOnly: true,
            secure: isProd,
            sameSite: (isProd ? 'none' : 'lax') as any,
            domain: isProd ? '.dezyit.com' : undefined,
            path: '/',
            maxAge: maxAgeMs,
        });
    }

    static getCookieValue(req: Request, name: string): string | null {
        return req.cookies?.[name] || null;
    }

    static clearCookie(res: Response, name: string): void {
        const isProd = process.env.NODE_ENV === 'production';
        const cookieOptions = {
            httpOnly: true,
            secure: isProd,
            sameSite: (isProd ? 'none' : 'lax') as any,
            domain: isProd ? '.dezyit.com' : undefined,
            path: '/',
        };

        res.clearCookie(name, cookieOptions);
    }
}
