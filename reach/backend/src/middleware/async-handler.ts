import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ErrorObject } from './error-handler';

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(err => {
            const error: ErrorObject = {
                message: err?.message || 'Internal Server Error',
                statusCode: err?.statusCode || 500,
                details: err,
            };
            next(error);
        });
    };
};
