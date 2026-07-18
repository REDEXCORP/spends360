import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../infrastructure/auth';
import { CookieConfig } from '../infrastructure/cookie';

declare global {
    namespace Express {
        interface Request {
            user: {
                userId: number;
                workspaceId: number | null;
                role: string | null;
            };
        }
    }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.cookies?.[CookieConfig.ACCESS_TOKEN_COOKIE_NAME];

        if (!token || !process.env.JWT_SECRET) {
            return next({
                message: 'Access denied: No token provided',
                statusCode: 401,
            });
        }

        const decoded = AuthService.validateAndExtractClaims(token, process.env.JWT_SECRET!);

        req.user = {
            userId: parseInt(decoded.sub),
            workspaceId: Number(decoded.workspaceId),
            role: String(decoded.role),
        };

        next();
    } catch (error) {
        console.log(error);
        next({ message: 'Authentication error', statusCode: 401 });
    }
};
