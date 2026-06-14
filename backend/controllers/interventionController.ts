import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const logIntervention = async (req: Request, res: Response): Promise<void> => {
    const empId = req.user.roleId;
    const userId = req.user.id;
    const { usn, action_taken, notes, prediction_id } = req.body;

    try {
        const intervention = await prisma.$transaction(async (tx) => {
            // 1. Insert the intervention
            const newIntervention = await tx.intervention.create({
                data: {
                    usn,
                    faculty_emp_id: empId,
                    prediction_id: prediction_id || null,
                    action_taken,
                    notes,
                    status: 'open'
                }
            });

            // 2. Create the immutable Audit Log
            await tx.auditLog.create({
                data: {
                    user_id: userId,
                    action: 'CREATED_INTERVENTION',
                    entity_type: 'intervention',
                    entity_id: newIntervention.id,
                    details: { action_taken, usn, notes }
                }
            });

            return newIntervention;
        });

        res.json({ success: true, intervention });
    } catch (error) {
        console.error('Intervention Error:', error);
        res.status(500).json({ error: 'Failed to log intervention' });
    }
};

export const getStudentInterventions = async (req: Request, res: Response): Promise<void> => {
    const { usn } = req.params;
    try {
        const interventions = await prisma.intervention.findMany({
            where: { usn },
            orderBy: { created_at: 'desc' },
            include: {
                faculty: {
                    include: {
                        user: {
                            select: { full_name: true }
                        }
                    }
                }
            }
        });

        // Map to match the previous raw SQL output format
        const formatted = interventions.map(i => ({
            id: i.id,
            action_taken: i.action_taken,
            notes: i.notes,
            status: i.status,
            created_at: i.created_at,
            faculty_name: i.faculty.user.full_name
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Fetch Interventions Error:', error);
        res.status(500).json({ error: 'Failed to fetch interventions' });
    }
};

export const getAdminAuditLogs = async (req: Request, res: Response): Promise<void> => {
    try {
        const logs = await prisma.auditLog.findMany({
            orderBy: { created_at: 'desc' },
            take: 50,
            include: {
                user: {
                    select: { full_name: true, role: true }
                }
            }
        });

        // Map to match the previous raw SQL output format
        const formatted = logs.map(a => ({
            id: a.id,
            actor_name: a.user?.full_name || 'System',
            actor_role: a.user?.role || 'system',
            action: a.action,
            entity_type: a.entity_type,
            details: a.details,
            created_at: a.created_at
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Fetch Audit Logs Error:', error);
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
};

export const sendStudentMessage = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id;
    const { usn } = req.params;
    const { message, type } = req.body;

    try {
        const student = await prisma.student.findUnique({
            where: { usn },
            include: { user: true }
        });

        if (!student) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }

        const teacherUser = await prisma.user.findUnique({
            where: { id: userId }
        });
        const teacherName = teacherUser?.full_name || 'Faculty';

        await prisma.$transaction(async (tx) => {
            // Create direct notification for the student
            await tx.notification.create({
                data: {
                    user_id: student.user_id,
                    type: type || 'Teacher Message',
                    content: `Personal Guidance from teacher ${teacherName}: "${message}"`,
                    is_read: false
                }
            });

            // Create the immutable Audit Log
            await tx.auditLog.create({
                data: {
                    user_id: userId,
                    action: 'TEACHER_DIRECT_MESSAGE',
                    entity_type: 'student',
                    entity_id: student.user_id,
                    details: { action: 'TEACHER_DIRECT_MESSAGE', usn, message, type }
                }
            });
        });

        res.json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error('Failed to send student message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
};

export const updateInterventionStatus = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const intervention = await prisma.intervention.update({
            where: { id },
            data: { status }
        });
        res.json({ success: true, intervention });
    } catch (error) {
        console.error('Update Intervention Status Error:', error);
        res.status(500).json({ error: 'Failed to update intervention status' });
    }
};