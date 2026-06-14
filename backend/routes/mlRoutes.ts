import { Router } from 'express';
import { generateCoursePredictions, getCoursePredictions, getStudentRisk } from '../controllers/mlController';
import { verifyToken } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.use(verifyToken);

// Teacher Routes
router.post('/courses/:courseCode/predict', requireRole(['teacher']), generateCoursePredictions);
router.get('/courses/:courseCode/predictions', requireRole(['teacher']), getCoursePredictions);

// Student Routes
router.get('/student/risk', requireRole(['student']), getStudentRisk);

export default router;