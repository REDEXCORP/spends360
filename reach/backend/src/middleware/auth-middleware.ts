import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../infrastructure/auth';
import { getCurrentWorkspace } from '../repositories/usersRepository';

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
        const token = req.cookies?.access_token_reach;

        if (!token || !process.env.JWT_SECRET) {
            return next({
                message: 'Access denied: No token provided',
                statusCode: 401,
            });
        }

        const decoded = AuthService.validateAndExtractClaims(token, process.env.JWT_SECRET!);
        const membership = await getCurrentWorkspace(parseInt(decoded.sub));

        req.user = {
            userId: parseInt(decoded.sub),
            workspaceId: membership?.workspaceId ?? decoded.workspaceId ?? null,
            role: membership?.role ?? decoded.role ?? null,
        };

        next();
    } catch (error) {
        console.log(error);
        next({ message: 'Authentication error', statusCode: 401 });
    }
};
