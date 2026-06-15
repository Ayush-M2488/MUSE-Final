import { Request, Response, RequestHandler } from 'express';
import { prisma } from '../config/db';
import bcrypt from 'bcrypt';
import { calculateSGPA } from '../utils/academicMath';

export const getTeacherDashboard: RequestHandler = async (req, res, next) => {
    const empId = req.user?.roleId;
    if (!empId) {
        res.status(400).json({ error: 'Employee ID not found in token' });
        return;
    }
    
    try {
        const faculty = await prisma.faculty.findUnique({
            where: { emp_id: empId },
            include: { user: true }
        });

        if (!faculty) {
             res.status(404).json({ error: 'Teacher profile not found' });
             return;
        }

        const enrollments = await prisma.enrollment.groupBy({
            by: ['course_code', 'section'],
            where: { faculty_emp_id: empId },
            _count: { usn: true }
        });

        const courseCodes = [...new Set(enrollments.map(e => e.course_code))];
        const studentUsns = [...new Set(await prisma.enrollment.findMany({ where: { faculty_emp_id: empId }, select: { usn: true } }).then(res => res.map(r => r.usn)))];
        
        const coursesData = await prisma.course.findMany({
            where: { course_code: { in: courseCodes } }
        });

        const courses = enrollments.map(e => {
            const c = coursesData.find(cd => cd.course_code === e.course_code);
            return {
                code: e.course_code,
                section: e.section || 'A',
                name: c?.course_name || 'Course',
                semester: c?.semester || 1,
                student_count: e._count.usn || 0
            };
        }).sort((a, b) => a.code.localeCompare(b.code));

        const tasks = await prisma.task.findMany({
            where: { faculty_emp_id: empId },
            orderBy: { created_at: 'desc' }
        });

        // Calculate attendance trend
        const allAtt = await prisma.attendance.findMany({
            where: { course_code: { in: courseCodes } }
        });

        let totalAtt = 0, presentAtt = 0;
        const trendMap: Record<string, Record<string, { total: number, present: number }>> = {};
        allAtt.forEach(a => {
            totalAtt++;
            if (a.status === 'present') presentAtt++;

            // Group by simple week for the sake of the trend line (e.g. ISO Week or just rough week)
            const d = new Date(a.date);
            const weekStr = `W${Math.ceil(d.getDate() / 7)}`;
            if (!trendMap[weekStr]) trendMap[weekStr] = {};
            if (!trendMap[weekStr][a.course_code]) trendMap[weekStr][a.course_code] = { total: 0, present: 0 };
            
            trendMap[weekStr][a.course_code].total++;
            if (a.status === 'present') trendMap[weekStr][a.course_code].present++;
        });

        const avgAttendance = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 0;

        // Calculate high risk students
        const highRiskCount = await prisma.student.count({
            where: {
                usn: { in: studentUsns },
                academic_standing: { in: ['Poor', 'Warning', 'Probation'] } // Adding general standing keywords
            }
        });

        const attTrend = Object.keys(trendMap).map(week => {
            const row: any = { week };
            Object.keys(trendMap[week]).forEach(cc => {
                const stat = trendMap[week][cc];
                row[cc] = stat.total > 0 ? parseFloat(((stat.present / stat.total) * 100).toFixed(1)) : 0;
            });
            return row;
        }).sort((a, b) => a.week.localeCompare(b.week));

        const courseEnrolledCounts: Record<string, number> = {};
        enrollments.forEach(e => {
            courseEnrolledCounts[e.course_code] = (courseEnrolledCounts[e.course_code] || 0) + e._count.usn;
        });

        const attCountMap: Record<string, number> = {};
        allAtt.forEach(a => {
            const dateStr = a.date.toISOString().split('T')[0];
            const key = `${a.course_code}_${dateStr}`;
            attCountMap[key] = (attCountMap[key] || 0) + 1;
        });

        const recordedDays: string[] = [];
        const incompleteDays: string[] = [];

        Object.keys(attCountMap).forEach(key => {
            const courseCode = key.split('_')[0];
            const enrolled = courseEnrolledCounts[courseCode] || 0;
            const marked = attCountMap[key];

            if (marked >= enrolled) {
                recordedDays.push(key);
            } else if (marked > 0) {
                incompleteDays.push(key);
            }
        });

        const holidays = await prisma.holiday.findMany({
            where: { faculty_emp_id: empId }
        });

        const sysConfigs = await prisma.systemConfig.findMany();
        const configMap: Record<string, string> = {};
        sysConfigs.forEach(c => {
            configMap[c.key] = c.value;
        });

        res.json({
            globalConfig: {
                ay: configMap['ay'] || '2024-25',
                minAtt: configMap['minAtt'] || '75',
                semStart: configMap['semStart'] || '2024-08-01',
                semEnd: configMap['semEnd'] || '2024-12-15'
            },
            profile: {
                emp_id: faculty.emp_id,
                department: faculty.department,
                designation: faculty.designation,
                name: faculty.user.full_name,
                email: faculty.user.email,
                is_hod: faculty.is_hod,
                custom_thresholds: faculty.custom_thresholds || {},
                notification_prefs: faculty.notification_prefs || {},
                consultation_hours: faculty.consultation_hours || []
            },
            courses,
            kpis: {
                avgAttendance,
                highRiskCount,
                totalUniqueStudents: studentUsns.length
            },
            tasks: tasks.map(t => ({ id: t.id, text: t.text, due: t.due_date, done: t.done, urgent: t.urgent })),
            attTrend,
            recordedDays,
            incompleteDays,
            holidays: holidays.map(h => ({
                date: h.date.toISOString().split('T')[0],
                course_code: h.course_code,
                description: h.description
            }))
        });
    } catch (error) {
        console.error('Teacher Dashboard Error:', error);
        res.status(500).json({ error: 'Failed to fetch teacher dashboard data' });
    }
};

export const enrollStudent: RequestHandler = async (req, res, next) => {
    const empId = req.user?.roleId;
    const { courseCode } = req.params;
    const { name, usn, email, program, semester, section = 'A' } = req.body;

    if (!empId) {
        res.status(400).json({ error: 'Employee ID not found in token' });
        return;
    }

    try {
        await prisma.$transaction(async (tx) => {
            let user = await tx.user.findUnique({ where: { email } });
            if (!user) {
                const password_hash = await bcrypt.hash('password123', 10);
                user = await tx.user.create({
                    data: {
                        email,
                        password_hash,
                        role: 'student',
                        full_name: name
                    }
                });
            }

            let student = await tx.student.findUnique({ where: { usn } });
            if (!student) {
                student = await tx.student.create({
                    data: {
                        usn,
                        user_id: user.id,
                        program,
                        department: 'AI & ML',
                        semester: parseInt(semester, 10) || 1,
                        enrollment_date: new Date()
                    }
                });

                await tx.fee.create({
                    data: {
                        usn: student.usn,
                        semester: student.semester,
                        amount_due: 150000,
                        amount_paid: 0,
                        status: 'Not Assigned',
                        due_date: new Date('2024-09-01')
                    }
                });
            }

            await tx.enrollment.upsert({
                where: {
                    usn_course_code: {
                        usn,
                        course_code: courseCode
                    }
                },
                update: {},
                create: {
                    usn,
                    course_code: courseCode,
                    faculty_emp_id: empId,
                    section
                }
            });
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Enrollment Error:', error);
        res.status(500).json({ error: 'Failed to enroll student' });
    }
};

export const getCourseStudents: RequestHandler = async (req, res, next) => {
    const empId = req.user?.roleId;
    const { courseCode } = req.params;
    const { section, date } = req.query;

    if (!empId) {
        res.status(400).json({ error: 'Employee ID not found in token' });
        return;
    }

    try {
        let dateString = '';
        if (date) {
            dateString = String(date).split('T')[0];
        } else {
            dateString = new Date().toISOString().split('T')[0];
        }
        const targetDate = new Date(`${dateString}T00:00:00.000Z`);
        const nextDay = new Date(targetDate);
        nextDay.setUTCDate(nextDay.getUTCDate() + 1);

        const whereClause: any = { faculty_emp_id: empId };
        if (courseCode !== 'all') {
            whereClause.course_code = courseCode;
            if (section) whereClause.section = section;
        }

        const enrollments = await prisma.enrollment.findMany({
            where: whereClause,
            include: {
                course: true,
                student: {
                    include: {
                        user: true,
                        assessments: {
                            where: courseCode !== 'all' ? { course_code: courseCode } : undefined
                        },
                        attendance: {
                            where: courseCode !== 'all' ? { course_code: courseCode } : undefined
                        },
                        predictions: {
                            orderBy: { predicted_at: 'desc' },
                            take: 1
                        }
                    }
                }
            },
            orderBy: { usn: 'asc' }
        });

        const students = enrollments.map(e => {
            const s = e.student;
            const ia1Find = s.assessments.find(a => a.assessment_type === 'IA-1');
            const ia2Find = s.assessments.find(a => a.assessment_type === 'IA-2');
            const ia3Find = s.assessments.find(a => a.assessment_type === 'IA-3');
            const practicalFind = s.assessments.find(a => a.assessment_type === 'Practical');
            const finalExamFind = s.assessments.find(a => a.assessment_type === 'Final');
            
            const ia1 = ia1Find ? ia1Find.score.toNumber() : null;
            const ia2 = ia2Find ? ia2Find.score.toNumber() : null;
            const ia3 = ia3Find ? ia3Find.score.toNumber() : null;
            const practical = practicalFind ? practicalFind.score.toNumber() : null;
            const finalExam = finalExamFind ? finalExamFind.score.toNumber() : null;
            
            // Attendance computation
            let totalClasses = s.attendance.length;
            let attendedClasses = 0;
            let today_attendance = null;

            s.attendance.forEach(att => {
                if (att.status === 'present') attendedClasses++;
                const attDate = new Date(att.date).getTime();
                if (attDate >= targetDate.getTime() && attDate < nextDay.getTime()) {
                    today_attendance = att.status;
                }
            });

            const attendance_percentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;

            // Health Score Calculation
            let riskMultiplier = 1;
            const riskLevel = s.predictions?.[0]?.risk_level;
            if (riskLevel === 'High') riskMultiplier = 0.6;
            else if (riskLevel === 'Medium') riskMultiplier = 0.8;
            
            let totalMarks = 0;
            let maxMarks = 0;
            if (ia1 !== null) { totalMarks += ia1; maxMarks += 30; }
            if (ia2 !== null) { totalMarks += ia2; maxMarks += 30; }
            if (ia3 !== null) { totalMarks += ia3; maxMarks += 30; }
            if (practical !== null) { totalMarks += practical; maxMarks += 20; }
            const marksPercent = maxMarks > 0 ? (totalMarks / maxMarks) * 100 : 100;
            
            const rawHealth = (attendance_percentage * 0.5) + (marksPercent * 0.5);
            const health_score = Math.round(rawHealth * riskMultiplier);

            return {
                usn: s.usn,
                name: s.user.full_name,
                program: s.program,
                semester: s.semester,
                cgpa: s.cgpa?.toNumber() || 0,
                academic_standing: s.academic_standing,
                course_code: e.course_code,
                section: e.section,
                ia1,
                ia2,
                ia3,
                practical,
                finalExam,
                today_attendance,
                attendance_percentage,
                total_classes: totalClasses,
                attended_classes: attendedClasses,
                health_score,
                risk_level: riskLevel || (s.academic_standing === 'Good' ? 'Low' : 'Medium')
            };
        });

        res.json(students);
    } catch (error) {
        console.error('Course Students Error:', error);
        res.status(500).json({ error: 'Failed to fetch course students' });
    }
};

export const markAttendance: RequestHandler = async (req, res, next) => {
    const empId = req.user?.roleId;
    const { courseCode } = req.params;
    const { usn, status, date } = req.body; 

    if (!empId) {
        res.status(400).json({ error: 'Employee ID not found in token' });
        return;
    }

    // targetDate needs to be a valid Date object, strictly in UTC
    const dateString = date ? String(date).split('T')[0] : new Date().toISOString().split('T')[0];
    const targetDate = new Date(`${dateString}T00:00:00.000Z`);

    if (targetDate.getUTCDay() === 0) {
        res.status(400).json({ error: 'Cannot mark attendance on Sundays' });
        return;
    }

    try {
        const holiday = await prisma.holiday.findFirst({
            where: { 
                date: targetDate,
                OR: [
                    { course_code: null },
                    { course_code: courseCode }
                ]
            }
        });
        if (holiday) {
            res.status(400).json({ error: 'Cannot mark attendance on a declared Holiday for this course' });
            return;
        }
        await prisma.attendance.upsert({
            where: {
                usn_course_code_date: {
                    usn,
                    course_code: courseCode,
                    date: targetDate
                }
            },
            update: { status, recorded_by: empId },
            create: {
                usn,
                course_code: courseCode,
                date: targetDate,
                status,
                recorded_by: empId
            }
        });

        // 1. Calculate new attendance percentage for the student in this course
        const studentAttendance = await prisma.attendance.findMany({
            where: { usn, course_code: courseCode }
        });
        const totalClasses = studentAttendance.length;
        const presentClasses = studentAttendance.filter(a => a.status === 'present').length;
        const attendancePercent = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 100;

        // 2. Fetch faculty preferences & thresholds
        const faculty = await prisma.faculty.findUnique({
            where: { emp_id: empId }
        });

        if (faculty) {
            const prefs = (faculty.notification_prefs as any) || {};
            const autoNotifyAbsentee = prefs.autoNotifyAbsentee === true;

            if (autoNotifyAbsentee) {
                const customThresholds = (faculty.custom_thresholds as any) || {};
                let threshold = customThresholds[courseCode];
                if (threshold === undefined || threshold === null) {
                    const globalMinAtt = await prisma.systemConfig.findUnique({
                        where: { key: 'minAtt' }
                    });
                    threshold = globalMinAtt ? parseInt(globalMinAtt.value) : 75;
                }

                // 3. Send warning notification if student's attendance falls below threshold
                if (attendancePercent < threshold) {
                    const student = await prisma.student.findUnique({
                        where: { usn },
                        include: { user: true }
                    });

                    if (student) {
                        const dateStringToday = new Date().toISOString().split('T')[0];
                        const todayStart = new Date(`${dateStringToday}T00:00:00.000Z`);
                        const todayEnd = new Date(`${dateStringToday}T23:59:59.999Z`);

                        const existingNotification = await prisma.notification.findFirst({
                            where: {
                                user_id: student.user_id,
                                type: 'Attendance Warning',
                                created_at: {
                                    gte: todayStart,
                                    lte: todayEnd
                                },
                                content: {
                                    contains: courseCode
                                }
                            }
                        });

                        if (!existingNotification) {
                            await prisma.notification.create({
                                data: {
                                    user_id: student.user_id,
                                    type: 'Attendance Warning',
                                    content: `Attendance Warning: Your attendance in course ${courseCode} has dropped to ${attendancePercent}%, which is below the required ${threshold}% threshold. Please contact your instructor.`,
                                    is_read: false
                                }
                            });
                        }
                    }
                }
            }
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Attendance Error:', error);
        res.status(500).json({ error: 'Failed to mark attendance' });
    }
};

export const markBatchAttendance: RequestHandler = async (req, res, next) => {
    const empId = req.user?.roleId;
    const { courseCode } = req.params;
    const { records, date } = req.body; // records: { usn: string, status: string }[]

    if (!empId) {
        res.status(400).json({ error: 'Employee ID not found in token' });
        return;
    }

    if (!records || !Array.isArray(records)) {
        res.status(400).json({ error: 'Invalid payload: records array is required' });
        return;
    }

    const dateString = date ? String(date).split('T')[0] : new Date().toISOString().split('T')[0];
    const targetDate = new Date(`${dateString}T00:00:00.000Z`);

    if (targetDate.getUTCDay() === 0) {
        res.status(400).json({ error: 'Cannot mark attendance on Sundays' });
        return;
    }

    try {
        const holiday = await prisma.holiday.findFirst({
            where: { 
                date: targetDate,
                OR: [
                    { course_code: null },
                    { course_code: courseCode }
                ]
            }
        });
        if (holiday) {
            res.status(400).json({ error: 'Cannot mark attendance on a declared Holiday for this course' });
            return;
        }

        await prisma.$transaction(async (tx) => {
            for (const record of records) {
                await tx.attendance.upsert({
                    where: {
                        usn_course_code_date: {
                            usn: record.usn,
                            course_code: courseCode,
                            date: targetDate
                        }
                    },
                    update: { status: record.status, recorded_by: empId },
                    create: {
                        usn: record.usn,
                        course_code: courseCode,
                        date: targetDate,
                        status: record.status,
                        recorded_by: empId
                    }
                });
            }
        });

        res.json({ success: true, message: 'Batch attendance marked successfully' });
    } catch (error) {
        console.error('Batch Attendance Error:', error);
        res.status(500).json({ error: 'Failed to mark batch attendance' });
    }
};

export const updateMarks: RequestHandler = async (req, res, next) => {
    const { courseCode } = req.params;
    const { marksData } = req.body; // Array of { usn, ia1, ia2 }

    try {
        await prisma.$transaction(async (tx) => {
            for (const m of marksData) {
                if (m.ia1 !== undefined && m.ia1 !== null && m.ia1 !== '') {
                    await tx.assessment.upsert({
                        where: {
                            usn_course_code_assessment_type: {
                                usn: m.usn,
                                course_code: courseCode,
                                assessment_type: 'IA-1'
                            }
                        },
                        update: { score: m.ia1 },
                        create: {
                            usn: m.usn,
                            course_code: courseCode,
                            assessment_type: 'IA-1',
                            score: m.ia1,
                            max_score: 30
                        }
                    });
                }
                if (m.ia2 !== undefined && m.ia2 !== null && m.ia2 !== '') {
                    await tx.assessment.upsert({
                        where: {
                            usn_course_code_assessment_type: {
                                usn: m.usn,
                                course_code: courseCode,
                                assessment_type: 'IA-2'
                            }
                        },
                        update: { score: m.ia2 },
                        create: {
                            usn: m.usn,
                            course_code: courseCode,
                            assessment_type: 'IA-2',
                            score: m.ia2,
                            max_score: 30
                        }
                    });
                }
                if (m.ia3 !== undefined && m.ia3 !== null && m.ia3 !== '') {
                    await tx.assessment.upsert({
                        where: {
                            usn_course_code_assessment_type: {
                                usn: m.usn,
                                course_code: courseCode,
                                assessment_type: 'IA-3'
                            }
                        },
                        update: { score: m.ia3 },
                        create: {
                            usn: m.usn,
                            course_code: courseCode,
                            assessment_type: 'IA-3',
                            score: m.ia3,
                            max_score: 30
                        }
                    });
                }
                if (m.practical !== undefined && m.practical !== null && m.practical !== '') {
                    await tx.assessment.upsert({
                        where: {
                            usn_course_code_assessment_type: {
                                usn: m.usn,
                                course_code: courseCode,
                                assessment_type: 'Practical'
                            }
                        },
                        update: { score: m.practical },
                        create: {
                            usn: m.usn,
                            course_code: courseCode,
                            assessment_type: 'Practical',
                            score: m.practical,
                            max_score: 20
                        }
                    });
                }
                if (m.finalExam !== undefined && m.finalExam !== null && m.finalExam !== '') {
                    await tx.assessment.upsert({
                        where: {
                            usn_course_code_assessment_type: {
                                usn: m.usn,
                                course_code: courseCode,
                                assessment_type: 'Final'
                            }
                        },
                        update: { score: m.finalExam },
                        create: {
                            usn: m.usn,
                            course_code: courseCode,
                            assessment_type: 'Final',
                            score: m.finalExam,
                            max_score: 100
                        }
                    });
                }
            }
        });

        // RECALCULATE SGPA (stored in cgpa column) for each affected student
        const usns = [...new Set(marksData.map((m: any) => m.usn))];
        for (const usn of usns) {
            const studentData = await prisma.student.findUnique({
                where: { usn: usn as string },
                include: {
                    enrollments: { include: { course: true } },
                    assessments: { include: { course: true } }
                }
            });

            if (studentData) {
                // Group assessments by course
                const courseGroups: { [code: string]: any } = {};
                for (const e of studentData.enrollments) {
                    courseGroups[e.course_code] = {
                        credits: e.course.credits || 4,
                        marks: { ia1: null, ia2: null, ia3: null, practical: null, final: null }
                    };
                }

                for (const a of studentData.assessments) {
                    if (courseGroups[a.course_code]) {
                        const type = a.assessment_type.toLowerCase().replace(/[-_\s]/g, '');
                        if (type.includes('ia1')) courseGroups[a.course_code].marks.ia1 = Number(a.score);
                        if (type.includes('ia2')) courseGroups[a.course_code].marks.ia2 = Number(a.score);
                        if (type.includes('ia3')) courseGroups[a.course_code].marks.ia3 = Number(a.score);
                        if (type.includes('practical')) courseGroups[a.course_code].marks.practical = Number(a.score);
                        if (type.includes('final')) courseGroups[a.course_code].marks.final = Number(a.score);
                    }
                }

                const sgpa = calculateSGPA(Object.values(courseGroups));
                await prisma.student.update({
                    where: { usn: usn as string },
                    data: { cgpa: sgpa }
                });
            }
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Marks Error:', error);
        res.status(500).json({ error: 'Failed to update marks' });
    }
};

export const toggleTask: RequestHandler = async (req, res, next) => {
    const { taskId } = req.params;
    try {
        const task = await prisma.task.findUnique({ where: { id: taskId } });
        if (task) {
            await prisma.task.update({
                where: { id: taskId },
                data: { done: !task.done }
            });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Toggle Task Error:', error);
        res.status(500).json({ error: 'Failed to toggle task' });
    }
};

export const createTask: RequestHandler = async (req, res, next) => {
    const empId = req.user?.roleId;
    const { text, due_date, urgent } = req.body;
    if (!empId) return;

    try {
        const task = await prisma.task.create({
            data: {
                faculty_emp_id: empId,
                text,
                due_date: due_date || null,
                urgent: !!urgent,
                done: false
            }
        });
        res.json(task);
    } catch (error) {
        console.error('Create Task Error:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
};

export const deleteTask: RequestHandler = async (req, res, next) => {
    const { taskId } = req.params;
    try {
        await prisma.task.delete({ where: { id: taskId } });
        res.json({ success: true });
    } catch (error) {
        console.error('Delete Task Error:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
};

export const sendAnnouncement: RequestHandler = async (req, res, next) => {
    const userId = req.user?.id; // from JWT middleware
    const { content, target_course_code } = req.body;
    
    if (!userId) return;

    try {
        await prisma.announcement.create({
            data: {
                title: 'Teacher Announcement',
                content,
                author_id: userId,
                target_audience: 'students',
                target_course_code: target_course_code || null
            }
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Announcement Error:', error);
        res.status(500).json({ error: 'Failed to send announcement' });
    }
};

export const toggleHoliday: RequestHandler = async (req, res, next) => {
    const { date, course_code, description } = req.body;
    const empId = req.user?.roleId;
    const userId = req.user?.id;

    if (!empId || !userId) {
        res.status(400).json({ error: 'User details not found in token' });
        return;
    }
    if (!date) {
        res.status(400).json({ error: 'Date is required' });
        return;
    }

    const targetDate = new Date(date);
    const courseCodeVal = course_code ? String(course_code) : null;

    try {
        const existing = await prisma.holiday.findFirst({
            where: {
                date: targetDate,
                course_code: courseCodeVal,
                faculty_emp_id: empId
            }
        });

        const announcementText = `Please note that a holiday has been declared on ${targetDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. Description: ${description || existing?.description || 'Holiday declared by Faculty'}.`;

        if (existing) {
            // Delete matching announcements
            const oldAnnouncementText = `Please note that a holiday has been declared on ${targetDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. Description: ${existing.description || 'Holiday declared by Faculty'}.`;
            await prisma.announcement.deleteMany({
                where: {
                    author_id: userId,
                    content: oldAnnouncementText
                }
            });

            await prisma.holiday.delete({
                where: { id: existing.id }
            });
            res.json({ success: true, action: 'removed' });
        } else {
            await prisma.holiday.create({
                data: {
                    date: targetDate,
                    course_code: courseCodeVal,
                    faculty_emp_id: empId,
                    description: description || 'Holiday declared by Faculty'
                }
            });

            // Fetch course codes under this teacher's jurisdiction
            const enrollments = await prisma.enrollment.findMany({
                where: { faculty_emp_id: empId },
                select: { course_code: true }
            });
            const teacherCourseCodes = [...new Set(enrollments.map(e => e.course_code))];

            // Create announcements
            if (courseCodeVal) {
                await prisma.announcement.create({
                    data: {
                        title: `🚨 Holiday Declared: ${courseCodeVal}`,
                        content: announcementText,
                        author_id: userId,
                        target_audience: 'students',
                        target_course_code: courseCodeVal
                    }
                });
            } else {
                for (const courseCode of teacherCourseCodes) {
                    await prisma.announcement.create({
                        data: {
                            title: `🚨 Holiday Declared: ${courseCode}`,
                            content: announcementText,
                            author_id: userId,
                            target_audience: 'students',
                            target_course_code: courseCode
                        }
                    });
                }
            }

            // Delete all attendance entries for this date under their jurisdiction
            await prisma.attendance.deleteMany({
                where: {
                    date: targetDate,
                    course_code: courseCodeVal ? courseCodeVal : { in: teacherCourseCodes }
                }
            });
            res.json({ success: true, action: 'created' });
        }
    } catch (error) {
        console.error('Toggle Holiday Error:', error);
        res.status(500).json({ error: 'Failed to toggle holiday' });
    }
};

// --- HOD ROUTES ---
export const getDepartmentHub: RequestHandler = async (req, res, next) => {
    const empId = req.user?.roleId;
    try {
        const faculty = await prisma.faculty.findUnique({ where: { emp_id: empId } });
        if (!faculty || !faculty.is_hod) {
            res.status(403).json({ error: 'Forbidden: Not an HOD' });
            return;
        }

        const deptStudents = await prisma.student.count({ where: { department: faculty.department } });
        const deptFaculty = await prisma.faculty.count({ where: { department: faculty.department } });
        
        // Risk levels
        const predictions = await prisma.prediction.findMany({
            where: { student: { department: faculty.department } },
            orderBy: { predicted_at: 'desc' },
            distinct: ['usn']
        });
        
        let high = 0, med = 0, low = 0;
        predictions.forEach(p => {
            if (p.risk_level === 'High') high++;
            else if (p.risk_level === 'Medium') med++;
            else low++;
        });

        // Faculty workload
        const allDeptFaculty = await prisma.faculty.findMany({
            where: { department: faculty.department },
            include: { user: true, enrollments: { select: { course_code: true } } }
        });
        
        const workload = allDeptFaculty.map(f => ({
            name: f.user.full_name,
            emp_id: f.emp_id,
            courses: [...new Set(f.enrollments.map(e => e.course_code))].length,
            is_hod: f.is_hod
        }));

        res.json({
            analytics: { totalStudents: deptStudents, totalFaculty: deptFaculty, riskHigh: high, riskMed: med, riskLow: low },
            workload
        });
    } catch (error) {
        console.error('HOD Hub Error:', error);
        res.status(500).json({ error: 'Failed to fetch HOD data' });
    }
};

export const getDepartmentStudents: RequestHandler = async (req, res, next) => {
    const empId = req.user?.roleId;
    try {
        const faculty = await prisma.faculty.findUnique({ where: { emp_id: empId } });
        if (!faculty || !faculty.is_hod) {
            res.status(403).json({ error: 'Forbidden: Not an HOD' });
            return;
        }

        const students = await prisma.student.findMany({
            where: { department: faculty.department },
            include: { user: true, predictions: { orderBy: { predicted_at: 'desc' }, take: 1 } }
        });

        const allDeptFaculty = await prisma.faculty.findMany({
            where: { department: faculty.department }
        });
        const mentorMap: Record<string, string> = {};
        allDeptFaculty.forEach(f => {
            mentorMap[f.user_id] = f.emp_id;
        });

        const mapped = students.map(s => ({
            usn: s.usn,
            name: s.user.full_name,
            semester: s.semester,
            cgpa: parseFloat(s.cgpa?.toString() || '0'),
            risk: s.predictions[0]?.risk_level || 'Low',
            mentor_emp_id: s.mentor_id ? mentorMap[s.mentor_id] : null
        }));

        res.json(mapped);
    } catch (error) {
        console.error('HOD Students Error:', error);
        res.status(500).json({ error: 'Failed to fetch department students' });
    }
};

export const getDepartmentFacultyDetails: RequestHandler = async (req, res, next) => {
    const hodEmpId = req.user?.roleId;
    const targetEmpId = req.params.emp_id;
    try {
        const hod = await prisma.faculty.findUnique({ where: { emp_id: hodEmpId } });
        if (!hod || !hod.is_hod) {
            res.status(403).json({ error: 'Forbidden: Not an HOD' });
            return;
        }

        const faculty = await prisma.faculty.findUnique({
            where: { emp_id: targetEmpId },
            include: { user: true, enrollments: { include: { course: true } } }
        });

        if (!faculty || faculty.department !== hod.department) {
            res.status(404).json({ error: 'Faculty not found in your department' });
            return;
        }

        const uniqueCourses = [];
        const seen = new Set();
        
        for (const e of faculty.enrollments) {
            if (!seen.has(e.course_code)) {
                seen.add(e.course_code);
                
                // Get course stats
                const enrollments = await prisma.enrollment.findMany({ where: { course_code: e.course_code } });
                const totalStudents = enrollments.length;
                
                let avgAttendance = 0;
                const attendance = await prisma.attendance.findMany({ where: { course_code: e.course_code } });
                if (attendance.length > 0) {
                    const present = attendance.filter(a => a.status === 'present').length;
                    avgAttendance = (present / attendance.length) * 100;
                }
                
                const predictions = await prisma.prediction.findMany({
                    where: { course_code: e.course_code },
                    orderBy: { predicted_at: 'desc' },
                    distinct: ['usn']
                });
                const highRisk = predictions.filter(p => p.risk_level === 'High').length;

                uniqueCourses.push({
                    course_code: e.course.course_code,
                    course_name: e.course.course_name,
                    total_students: totalStudents,
                    avg_attendance: avgAttendance,
                    high_risk: highRisk
                });
            }
        }

        res.json({
            emp_id: faculty.emp_id,
            name: faculty.user.full_name,
            designation: faculty.designation,
            courses: uniqueCourses
        });
    } catch (error) {
        console.error('Faculty Details Error:', error);
        res.status(500).json({ error: 'Failed to fetch faculty details' });
    }
};

export const sendDepartmentAnnouncement: RequestHandler = async (req, res, next) => {
    const userId = req.user?.id;
    const hodEmpId = req.user?.roleId;
    const { content } = req.body;
    
    try {
        const hod = await prisma.faculty.findUnique({ where: { emp_id: hodEmpId } });
        if (!hod || !hod.is_hod) {
            res.status(403).json({ error: 'Forbidden: Not an HOD' });
            return;
        }

        await prisma.announcement.create({
            data: {
                title: 'Department Broadcast',
                content,
                author_id: userId,
                target_audience: 'department',
                target_course_code: hod.department // Store department here for easy filtering
            }
        });
        res.json({ success: true });
    } catch (error) {
        console.error('HOD Announcement Error:', error);
        res.status(500).json({ error: 'Failed to send department broadcast' });
    }
};

export const assignMentor: RequestHandler = async (req, res, next) => {
    const hodEmpId = req.user?.roleId;
    const { usn, mentor_emp_id } = req.body;
    
    try {
        const hod = await prisma.faculty.findUnique({ where: { emp_id: hodEmpId } });
        if (!hod || !hod.is_hod) {
            res.status(403).json({ error: 'Forbidden: Not an HOD' });
            return;
        }

        const student = await prisma.student.findUnique({ where: { usn } });
        if (!student || student.department !== hod.department) {
            res.status(404).json({ error: 'Student not found in your department' });
            return;
        }

        let mentorUserId = null;
        if (mentor_emp_id) {
            const faculty = await prisma.faculty.findUnique({ 
                where: { emp_id: mentor_emp_id } 
            });
            if (!faculty || faculty.department !== hod.department) {
                res.status(404).json({ error: 'Mentor faculty not found in your department' });
                return;
            }
            mentorUserId = faculty.user_id;
        }

        await prisma.student.update({
            where: { usn },
            data: { mentor_id: mentorUserId }
        });

        res.json({ success: true, message: 'Mentor assigned successfully' });
    } catch (error) {
        console.error('Assign Mentor Error:', error);
        res.status(500).json({ error: 'Failed to assign mentor' });
    }
};

export const updateTeacherSettings: RequestHandler = async (req, res, next) => {
    const empId = req.user?.roleId;
    if (!empId) {
        res.status(400).json({ error: 'Employee ID not found in token' });
        return;
    }
    
    const { custom_thresholds, notification_prefs, consultation_hours } = req.body;
    try {
        await prisma.faculty.update({
            where: { emp_id: empId },
            data: {
                custom_thresholds: custom_thresholds !== undefined ? custom_thresholds : undefined,
                notification_prefs: notification_prefs !== undefined ? notification_prefs : undefined,
                consultation_hours: consultation_hours !== undefined ? consultation_hours : undefined
            }
        });
        res.json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Update Settings Error:', error);
        res.status(500).json({ error: 'Failed to update teacher settings' });
    }
};

// --- MENTORSHIP ROUTES ---
export const getMyMentees: RequestHandler = async (req, res, next) => {
    const userId = req.user?.id;
    try {
        const mentees = await prisma.student.findMany({
            where: { mentor_id: userId },
            include: { user: true, predictions: { orderBy: { predicted_at: 'desc' }, take: 1 } }
        });
        
        const mapped = mentees.map(s => ({
            usn: s.usn,
            name: s.user.full_name,
            semester: s.semester,
            cgpa: parseFloat(s.cgpa?.toString() || '0'),
            risk: s.predictions[0]?.risk_level || 'Low',
            user_id: s.user_id
        }));
        
        res.json(mapped);
    } catch (error) {
        console.error('Get Mentees Error:', error);
        res.status(500).json({ error: 'Failed to fetch mentees' });
    }
};

export const getMentorshipMessages: RequestHandler = async (req, res, next) => {
    const userId = req.user?.id;
    const { usn } = req.params;
    
    try {
        const student = await prisma.student.findUnique({ where: { usn } });
        if (!student) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }
        
        if (student.mentor_id !== userId) {
            res.status(403).json({ error: 'Not authorized to view these messages' });
            return;
        }

        const messages = await prisma.mentorshipMessage.findMany({
            where: { student_id: student.user_id, mentor_id: userId },
            orderBy: { sent_at: 'asc' },
            include: { sender: { select: { full_name: true, role: true } } }
        });
        
        res.json(messages);
    } catch (error) {
        console.error('Get Mentorship Messages Error:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

export const sendMentorshipMessage: RequestHandler = async (req, res, next) => {
    const userId = req.user?.id;
    const { usn } = req.params;
    const { content } = req.body;
    const file = req.file;
    
    try {
        const student = await prisma.student.findUnique({ where: { usn } });
        if (!student || student.mentor_id !== userId) {
            res.status(403).json({ error: 'Not authorized to message this student' });
            return;
        }
        
        const message = await prisma.mentorshipMessage.create({
            data: {
                student_id: student.user_id,
                mentor_id: userId,
                sender_id: userId,
                content: content || '',
                file_url: file ? `/uploads/${file.filename}` : null,
                file_name: file ? file.originalname : null
            },
            include: { sender: { select: { full_name: true, role: true } } }
        });
        
        const io = req.app.get('io');
        if (io) {
            io.to(`mentorship_${student.user_id}`).emit('receive_message', message);
        }

        res.json(message);
    } catch (error) {
        console.error('Send Mentorship Message Error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
};

export const getTeacherTimetable: RequestHandler = async (req, res, next) => {
    const empId = req.user?.roleId;
    if (!empId) {
        res.status(400).json({ error: 'Employee ID not found in token' });
        return;
    }
    try {
        const timetables = await prisma.timetable.findMany({
            where: { faculty_emp_id: empId },
            include: { course: true }
        });
        res.json(timetables);
    } catch (error) {
        console.error('Get Timetable Error:', error);
        res.status(500).json({ error: 'Failed to fetch timetable' });
    }
};

export const updateTimetableEntry: RequestHandler = async (req, res, next) => {
    const empId = req.user?.roleId;
    const { id } = req.params;
    const { day_of_week, start_time, end_time, room } = req.body;
    
    if (!empId) {
        res.status(400).json({ error: 'Employee ID not found in token' });
        return;
    }
    
    try {
        const existing = await prisma.timetable.findUnique({ where: { id } });
        if (!existing || existing.faculty_emp_id !== empId) {
            res.status(404).json({ error: 'Timetable entry not found or unauthorized' });
            return;
        }
        
        const updated = await prisma.timetable.update({
            where: { id },
            data: { day_of_week, start_time, end_time, room }
        });
        res.json(updated);
    } catch (error) {
        console.error('Update Timetable Error:', error);
        res.status(500).json({ error: 'Failed to update timetable' });
    }
};