import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validateSchema = (schema: AnyZodObject) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                console.log('ZOD VALIDATION FAILED:', error.errors);
                 res.status(400).json({
                    error: 'Validation failed',
                    details: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
                });
                return;
            }
             res.status(400).json({ error: 'Internal validation error' });
             return;
        }
    };
};
