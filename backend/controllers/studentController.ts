import { Request, Response, RequestHandler } from 'express';
import { prisma } from '../config/db';



export const getStudentDashboard: RequestHandler = async (req, res, next) => {
    const usn = req.user?.roleId; // Extracted from JWT

    if (!usn) {
        res.status(400).json({ error: 'USN not found in token' });
        return;
    }

    try {
        // 1. Fetch Profile
        const student = await prisma.student.findUnique({
            where: { usn },
            include: {
                user: true,
                attendance: true // <-- ADDED: Need attendance to calculate percentages
            }
        });

        if (!student) {
             res.status(404).json({ error: 'Student profile not found' });
             return;
        }

        let mentorName = 'To Be Declared';
        if (student.mentor_id) {
            const mentorUser = await prisma.user.findUnique({ where: { id: student.mentor_id } });
            if (mentorUser) mentorName = mentorUser.full_name;
        }



        // 2. Fetch Subjects & Marks
        let enrollments = await prisma.enrollment.findMany({
            where: { usn },
            include: {
                course: true,
                faculty: {
                    include: {
                        user: true
                    }
                }
            }
        });

        if (enrollments.length === 0) {
            // Fallback to display courses if no faculty exists
            const courses = await prisma.course.findMany({
                where: {
                    department: student.department,
                    semester: student.semester
                }
            });
            enrollments = courses.map(c => ({
                usn: student.usn,
                course_code: c.course_code,
                faculty_emp_id: 'TBD',
                section: 'A',
                course: c,
                faculty: null
            })) as any;
        }

        const assessments = await prisma.assessment.findMany({
            where: { usn }
        });
        const subjects = enrollments.map(e => {
            const courseAsmts = assessments.filter(a => a.course_code === e.course_code);
            const ia1Find = courseAsmts.find(a => a.assessment_type === 'IA-1');
            const ia2Find = courseAsmts.find(a => a.assessment_type === 'IA-2');
            const ia3Find = courseAsmts.find(a => a.assessment_type === 'IA-3');
            const practicalFind = courseAsmts.find(a => a.assessment_type === 'Practical');
            const finalExamFind = courseAsmts.find(a => a.assessment_type === 'Final');
            
            const ia1 = ia1Find ? ia1Find.score.toNumber() : null;
            const ia2 = ia2Find ? ia2Find.score.toNumber() : null;
            const ia3 = ia3Find ? ia3Find.score.toNumber() : null;
            const practical = practicalFind ? practicalFind.score.toNumber() : null;
            const finalExam = finalExamFind ? finalExamFind.score.toNumber() : null;

            // Calculations
            const v1 = ia1 || 0;
            const v2 = ia2 || 0;
            const v3 = ia3 || 0;
            const ia_avg = Math.round((v1 + v2 + v3) / 3);
            const internal_total = ia_avg + (practical || 0);
            const overall_total = internal_total + Math.round((finalExam || 0) / 2);

            const courseAtt = student.attendance.filter(a => a.course_code === e.course_code);
            const totalClasses = courseAtt.length;
            const presentClasses = courseAtt.filter(a => a.status === 'present').length;
            const att = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 100;

            return {
                name: e.course.course_name,
                code: e.course.course_code,
                credits: e.course.credits,
                teacher: e.faculty?.user?.full_name || 'To Be Declared',
                teacherEmpId: e.faculty_emp_id,
                consultation_hours: e.faculty?.consultation_hours || [],
                att,
                ia1,
                ia2,
                ia3,
                ia_avg,
                practical,
                internal_total,
                finalExam,
                overall_total
            };
        });

        // Calculate overall attendance average
        const overallAtt = subjects.length > 0
            ? Math.round(subjects.reduce((sum, s) => sum + s.att, 0) / subjects.length)
            : 0;



        // 3. Fetch Notifications
        const notifRes = await prisma.notification.findMany({
            where: { user_id: student.user_id },
            orderBy: { created_at: 'desc' },
            take: 5
        });

        const notifications = notifRes.map(n => ({
            id: n.id,
            type: n.type,
            read: n.is_read,
            text: n.content,
            time: n.created_at && (new Date().getTime() - n.created_at.getTime() < 86400000) ? 'Today' : 'Older'
        }));

        // Fetch Timetables, Fees, Announcements
        const timetablesData = await prisma.timetable.findMany({
            where: { course_code: { in: enrollments.map(e => e.course_code) } },
            include: { course: true, faculty: { include: { user: true } } }
        });
        let timetable = timetablesData.map(t => ({
            time: `${t.start_time} - ${t.end_time}`,
            subject: t.course.course_name,
            room: t.room,
            faculty: t.faculty.user.full_name
        }));

        const feesData = await prisma.fee.findMany({ where: { usn } });
        let feeStatus = 'Not Assigned';
        if (feesData.length > 0) {
            if (feesData.every(f => f.status === 'Clear')) {
                feeStatus = 'Clear';
            } else if (feesData.some(f => f.status === 'Pending' || f.status === 'Overdue')) {
                feeStatus = 'Pending';
            }
        }

        const announcementsData = await prisma.announcement.findMany({
            where: {
                OR: [
                    {
                        target_audience: 'students',
                        OR: [
                            { target_course_code: null },
                            { target_course_code: { in: enrollments.map(e => e.course_code) } }
                        ]
                    },
                    {
                        target_audience: 'department',
                        target_course_code: student.department
                    }
                ]
            },
            orderBy: { created_at: 'desc' },
            include: { author: true }
        });

        // 4. Fetch Global Configuration
        const sysConfigs = await prisma.systemConfig.findMany();
        const configMap: Record<string, string> = {};
        sysConfigs.forEach(c => {
            configMap[c.key] = c.value;
        });

        // 5. Construct Response
        const dashboardData = {
            globalConfig: {
                ay: configMap['ay'] || '2024-25',
                minAtt: configMap['minAtt'] || '75',
                semStart: configMap['semStart'] || '2024-08-01',
                semEnd: configMap['semEnd'] || '2024-12-15',
                feeDueDate: configMap['feeDueDate'] || ''
            },
            user_id: student.user_id,
            name: student.user.full_name,
            usn: student.usn,
            program: student.program,
            semester: `${student.semester}th Semester`,
            mentor: mentorName,
            email: student.user.email,
            phone: student.phone || '+91 XXXXX XXXXX',
            fees: feeStatus,
            feesList: feesData,
            cgpa: student.cgpa?.toNumber() || 0,
            attendance: overallAtt,
            subjects: subjects,
            timetable: timetable,
            announcements: announcementsData.map(a => ({
                id: a.id,
                title: a.title,
                content: a.content,
                author: a.author.full_name,
                date: a.created_at ? new Date(a.created_at).toLocaleDateString() : 'Today'
            })),
            notifications: notifications,
            attendanceHistory: student.attendance.map(a => ({
                id: a.id,
                course_code: a.course_code,
                date: a.date.toISOString().split('T')[0],
                status: a.status
            })),
            holidays: (await prisma.holiday.findMany()).filter(h => {
                return enrollments.some(e => {
                    if (h.faculty_emp_id && h.faculty_emp_id !== e.faculty_emp_id) {
                        return false;
                    }
                    if (h.course_code && h.course_code !== e.course_code) {
                        return false;
                    }
                    return true;
                });
            }).map(h => ({
                date: h.date.toISOString().split('T')[0],
                course_code: h.course_code,
                description: h.description
            }))
        };

        res.json(dashboardData);
    } catch (error) {
        console.error('Student Dashboard Error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
};

export const markNotificationRead = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id: userId } = req.user;
        const notificationId = req.params.id;

        const updated = await prisma.notification.updateMany({
            where: {
                id: notificationId,
                user_id: userId
            },
            data: {
                is_read: true
            }
        });

        return res.json({ success: true, count: updated.count });
    } catch (error) {
        console.error('markNotificationRead error:', error);
        return res.status(500).json({ error: 'Failed to mark notification as read' });
    }
};

// --- MENTORSHIP ROUTES ---
export const getStudentMentorship = async (req: Request, res: Response): Promise<any> => {
    const userId = req.user?.id;
    try {
        const student = await prisma.student.findUnique({
            where: { user_id: userId },
            include: { 
                user: true,
                mentor: {
                    select: { full_name: true, role: true, email: true }
                } 
            }
        });
        
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const messages = await prisma.mentorshipMessage.findMany({
            where: { student_id: userId },
            orderBy: { sent_at: 'asc' },
            include: { sender: { select: { full_name: true, role: true } } }
        });

        return res.json({
            mentor: student.mentor,
            messages
        });
    } catch (error) {
        console.error('Get Mentorship Error:', error);
        return res.status(500).json({ error: 'Failed to fetch mentorship data' });
    }
};

export const sendMentorshipMessage = async (req: Request, res: Response): Promise<any> => {
    const userId = req.user?.id;
    const { content } = req.body;
    const file = req.file;
    
    try {
        const student = await prisma.student.findUnique({ where: { user_id: userId } });
        if (!student || !student.mentor_id) {
            return res.status(400).json({ error: 'No mentor assigned' });
        }
        
        const message = await prisma.mentorshipMessage.create({
            data: {
                student_id: userId,
                mentor_id: student.mentor_id,
                sender_id: userId,
                content: content || '',
                file_url: file ? `/uploads/${file.filename}` : null,
                file_name: file ? file.originalname : null
            },
            include: { sender: { select: { full_name: true, role: true } } }
        });
        
        const io = req.app.get('io');
        if (io) {
            io.to(`mentorship_${userId}`).emit('receive_message', message);
        }

        return res.json(message);
    } catch (error) {
        console.error('Send Mentorship Message Error:', error);
        return res.status(500).json({ error: 'Failed to send message' });
    }
};
export const getStudentAIInsights: RequestHandler = async (req, res, next) => {
    const usn = req.user?.roleId;

    if (!usn) {
        res.status(400).json({ error: 'USN not found in token' });
        return;
    }

    try {
        const allPredictions = await prisma.prediction.findMany({
            where: { usn },
            include: { explanations: true },
            orderBy: { predicted_at: 'desc' }
        });

        if (!allPredictions || allPredictions.length === 0) {
            res.json({ predictions: [] });
            return;
        }

        // Get only the latest prediction per course
        const seenCourses = new Set();
        const latestPredictions = [];
        for (const p of allPredictions) {
            if (!seenCourses.has(p.course_code)) {
                seenCourses.add(p.course_code);
                latestPredictions.push({
                    usn: p.usn,
                    course_code: p.course_code,
                    risk_level: p.risk_level,
                    risk_score: p.risk_score?.toNumber() || 0,
                    explanation_text: p.explanation_text,
                    predicted_at: p.predicted_at,
                    factors: p.explanations.map(e => ({
                        feature: e.feature_name,
                        value: e.feature_value?.toNumber() || 0,
                        impact: e.impact_description,
                        shap: e.shap_value?.toNumber() || 0
                    }))
                });
            }
        }

        res.json({ predictions: latestPredictions });
    } catch (error) {
        console.error('Fetch Student AI Insights Error:', error);
        res.status(500).json({ error: 'Failed to fetch AI insights' });
    }
};
