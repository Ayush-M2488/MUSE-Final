import { Router } from 'express';
import {
    getTeacherDashboard,
    getCourseStudents,
    markAttendance,
    markBatchAttendance,
    updateMarks,
    toggleTask,
    createTask,
    deleteTask,
    sendAnnouncement,
    enrollStudent,
    toggleHoliday,
    getDepartmentHub,
    getDepartmentStudents,
    getDepartmentFacultyDetails,
    sendDepartmentAnnouncement,
    assignMentor,
    updateTeacherSettings,
    getMyMentees,
    getMentorshipMessages,
    sendMentorshipMessage,
    getTeacherTimetable,
    updateTimetableEntry
} from '../controllers/teacherController';
import { getTeacherGrievances, respondToGrievance } from '../controllers/grievanceController';
import { verifyToken } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

// Protect all routes in this file
router.use(verifyToken, requireRole(['teacher']));

// GET routes (Read)
router.get('/dashboard', getTeacherDashboard);
router.get('/courses/:courseCode/students', getCourseStudents);
router.get('/hod/hub', getDepartmentHub);
router.get('/hod/students', getDepartmentStudents);
router.get('/hod/faculty/:emp_id', getDepartmentFacultyDetails);

import { validateSchema } from '../middleware/validate';
import { updateMarksSchema, enrollStudentSchema, markAttendanceSchema, batchAttendanceSchema, createTaskSchema, sendAnnouncementSchema, toggleHolidaySchema, respondToGrievanceSchema } from '../schemas';

// POST routes (Create/Update)
router.post('/courses/:courseCode/enroll', validateSchema(enrollStudentSchema), enrollStudent);
router.post('/courses/:courseCode/attendance', validateSchema(markAttendanceSchema), markAttendance);
router.post('/courses/:courseCode/attendance/batch', validateSchema(batchAttendanceSchema), markBatchAttendance);
router.post('/courses/:courseCode/marks', validateSchema(updateMarksSchema), updateMarks);
router.post('/tasks/:taskId/toggle', toggleTask);
router.post('/tasks', validateSchema(createTaskSchema), createTask);
router.delete('/tasks/:taskId', deleteTask);
router.post('/announcements', validateSchema(sendAnnouncementSchema), sendAnnouncement);
router.post('/hod/announcement', validateSchema(sendAnnouncementSchema), sendDepartmentAnnouncement);
router.post('/hod/assign-mentor', assignMentor);
router.post('/holidays/toggle', validateSchema(toggleHolidaySchema), toggleHoliday);
router.put('/settings', updateTeacherSettings);

    // Timetable routes
    router.get('/timetable', getTeacherTimetable);
    router.put('/timetable/:id', updateTimetableEntry);
    
    import { uploadMiddleware } from '../middleware/upload';
    // Mentorship routes
router.get('/mentorship/mentees', getMyMentees);
router.get('/mentorship/mentees/:usn/messages', getMentorshipMessages);
router.post('/mentorship/mentees/:usn/messages', uploadMiddleware, sendMentorshipMessage);

// Grievance routes
router.get('/grievances', getTeacherGrievances);
router.post('/grievances/:id/respond', validateSchema(respondToGrievanceSchema), respondToGrievance);

export default router;