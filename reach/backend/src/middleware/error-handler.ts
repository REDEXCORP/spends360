import { Request, Response, NextFunction } from 'express';

export interface ErrorObject {
    message?: string;
    statusCode?: number;
    details?: any;
}

export const errorHandler = (err: ErrorObject, req: Request, res: Response, _next: NextFunction): void => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        error: message,
    });
};
