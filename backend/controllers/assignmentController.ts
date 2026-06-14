import { Request, Response } from 'express';
import { prisma } from '../config/db';
import fs from 'fs';
import path from 'path';

// Helper to decode Base64 data URLs and save them to /uploads
const saveBase64Files = (fileDataStr: string): string | null => {
    try {
        if (!fileDataStr) return null;
        
        let filesList: { name: string, data: string }[] = [];
        if (fileDataStr.startsWith('[')) {
            filesList = JSON.parse(fileDataStr);
        } else {
            // Single base64 file data or single URL
            return fileDataStr;
        }
        
        const uploadsDir = path.resolve(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const savedFiles: { name: string, data: string }[] = [];
        for (const file of filesList) {
            if (typeof file.data === 'string' && file.data.startsWith('data:')) {
                const matches = file.data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                if (matches && matches.length === 3) {
                    const buffer = Buffer.from(matches[2], 'base64');
                    // Clean file name to prevent directory traversal
                    const baseName = path.basename(file.name);
                    const fileExt = path.extname(baseName);
                    const safeName = Date.now() + '-' + Math.round(Math.random() * 1e9) + fileExt;
                    const filePath = path.join(uploadsDir, safeName);
                    
                    fs.writeFileSync(filePath, buffer);
                    savedFiles.push({
                        name: baseName,
                        data: `/uploads/${safeName}`
                    });
                }
            } else if (typeof file.data === 'string' && file.data.startsWith('/uploads/')) {
                savedFiles.push({
                    name: file.name,
                    data: file.data
                });
            }
        }
        return JSON.stringify(savedFiles);
    } catch (error) {
        console.error("saveBase64Files error:", error);
        return null;
    }
};

export const getAssignments = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id: userId, role, roleId } = req.user;

        if (role === 'teacher') {
            // Teacher sees:
            // 1. Their self assignments
            // 2. Their student assignments
            const assignments = await prisma.assignment.findMany({
                where: { author_id: userId },
                orderBy: { created_at: 'desc' }
            });
            const mapped = assignments.map(a => ({
                ...a,
                file_data: a.file_url
            }));
            return res.json(mapped);
        } else if (role === 'student') {
            // Student sees:
            // 1. Their personal assignments (audience: 'self', author_id: userId)
            // 2. Student assignments created by teachers (audience: 'student', course_code in their enrollments)
            
            // First get enrolled courses
            const enrollments = await prisma.enrollment.findMany({
                where: { usn: roleId },
                select: { course_code: true }
            });
            const courseCodes = enrollments.map(e => e.course_code);

            const assignments = await prisma.assignment.findMany({
                where: {
                    OR: [
                        { audience: 'self', author_id: userId },
                        { audience: 'student', course_code: { in: courseCodes } }
                    ]
                },
                include: {
                    submissions: {
                        where: { student_usn: roleId }
                    }
                },
                orderBy: { created_at: 'desc' }
            });

            // Map standard assignment structure but overlay submission status if it exists
            const mappedAssignments = assignments.map(a => {
                const isPersonal = a.audience === 'self';
                const sub = a.submissions && a.submissions.length > 0 ? a.submissions[0] : null;
                return {
                    id: a.id,
                    type: a.type,
                    title: a.title,
                    description: a.description,
                    due_date: a.due_date,
                    priority: a.priority,
                    course_code: a.course_code,
                    audience: a.audience,
                    status: isPersonal ? a.status : (sub ? sub.status : 'pending'),
                    author_id: a.author_id,
                    created_by_role: a.created_by_role,
                    submission_id: sub ? sub.id : null,
                    file_name: a.file_name,
                    file_url: a.file_url,
                    file_data: a.file_url
                };
            });

            return res.json(mappedAssignments);
        } else {
            return res.json([]);
        }

    } catch (error: any) {
        console.error("getAssignments error:", error);
        return res.status(500).json({ error: error.message || 'Server error fetching assignments' });
    }
};

export const createAssignment = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id: userId, role } = req.user;
        const { type, title, description, due_date, priority, audience, course_code, section, file_name, file_data } = req.body;
        
        let file_url = null;
        if (req.file) {
            file_url = `/uploads/${req.file.filename}`;
        } else if (file_data) {
            file_url = saveBase64Files(file_data);
        }

        const newAssignment = await prisma.assignment.create({
            data: {
                type, // 'self', 'student', 'personal'
                title,
                description,
                due_date: due_date ? new Date(due_date) : null,
                priority: priority || 'Medium',
                status: 'pending',
                created_by_role: role,
                author_id: userId,
                audience, // 'self' or 'student'
                course_code: course_code ? course_code : null,
                section: section ? section : null,
                file_name: file_name ? file_name : (req.file ? req.file.originalname : null),
                file_url: file_url
            }
        });

        const responseData = {
            ...newAssignment,
            file_data: newAssignment.file_url
        };

        return res.status(201).json(responseData);
    } catch (error) {
        console.error("createAssignment error:", error);
        return res.status(500).json({ error: 'Failed to create assignment' });
    }
};

export const updateAssignmentStatus = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id: userId, role, roleId } = req.user;
        const assignmentId = req.params.id;
        const { status } = req.body;

        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId }
        });

        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        if (assignment.audience === 'self') {
            // Must be the owner
            if (assignment.author_id !== userId) return res.status(403).json({ error: 'Forbidden' });
            
            const updated = await prisma.assignment.update({
                where: { id: assignmentId },
                data: { status }
            });
            return res.json(updated);
        } else if (assignment.audience === 'student' && role === 'student') {
            // Upsert submission
            const submission = await prisma.assignmentSubmission.upsert({
                where: {
                    assignment_id_student_usn: {
                        assignment_id: assignmentId,
                        student_usn: roleId
                    }
                },
                update: { status },
                create: {
                    assignment_id: assignmentId,
                    student_usn: roleId,
                    status
                }
            });
            return res.json(submission);
        }

        return res.status(403).json({ error: 'Cannot update this assignment status' });
    } catch (error) {
        console.error("updateAssignmentStatus error:", error);
        return res.status(500).json({ error: 'Failed to update assignment status' });
    }
};

export const deleteAssignment = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id: userId } = req.user;
        const assignmentId = req.params.id;

        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId }
        });

        if (!assignment) return res.status(404).json({ error: 'Not found' });

        if (assignment.author_id !== userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        await prisma.assignment.delete({
            where: { id: assignmentId }
        });

        return res.json({ success: true });
    } catch (error) {
        console.error("deleteAssignment error:", error);
        return res.status(500).json({ error: 'Failed to delete assignment' });
    }
};

export const getAssignmentSubmissions = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id: userId, role } = req.user;
        const assignmentId = req.params.id;

        if (role !== 'teacher') {
            return res.status(403).json({ error: 'Only teachers can access submission rosters' });
        }

        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId }
        });

        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        if (assignment.author_id !== userId) {
            return res.status(403).json({ error: 'You do not have access to this assignment' });
        }

        if (assignment.audience === 'self' || !assignment.course_code) {
            return res.json([]);
        }

        const enrollments = await prisma.enrollment.findMany({
            where: {
                course_code: assignment.course_code,
                ...(assignment.section ? { section: assignment.section } : {})
            },
            include: {
                student: {
                    include: {
                        user: {
                            select: {
                                full_name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });

        const submissions = await prisma.assignmentSubmission.findMany({
            where: { assignment_id: assignmentId }
        });

        const submissionMap = new Map(submissions.map(s => [s.student_usn, s]));

        const roster = enrollments.map(e => {
            const sub = submissionMap.get(e.usn);
            return {
                usn: e.usn,
                full_name: e.student.user.full_name,
                email: e.student.user.email,
                program: e.student.program,
                department: e.student.department,
                section: e.section,
                status: sub ? sub.status : 'pending',
                submission_id: sub ? sub.id : null,
                updated_at: sub ? sub.updated_at : null
            };
        });

        return res.json(roster);
    } catch (error: any) {
        console.error("getAssignmentSubmissions error:", error);
        return res.status(500).json({ error: error.message || 'Failed to fetch assignment submissions' });
    }
};

export const updateStudentSubmissionStatus = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id: userId, role } = req.user;
        const assignmentId = req.params.id;
        const studentUsn = req.params.studentUsn;
        const { status } = req.body;

        if (role !== 'teacher') {
            return res.status(403).json({ error: 'Only teachers can override submission status' });
        }

        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId }
        });

        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        if (assignment.author_id !== userId) {
            return res.status(403).json({ error: 'Unauthorized assignment access' });
        }

        const enrollment = await prisma.enrollment.findFirst({
            where: {
                usn: studentUsn,
                course_code: assignment.course_code || undefined
            }
        });

        if (!enrollment) {
            return res.status(400).json({ error: 'Student is not enrolled in this course' });
        }

        const submission = await prisma.assignmentSubmission.upsert({
            where: {
                assignment_id_student_usn: {
                    assignment_id: assignmentId,
                    student_usn: studentUsn
                }
            },
            update: {
                status,
                updated_at: new Date()
            },
            create: {
                assignment_id: assignmentId,
                student_usn: studentUsn,
                status
            }
        });

        return res.json(submission);
    } catch (error: any) {
        console.error("updateStudentSubmissionStatus error:", error);
        return res.status(500).json({ error: error.message || 'Failed to override submission status' });
    }
};

export const sendAssignmentReminder = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id: userId, role } = req.user;
        const assignmentId = req.params.id;
        const { studentUsn } = req.body;

        if (role !== 'teacher') {
            return res.status(403).json({ error: 'Only teachers can send assignment reminders' });
        }

        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId }
        });

        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        if (assignment.author_id !== userId) {
            return res.status(403).json({ error: 'Unauthorized assignment access' });
        }

        const enrollments = await prisma.enrollment.findMany({
            where: {
                course_code: assignment.course_code || undefined,
                ...(assignment.section ? { section: assignment.section } : {}),
                ...(studentUsn ? { usn: studentUsn } : {})
            },
            include: {
                student: {
                    select: {
                        user_id: true
                    }
                }
            }
        });

        const submissions = await prisma.assignmentSubmission.findMany({
            where: { assignment_id: assignmentId }
        });

        const submittedUsns = new Set(
            submissions.filter(s => s.status !== 'pending').map(s => s.student_usn)
        );

        const pendingEnrollments = enrollments.filter(e => !submittedUsns.has(e.usn));

        if (pendingEnrollments.length === 0) {
            return res.json({ message: 'No pending students to remind!' });
        }

        const teacher = await prisma.user.findUnique({
            where: { id: userId },
            select: { full_name: true }
        });
        const teacherName = teacher ? teacher.full_name : 'Your teacher';

        const dueString = assignment.due_date ? new Date(assignment.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'soon';

        const notificationData = pendingEnrollments.map(e => ({
            user_id: e.student.user_id,
            type: 'reminder',
            content: `${teacherName} sent a reminder: Assignment "${assignment.title}" is due on ${dueString}. Please complete and submit your work.`,
            is_read: false
        }));

        await prisma.notification.createMany({
            data: notificationData
        });

        return res.json({ success: true, remindedCount: notificationData.length });
    } catch (error: any) {
        console.error("sendAssignmentReminder error:", error);
        return res.status(500).json({ error: error.message || 'Failed to send reminders' });
    }
};
