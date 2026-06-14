import { Router } from 'express';
import { logIntervention, getStudentInterventions, getAdminAuditLogs, sendStudentMessage, updateInterventionStatus } from '../controllers/interventionController';
import { verifyToken } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();
router.use(verifyToken);

// Teachers can log interventions
router.post('/', requireRole(['teacher']), logIntervention);
router.put('/:id', requireRole(['teacher', 'admin']), updateInterventionStatus);

// Teachers can send direct messages to individual students
router.post('/student/:usn/message', requireRole(['teacher']), sendStudentMessage);

// Teachers and Students can view a specific student's history
router.get('/student/:usn', requireRole(['teacher', 'student']), getStudentInterventions);

// Only Admins can see the global audit trail
router.get('/admin/audit', requireRole(['admin']), getAdminAuditLogs);

export default router;