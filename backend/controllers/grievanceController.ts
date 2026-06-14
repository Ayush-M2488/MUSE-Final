import { Request, Response, RequestHandler } from 'express';
import { prisma } from '../config/db';

export const submitGrievance: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const usn = req.user?.roleId;
    const { target_type, target_emp_id, course_code, message } = req.body;

    if (!usn) {
        res.status(400).json({ error: 'USN not found in session token.' });
        return;
    }

    if (!message || !message.trim()) {
        res.status(400).json({ error: 'Grievance message cannot be empty.' });
        return;
    }

    if (target_type !== 'admin' && target_type !== 'teacher') {
        res.status(400).json({ error: 'Invalid target type. Must be admin or teacher.' });
        return;
    }

    try {
        // If teacher, validate student enrollment with that teacher for that course
        if (target_type === 'teacher') {
            if (!target_emp_id || !course_code) {
                res.status(400).json({ error: 'Teacher ID and Course Code are required for teacher-targeted grievances.' });
                return;
            }

            const enrollment = await prisma.enrollment.findUnique({
                where: {
                    usn_course_code: {
                        usn,
                        course_code
                    }
                }
            });

            if (!enrollment || enrollment.faculty_emp_id !== target_emp_id) {
                res.status(400).json({ error: 'You are not enrolled in this course with the specified teacher.' });
                return;
            }
        }

        const grievance = await prisma.grievance.create({
            data: {
                student_usn: usn,
                target_type,
                target_emp_id: target_type === 'teacher' ? target_emp_id : null,
                course_code: target_type === 'teacher' ? course_code : null,
                message: message.trim(),
                status: 'pending'
            },
            include: {
                course: true,
                faculty: {
                    include: {
                        user: true
                    }
                }
            }
        });

        res.status(201).json(grievance);
    } catch (error) {
        console.error('Submit Grievance Error:', error);
        res.status(500).json({ error: 'Failed to submit grievance.' });
    }
};

export const getStudentGrievances: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const usn = req.user?.roleId;

    if (!usn) {
        res.status(400).json({ error: 'USN not found in session token.' });
        return;
    }

    try {
        const grievances = await prisma.grievance.findMany({
            where: { student_usn: usn },
            orderBy: { created_at: 'desc' },
            include: {
                course: true,
                faculty: {
                    include: {
                        user: true
                    }
                }
            }
        });

        res.json(grievances);
    } catch (error) {
        console.error('Get Student Grievances Error:', error);
        res.status(500).json({ error: 'Failed to fetch grievances.' });
    }
};

export const getTeacherGrievances: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const emp_id = req.user?.roleId;

    if (!emp_id) {
        res.status(400).json({ error: 'Employee ID not found in session token.' });
        return;
    }

    try {
        const grievances = await prisma.grievance.findMany({
            where: {
                target_type: 'teacher',
                target_emp_id: emp_id
            },
            orderBy: { created_at: 'desc' },
            include: {
                course: true,
                student: {
                    include: {
                        user: true
                    }
                }
            }
        });

        res.json(grievances);
    } catch (error) {
        console.error('Get Teacher Grievances Error:', error);
        res.status(500).json({ error: 'Failed to fetch grievances.' });
    }
};

export const getAdminGrievances: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const grievances = await prisma.grievance.findMany({
            where: { target_type: 'admin' },
            orderBy: { created_at: 'desc' },
            include: {
                student: {
                    include: {
                        user: true
                    }
                }
            }
        });

        res.json(grievances);
    } catch (error) {
        console.error('Get Admin Grievances Error:', error);
        res.status(500).json({ error: 'Failed to fetch grievances.' });
    }
};

export const respondToGrievance: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { response } = req.body;
    const role = req.user?.role;
    const roleId = req.user?.roleId;

    if (!response || !response.trim()) {
        res.status(400).json({ error: 'Response message cannot be empty.' });
        return;
    }

    try {
        const grievance = await prisma.grievance.findUnique({
            where: { id },
            include: {
                student: true
            }
        });

        if (!grievance) {
            res.status(404).json({ error: 'Grievance not found.' });
            return;
        }

        // Authorization check
        if (role === 'teacher') {
            if (grievance.target_type !== 'teacher' || grievance.target_emp_id !== roleId) {
                res.status(403).json({ error: 'Unauthorized: You can only respond to grievances directed to you.' });
                return;
            }
        } else if (role === 'admin') {
            if (grievance.target_type !== 'admin') {
                res.status(403).json({ error: 'Unauthorized: You can only respond to grievances directed to admins.' });
                return;
            }
        } else {
            res.status(403).json({ error: 'Unauthorized: Only teachers and admins can respond to grievances.' });
            return;
        }

        const updatedGrievance = await prisma.grievance.update({
            where: { id },
            data: {
                response: response.trim(),
                status: 'resolved',
                updated_at: new Date()
            },
            include: {
                course: true,
                faculty: {
                    include: {
                        user: true
                    }
                }
            }
        });

        // Send a system notification to the student
        await prisma.notification.create({
            data: {
                user_id: grievance.student.user_id,
                type: 'grievance',
                content: `Your grievance has been resolved by ${role === 'admin' ? 'the System Administrator' : 'your teacher'}.`
            }
        });

        res.json(updatedGrievance);
    } catch (error) {
        console.error('Respond to Grievance Error:', error);
        res.status(500).json({ error: 'Failed to submit response.' });
    }
};
