import express from 'express';
import { getDashboardAnalytics, getUsers, createUser, deleteUser, updateUserStatus, updateUser, resetUserPassword, getConfig, updateConfig, generateReport, getCourses, createUsersBulk, assignHod, assignCourseFaculty, toggleFeeStatus, getRiskRoster, listBackups, triggerBackup, downloadBackup, deleteBackup } from '../controllers/adminController';
import { getFees, createFee, deleteFee, updateFee, getTimetables, createTimetable, deleteTimetable } from '../controllers/dataController';
import { getAdminGrievances, respondToGrievance as respondToGrievanceAdmin } from '../controllers/grievanceController';
import { verifyToken } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = express.Router();

router.use(verifyToken);
router.use(requireRole(['admin']));

router.get('/analytics', getDashboardAnalytics);
router.get('/risk-roster', getRiskRoster);

import { validateSchema } from '../middleware/validate';
import { createUserSchema, updateUserSchema, createFeeSchema, updateFeeSchema, createTimetableSchema, respondToGrievanceSchema } from '../schemas';

router.get('/users', getUsers);
router.post('/users', validateSchema(createUserSchema), createUser);
router.post('/users/bulk', createUsersBulk);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/status', updateUserStatus);
router.put('/users/:id', validateSchema(updateUserSchema), updateUser);
router.put('/users/:id/reset-password', resetUserPassword);

router.get('/config', getConfig);
router.post('/config', updateConfig);
router.put('/config', updateConfig);

router.get('/reports/data/:type', generateReport);

router.get('/courses', getCourses);
router.post('/courses/:courseCode/assign', assignCourseFaculty);
router.post('/department/hod', assignHod);

// Data Management (Fees)
router.get('/fees', getFees);
router.post('/fees', validateSchema(createFeeSchema), createFee);
router.delete('/fees/:id', deleteFee);
router.put('/fees/:id', validateSchema(updateFeeSchema), updateFee);
router.put('/fees/:id/toggle', toggleFeeStatus);

// Data Management (Timetable)
router.get('/timetables', getTimetables);
router.post('/timetables', validateSchema(createTimetableSchema), createTimetable);
router.delete('/timetables/:id', deleteTimetable);

// System Backups
router.get('/backups', listBackups);
router.post('/backups/trigger', triggerBackup);
router.get('/backups/download/:filename', downloadBackup);
router.delete('/backups/:filename', deleteBackup);

// Grievances
router.get('/grievances', getAdminGrievances);
router.post('/grievances/:id/respond', validateSchema(respondToGrievanceSchema), respondToGrievanceAdmin);

export default router;
