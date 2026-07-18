import { RequestHandler } from 'express';
import { ZodError, ZodTypeAny } from 'zod';
import { ParsedQs } from 'qs';
import { ParamsDictionary } from 'express-serve-static-core';

interface Schemas {
    body?: ZodTypeAny;
    query?: ZodTypeAny;
    params?: ZodTypeAny;
}

export const zodValidator = (schemas: Schemas): RequestHandler => {
    return (req, res, next) => {
        try {
            if (schemas.body) req.body = schemas.body.parse(req.body);
            if (schemas.query) req.query = schemas.query.parse(req.query) as ParsedQs;
            if (schemas.params) req.params = schemas.params.parse(req.params) as ParamsDictionary;
            next();
        } catch (err) {
            if (err instanceof ZodError) {
                return res.status(400).json({ error: 'Validation failed', details: err.issues });
            }
            return res.status(500).json({ error: 'Internal server error' });
        }
    };
};
