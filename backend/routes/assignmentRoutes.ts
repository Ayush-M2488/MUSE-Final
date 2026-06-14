import { Router } from 'express';
import { 
    getAssignments, 
    createAssignment, 
    updateAssignmentStatus, 
    deleteAssignment,
    getAssignmentSubmissions,
    updateStudentSubmissionStatus,
    sendAssignmentReminder
} from '../controllers/assignmentController';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.use(verifyToken);

// Get assignments for the logged in user (handles both teacher and student logic)
router.get('/', getAssignments);

import { upload } from '../middleware/upload';
// Create an assignment (teacher creating self/student, student creating personal)
router.post('/', upload.single('file'), createAssignment);

// Get roster checklist of submissions for teacher
router.get('/:id/submissions', getAssignmentSubmissions);

// Manually override student's submission status
router.put('/:id/submissions/:studentUsn', updateStudentSubmissionStatus);

// Send reminder alert notification to pending students
router.post('/:id/remind', sendAssignmentReminder);

// Update status (mark as done/submitted)
router.put('/:id/status', updateAssignmentStatus);

// Delete assignment
router.delete('/:id', deleteAssignment);

export default router;
