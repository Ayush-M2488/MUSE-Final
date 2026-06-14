import { Router } from 'express';
import { getStudentDashboard, markNotificationRead, getStudentMentorship, sendMentorshipMessage } from '../controllers/studentController';
import { submitGrievance, getStudentGrievances } from '../controllers/grievanceController';
import { verifyToken } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

// Protected route: Only students can access their dashboard data
router.get('/dashboard', verifyToken, requireRole(['student']), getStudentDashboard);
router.put('/notifications/:id/read', verifyToken, requireRole(['student']), markNotificationRead);

import { uploadMiddleware } from '../middleware/upload';
router.get('/mentorship', verifyToken, requireRole(['student']), getStudentMentorship);
router.post('/mentorship/messages', verifyToken, requireRole(['student']), uploadMiddleware, sendMentorshipMessage);

import { validateSchema } from '../middleware/validate';
import { submitGrievanceSchema } from '../schemas';

router.post('/grievances', verifyToken, requireRole(['student']), validateSchema(submitGrievanceSchema), submitGrievance);
router.get('/grievances', verifyToken, requireRole(['student']), getStudentGrievances);

import { getStudentAIInsights } from '../controllers/studentController';
router.get('/ai-insights', verifyToken, requireRole(['student']), getStudentAIInsights);

export default router;