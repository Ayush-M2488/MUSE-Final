import { Request, Response, RequestHandler } from 'express';
import { prisma } from '../config/db';

// --- FEES ---
export const getFees: RequestHandler = async (req, res, next) => {
    try {
        const fees = await prisma.fee.findMany({ include: { student: { include: { user: true } } } });
        res.json(fees);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch fees' });
    }
};

export const createFee: RequestHandler = async (req, res, next) => {
    const { usn, semester, amount_due, amount_paid, due_date, status } = req.body;
    try {
        const parsedAmountDue = parseFloat(amount_due);
        const parsedAmountPaid = parseFloat(amount_paid);
        let finalStatus = status;
        if (parsedAmountPaid < parsedAmountDue) {
            finalStatus = 'Pending';
        } else if (parsedAmountPaid >= parsedAmountDue && parsedAmountDue > 0) {
            finalStatus = 'Clear';
        }

        const fee = await prisma.fee.create({
            data: {
                usn,
                semester: parseInt(semester),
                amount_due: parsedAmountDue,
                amount_paid: parsedAmountPaid,
                due_date: due_date ? new Date(due_date) : null,
                status: finalStatus
            }
        });
        res.json({ success: true, fee });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create fee record' });
    }
};

export const deleteFee: RequestHandler = async (req, res, next) => {
    const { id } = req.params;
    try {
        await prisma.fee.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete fee' });
    }
};

export const updateFee: RequestHandler = async (req, res, next) => {
    const { id } = req.params;
    const { semester, amount_due, amount_paid, status, due_date } = req.body;
    try {
        const existingFee = await prisma.fee.findUnique({ where: { id } });
        if (!existingFee) {
            res.status(404).json({ error: 'Fee record not found' });
            return;
        }

        const finalAmountDue = amount_due !== undefined ? parseFloat(amount_due) : Number(existingFee.amount_due);
        const finalAmountPaid = amount_paid !== undefined ? parseFloat(amount_paid) : Number(existingFee.amount_paid);
        
        let finalStatus = status !== undefined ? status : existingFee.status;
        if (finalAmountPaid < finalAmountDue) {
            finalStatus = 'Pending';
        } else if (finalAmountPaid >= finalAmountDue && finalAmountDue > 0) {
            finalStatus = 'Clear';
        }

        const fee = await prisma.fee.update({
            where: { id },
            data: {
                semester: semester !== undefined ? parseInt(semester, 10) : undefined,
                amount_due: finalAmountDue,
                amount_paid: finalAmountPaid,
                status: finalStatus,
                due_date: due_date !== undefined ? (due_date ? new Date(due_date) : null) : undefined
            }
        });
        res.json({ success: true, fee });
    } catch (error) {
        console.error('Update Fee Error:', error);
        res.status(500).json({ error: 'Failed to update fee record' });
    }
};

// --- TIMETABLE ---
export const getTimetables: RequestHandler = async (req, res, next) => {
    try {
        const timetables = await prisma.timetable.findMany({
            include: { course: true, faculty: { include: { user: true } } }
        });
        res.json(timetables);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch timetables' });
    }
};

export const createTimetable: RequestHandler = async (req, res, next) => {
    const { course_code, faculty_emp_id, day_of_week, start_time, end_time, room } = req.body;
    try {
        const timetable = await prisma.timetable.create({
            data: {
                course_code,
                faculty_emp_id,
                day_of_week,
                start_time,
                end_time,
                room
            }
        });
        res.json({ success: true, timetable });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create timetable' });
    }
};

export const deleteTimetable: RequestHandler = async (req, res, next) => {
    const { id } = req.params;
    try {
        await prisma.timetable.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete timetable' });
    }
};
