import { Request, Response, NextFunction } from 'express';

export const requireRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        console.log(`[RBAC] Path: ${req.path}, Method: ${req.method}, User Role: ${req.user?.role}, Allowed: ${allowedRoles}`);
        // Ensure the user object exists (meaning verifyToken ran successfully)
        if (!req.user || !req.user.role) {
            console.log(`[RBAC] Failed: No user role`);
            return res.status(403).json({ error: 'Forbidden: User role not found' });
        }

        // Check if the user's role is in the list of allowed roles for this route
        if (!allowedRoles.includes(req.user.role)) {
            console.log(`[RBAC] Failed: Role mismatch`);
            return res.status(403).json({
                error: `Forbidden: Requires one of [${allowedRoles.join(', ')}]`
            });
        }

        next(); // User is authorized, proceed to the route handler
    };
};