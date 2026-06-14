import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

// These routes verify that RBAC is working correctly.
// They require a valid JWT AND a specific role.

router.get('/student-only', verifyToken, requireRole(['student']), (req: Request, res: Response) => {
    res.json({ message: 'Welcome Student', user: req.user });
});

router.get('/teacher-only', verifyToken, requireRole(['teacher']), (req: Request, res: Response) => {
    res.json({ message: 'Welcome Teacher', user: req.user });
});

router.get('/admin-only', verifyToken, requireRole(['admin']), (req: Request, res: Response) => {
    res.json({ message: 'Welcome Admin', user: req.user });
});

export default router;