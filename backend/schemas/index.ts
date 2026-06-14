import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
});

export const createUserSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    role: z.enum(['Admin', 'Teacher', 'Student', 'Faculty', 'admin', 'teacher', 'student', 'faculty']),
    dept: z.string().min(1, 'Department is required'),
    semester: z.string().optional(),
    subjects: z.array(z.string()).optional()
});

export const updateMarksSchema = z.object({
    marksData: z.array(
        z.object({
            usn: z.string().min(1, 'USN is required'),
            ia1: z.union([z.number().min(0).max(50), z.string()]).optional().nullable(),
            ia2: z.union([z.number().min(0).max(50), z.string()]).optional().nullable(),
            ia3: z.union([z.number().min(0).max(50), z.string()]).optional().nullable(),
            practical: z.union([z.number().min(0).max(100), z.string()]).optional().nullable(),
            final: z.union([z.number().min(0).max(100), z.string()]).optional().nullable()
        })
    )
});

export const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address')
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Token is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters')
});

export const updateProfileSchema = z.object({
    full_name: z.string().min(2).optional(),
    email: z.string().email().optional()
});

export const enrollStudentSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    usn: z.string().min(1, 'USN is required'),
    email: z.string().email('Invalid email address'),
    program: z.string().min(1, 'Program is required'),
    semester: z.union([z.string(), z.number()]).optional(),
    section: z.string().optional()
});

export const markAttendanceSchema = z.object({
    usn: z.string().min(1, 'USN is required'),
    status: z.enum(['present', 'absent']),
    date: z.string().optional()
});

export const batchAttendanceSchema = z.object({
    records: z.array(z.object({
        usn: z.string().min(1),
        status: z.enum(['present', 'absent'])
    })),
    date: z.string().optional()
});

export const createTaskSchema = z.object({
    text: z.string().min(1, 'Task description is required'),
    due_date: z.string().optional().nullable(),
    urgent: z.boolean().optional()
});

export const sendAnnouncementSchema = z.object({
    content: z.string().min(1, 'Announcement content is required'),
    target_course_code: z.string().optional().nullable()
});

export const toggleHolidaySchema = z.object({
    date: z.string().min(1, 'Date is required'),
    course_code: z.string().optional().nullable(),
    description: z.string().optional()
});

export const submitGrievanceSchema = z.object({
    target_type: z.enum(['admin', 'teacher']),
    message: z.string().min(1, 'Message is required'),
    target_emp_id: z.string().optional().nullable(),
    course_code: z.string().optional().nullable()
});

export const respondToGrievanceSchema = z.object({
    response: z.string().min(1, 'Response text is required'),
    status: z.string().optional()
});

export const updateUserSchema = z.object({
    name: z.string().optional(),
    role: z.string().optional(),
    dept: z.string().optional(),
    status: z.enum(['active', 'inactive']).optional()
});

export const createFeeSchema = z.object({
    usn: z.string().min(1, 'USN is required'),
    semester: z.number().int().min(1),
    amount_due: z.number().min(0),
    amount_paid: z.number().min(0).optional(),
    due_date: z.string().optional()
});

export const updateFeeSchema = z.object({
    amount_due: z.number().min(0).optional(),
    amount_paid: z.number().min(0).optional(),
    due_date: z.string().optional(),
    status: z.string().optional()
});

export const createTimetableSchema = z.object({
    course_code: z.string().min(1, 'Course code is required'),
    section: z.string().min(1, 'Section is required'),
    day_of_week: z.string().min(1, 'Day of week is required'),
    start_time: z.string().min(1, 'Start time is required'),
    end_time: z.string().min(1, 'End time is required'),
    room: z.string().min(1, 'Room is required')
});
