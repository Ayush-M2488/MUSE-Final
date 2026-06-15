import { Request, Response, RequestHandler } from 'express';
import { prisma } from '../config/db';

export const getDashboardAnalytics: RequestHandler = async (req, res, next) => {
    try {
        // 1. KPIs
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        // Total Students
        const totalStudents = await prisma.student.count();
        const pastStudents = await prisma.student.count({
            where: { enrollment_date: { lt: thirtyDaysAgo } }
        });
        const studentDeltaValue = totalStudents - pastStudents;
        const studentDelta = studentDeltaValue > 0 ? `+${studentDeltaValue} in last 30d` : studentDeltaValue < 0 ? `${studentDeltaValue} in last 30d` : 'No change';
        const studentUp = studentDeltaValue >= 0;

        // Avg Attendance (Last 7 days vs previous 7 days)
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        const recentAtt = await prisma.attendance.findMany({ where: { date: { gte: sevenDaysAgo } } });
        const recentPresent = recentAtt.filter(a => a.status === 'present').length;
        const recentAvg = recentAtt.length > 0 ? (recentPresent / recentAtt.length) * 100 : 0;

        const pastAtt = await prisma.attendance.findMany({ where: { date: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } });
        const pastPresent = pastAtt.filter(a => a.status === 'present').length;
        const pastAvg = pastAtt.length > 0 ? (pastPresent / pastAtt.length) * 100 : 0;

        const totalAttCount = await prisma.attendance.count();
        const presentAttCount = await prisma.attendance.count({ where: { status: 'present' } });
        const avgAttendance = totalAttCount > 0 ? (presentAttCount / totalAttCount) * 100 : 0;

        const attDiff = (recentAvg - pastAvg).toFixed(1);
        const attDelta = recentAtt.length > 0 && pastAtt.length > 0 ? `${parseFloat(attDiff) > 0 ? '+' : ''}${attDiff}% from last week` : 'Insufficient data';
        const attUp = recentAvg >= pastAvg;

        // High Risk
        const highRiskPredictions = await prisma.prediction.findMany({
            where: { risk_level: 'High' },
            distinct: ['usn']
        });
        const highRisk = highRiskPredictions.length;

        const pastHighRiskPredictions = await prisma.prediction.findMany({
            where: { risk_level: 'High', predicted_at: { lt: thirtyDaysAgo } },
            distinct: ['usn']
        });
        const pastHighRisk = pastHighRiskPredictions.length;
        const riskDiff = highRisk - pastHighRisk;
        const riskDelta = riskDiff > 0 ? `+${riskDiff} vs last month` : riskDiff < 0 ? `${riskDiff} vs last month` : 'No change';
        const riskUp = riskDiff <= 0; // Less risk is good

        // Interventions
        const currentInterventions = await prisma.intervention.count({
            where: { created_at: { gte: thirtyDaysAgo } }
        });
        const pastInterventions = await prisma.intervention.count({
            where: { created_at: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } }
        });
        const interventions = await prisma.intervention.count();

        const intDiff = currentInterventions - pastInterventions;
        const intDelta = intDiff > 0 ? `+${intDiff} vs last month` : intDiff < 0 ? `${intDiff} vs last month` : 'No change';
        const intUp = intDiff >= 0;

        // 2 & 3. Risk Distribution and Risk by Department
        const students = await prisma.student.findMany({
            include: {
                predictions: {
                    orderBy: { predicted_at: 'desc' },
                    take: 1
                }
            }
        });

        let totalHigh = 0, totalMed = 0, totalLow = 0;
        const deptRiskMap: Record<string, { dept: string, high: number, med: number, low: number }> = {};

        students.forEach(s => {
            const risk = s.predictions.length > 0 ? s.predictions[0].risk_level : 'Low';

            if (risk === 'High') totalHigh++;
            else if (risk === 'Medium') totalMed++;
            else totalLow++;

            const dept = s.department;
            if (!deptRiskMap[dept]) deptRiskMap[dept] = { dept, high: 0, med: 0, low: 0 };

            if (risk === 'High') deptRiskMap[dept].high++;
            else if (risk === 'Medium') deptRiskMap[dept].med++;
            else deptRiskMap[dept].low++;
        });

        const riskDist = [
            { name: 'High', value: totalHigh },
            { name: 'Medium', value: totalMed },
            { name: 'Low', value: totalLow }
        ].filter(d => d.value > 0);

        const deptRisk = Object.values(deptRiskMap);

        // 4. Attendance Trend (by Month)
        const allAttendance = await prisma.attendance.findMany({
            select: { date: true, status: true }
        });

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const attTrendMap: Record<string, { total: number, present: number, monthIdx: number }> = {};

        allAttendance.forEach(a => {
            const mIdx = a.date.getMonth();
            const month = monthNames[mIdx];
            if (!attTrendMap[month]) attTrendMap[month] = { total: 0, present: 0, monthIdx: mIdx };
            attTrendMap[month].total++;
            if (a.status === 'present') attTrendMap[month].present++;
        });

        const attTrend = Object.values(attTrendMap)
            .sort((a, b) => a.monthIdx - b.monthIdx)
            .map(x => ({
                month: monthNames[x.monthIdx],
                avg: x.total > 0 ? parseFloat(((x.present / x.total) * 100).toFixed(1)) : 0
            }));

        // 5. FETCH THE ACTIVE MODEL VERSION
        const latestPrediction = await prisma.prediction.findFirst({
            orderBy: { predicted_at: 'desc' },
            select: { model_version: true }
        });
        const activeModel = latestPrediction ? latestPrediction.model_version : 'No model data yet';

        // Send everything back
        res.json({
            success: true,
            data: {
                activeModel: activeModel,
                kpis: {
                    totalStudents: { value: totalStudents, delta: studentDelta, up: studentUp },
                    avgAttendance: { value: parseFloat(avgAttendance.toFixed(1)), delta: attDelta, up: attUp },
                    highRisk: { value: highRisk, delta: riskDelta, up: riskUp },
                    interventions: { value: interventions, delta: intDelta, up: intUp }
                },
                riskDist,
                deptRisk,
                attTrend
            }
        });

    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ error: 'Failed to fetch admin analytics' });
    }
};

// --- USER MANAGEMENT ---
export const getUsers: RequestHandler = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const search = (req.query.search as string) || '';
        const roleFilter = (req.query.role as string) || 'All';
        const skip = (page - 1) * limit;

        const whereClause: any = {};

        if (roleFilter !== 'All') {
            whereClause.role = roleFilter.toLowerCase();
        }

        if (search) {
            whereClause.OR = [
                { full_name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { student: { usn: { contains: search, mode: 'insensitive' } } },
                { faculty: { emp_id: { contains: search, mode: 'insensitive' } } }
            ];
        }

        const totalUsers = await prisma.user.count({ where: whereClause });

        const users = await prisma.user.findMany({
            where: whereClause,
            include: {
                student: true,
                faculty: {
                    include: {
                        enrollments: {
                            select: { course_code: true }
                        }
                    }
                },
                admin: true
            },
            orderBy: { created_at: 'desc' },
            skip,
            take: limit
        });

        const mappedUsers = users.map(u => {
            let dept = 'N/A';
            let semester = null;
            let subjects: string[] = [];

            if (u.student) {
                dept = u.student.department;
                semester = u.student.semester;
            } else if (u.faculty) {
                dept = u.faculty.department;
                if (u.faculty.enrollments) {
                    subjects = [...new Set(u.faculty.enrollments.map(e => e.course_code))];
                }
            } else if (u.admin) {
                dept = u.admin.department;
            }

            return {
                id: u.id,
                name: u.full_name,
                role: u.role,
                dept: dept,
                semester,
                subjects,
                email: u.email,
                phone: u.student?.phone || null,
                usn: u.student?.usn || null,
                status: u.status,
                last: u.last_login ? new Date(u.last_login).toLocaleString() : 'Never',
                emp_id: u.faculty?.emp_id,
                is_hod: u.faculty?.is_hod || false
            };
        });

        res.json({
            users: mappedUsers,
            pagination: {
                total: totalUsers,
                page,
                limit,
                totalPages: Math.ceil(totalUsers / limit)
            }
        });
    } catch (error) {
        console.error('Get Users Error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

import bcrypt from 'bcrypt';

const enrollStudentInSemesterCourses = async (usn: string, department: string, semester: number) => {
    try {
        const courses = await prisma.course.findMany({
            where: {
                department,
                semester
            }
        });

        for (const course of courses) {
            // Find existing enrollment to see if another teacher is already teaching it
            const existingEnrollment = await prisma.enrollment.findFirst({
                where: { course_code: course.course_code },
                select: { faculty_emp_id: true }
            });

            const teacherEmpId = existingEnrollment?.faculty_emp_id;

            if (teacherEmpId) {
                await prisma.enrollment.upsert({
                    where: {
                        usn_course_code: {
                            usn,
                            course_code: course.course_code
                        }
                    },
                    update: {
                        faculty_emp_id: teacherEmpId
                    },
                    create: {
                        usn,
                        course_code: course.course_code,
                        faculty_emp_id: teacherEmpId,
                        section: 'A'
                    }
                });
            }
        }
    } catch (err) {
        console.error("enrollStudentInSemesterCourses error:", err);
    }
};

export const createUser: RequestHandler = async (req, res, next) => {
    const { name, email, role, dept, status, semester, subjects, identifier, phone } = req.body;
    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(409).json({ error: 'A user with this email already exists.' });
            return;
        }

        const normalizedRole = role.toLowerCase() === 'faculty' ? 'teacher' : role.toLowerCase();

        if (normalizedRole === 'student' && identifier) {
            const existingStudent = await prisma.student.findUnique({ where: { usn: identifier.trim() } });
            if (existingStudent) {
                res.status(409).json({ error: 'A student with this USN already exists.' });
                return;
            }
        } else if (normalizedRole === 'teacher' && identifier) {
            const existingFaculty = await prisma.faculty.findUnique({ where: { emp_id: identifier.trim() } });
            if (existingFaculty) {
                res.status(409).json({ error: 'A faculty member with this Employee ID already exists.' });
                return;
            }
        }

        const passwordHash = await bcrypt.hash('password123', 10);

        const user = await prisma.user.create({
            data: {
                email,
                password_hash: passwordHash,
                role: normalizedRole,
                full_name: name,
                status
            }
        });

        // Normalize role name: Admin UI might send 'faculty', but system expects 'teacher'
        if (role.toLowerCase() === 'student') {
            if (!identifier) {
                return res.status(400).json({ error: 'USN is required for student creation' });
            }
            const newUsn = identifier.trim();
            const student = await prisma.student.create({
                data: {
                    usn: newUsn, // Explicit USN
                    user_id: user.id,
                    program: 'B.E. ' + dept,
                    department: dept,
                    phone: phone || null,
                    semester: semester ? parseInt(semester, 10) : 1,
                    enrollment_date: new Date()
                }
            });

            await prisma.fee.create({
                data: {
                    usn: newUsn,
                    semester: student.semester,
                    amount_due: 150000,
                    amount_paid: 0,
                    status: 'Not Assigned',
                    due_date: new Date('2024-09-01')
                }
            });

            // Auto-enroll the new student in their courses
            await enrollStudentInSemesterCourses(student.usn, student.department, student.semester);

        } else if (normalizedRole === 'teacher') {
            if (!identifier) {
                return res.status(400).json({ error: 'Employee ID is required for teacher creation' });
            }
            const emp_id = identifier.trim();
            await prisma.faculty.create({
                data: {
                    emp_id,
                    user_id: user.id,
                    department: dept,
                    designation: 'Faculty'
                }
            });

            if (subjects) {
                const courseCodes = Array.isArray(subjects) ? subjects : subjects.split(',').map((s: string) => s.trim()).filter(Boolean);

                if (courseCodes.length > 0) {
                    for (const cc of courseCodes) {
                        const courseRecord = await prisma.course.findUnique({
                            where: { course_code: cc }
                        });

                        if (courseRecord) {
                            const students = await prisma.student.findMany({
                                where: {
                                    department: courseRecord.department,
                                    semester: courseRecord.semester
                                }
                            });

                            for (const s of students) {
                                await prisma.enrollment.upsert({
                                    where: {
                                        usn_course_code: {
                                            usn: s.usn,
                                            course_code: cc
                                        }
                                    },
                                    update: {
                                        faculty_emp_id: emp_id
                                    },
                                    create: {
                                        usn: s.usn,
                                        course_code: cc,
                                        faculty_emp_id: emp_id,
                                        section: 'A'
                                    }
                                });
                            }
                        }
                    }
                }
            }
        }

        res.json({ success: true, message: 'User created' });
    } catch (error) {
        console.error('Create User Error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
};
export const deleteUser: RequestHandler = async (req, res, next) => {
    const { id } = req.params;
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        if (user?.role === 'admin') {
            res.status(403).json({ error: 'Cannot delete admin accounts' });
            return;
        }

        await prisma.$transaction([
            // 1. Delete announcements authored by this user
            prisma.announcement.deleteMany({
                where: { author_id: id }
            }),
            // 2. Set user_id to null in audit logs to preserve records without constraint error
            prisma.auditLog.updateMany({
                where: { user_id: id },
                data: { user_id: null }
            }),
            // 3. Delete the user (which cascades to students/faculty/admins/notifications/assignments)
            prisma.user.delete({
                where: { id }
            })
        ]);
        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

export const updateUserStatus: RequestHandler = async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await prisma.user.update({
            where: { id },
            data: { status }
        });
        res.json({ success: true, message: 'User status updated' });
    } catch (error) {
        console.error('Update User Status Error:', error);
        res.status(500).json({ error: 'Failed to update user status' });
    }
};

export const updateUser: RequestHandler = async (req, res, next) => {
    const { id } = req.params;
    const { name, email, dept, status, semester, phone, identifier } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { id }, include: { student: true, faculty: true } });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        if (email && email !== user.email) {
            const existing = await prisma.user.findUnique({ where: { email } });
            if (existing) {
                res.status(409).json({ error: 'Email already in use' });
                return;
            }
        }

        if (user.role === 'student' && identifier && user.student?.usn !== identifier) {
            const existing = await prisma.student.findUnique({ where: { usn: identifier.trim() } });
            if (existing) {
                res.status(409).json({ error: 'USN already in use' });
                return;
            }
        }
        if (user.role === 'teacher' && identifier && user.faculty?.emp_id !== identifier) {
            const existing = await prisma.faculty.findUnique({ where: { emp_id: identifier.trim() } });
            if (existing) {
                res.status(409).json({ error: 'Employee ID already in use' });
                return;
            }
        }

        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id },
                data: {
                    full_name: name || user.full_name,
                    email: email || user.email,
                    status: status || user.status,
                }
            });

            if (user.role === 'student' && user.student) {
                await tx.student.update({
                    where: { user_id: id },
                    data: {
                        department: dept || user.student.department,
                        program: dept ? 'B.E. ' + dept : user.student.program,
                        semester: semester ? parseInt(semester, 10) : user.student.semester,
                        phone: phone !== undefined ? phone : user.student.phone,
                    }
                });

                if (identifier && identifier !== user.student.usn) {
                    await tx.student.update({
                        where: { user_id: id },
                        data: { usn: identifier.trim() }
                    });
                }
            } else if (user.role === 'teacher' && user.faculty) {
                await tx.faculty.update({
                    where: { user_id: id },
                    data: {
                        department: dept || user.faculty.department,
                    }
                });
                if (identifier && identifier !== user.faculty.emp_id) {
                    await tx.faculty.update({
                        where: { user_id: id },
                        data: { emp_id: identifier.trim() }
                    });
                }
            }
        });

        res.json({ success: true, message: 'User updated successfully' });
    } catch (error) {
        console.error('Update User Error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
};

// --- SYSTEM CONFIG ---
export const getConfig: RequestHandler = async (req, res, next) => {
    try {
        const config = await prisma.systemConfig.findMany();
        const configMap: Record<string, string> = {};
        config.forEach(c => configMap[c.key] = c.value);

        res.json({
            minAtt: configMap['minAtt'] || '75',
            iaMax: configMap['iaMax'] || '25',
            highT: configMap['highT'] || '0.70',
            medT: configMap['medT'] || '0.40',
            semStart: configMap['semStart'] || '2024-08-01',
            semEnd: configMap['semEnd'] || '2024-12-15',
            ay: configMap['ay'] || '2024-2025',
            mlModelType: configMap['mlModelType'] || 'Random Forest',
            dataRetentionDays: configMap['dataRetentionDays'] || '180',
            autoBackupEnabled: configMap['autoBackupEnabled'] || 'false',
            feeDueDate: configMap['feeDueDate'] || ''
        });
    } catch (error) {
        console.error('Get Config Error:', error);
        res.status(500).json({ error: 'Failed to fetch config' });
    }
};

export const updateConfig: RequestHandler = async (req, res, next) => {
    const cfg = { ...req.body };
    // Remove access to change settings that are not dynamically active
    delete cfg.iaMax;
    delete cfg.highT;
    delete cfg.medT;
    delete cfg.mlModelType;

    try {
        const promises = Object.keys(cfg).map(key => {
            return prisma.systemConfig.upsert({
                where: { key },
                update: { value: String(cfg[key]) },
                create: { key, value: String(cfg[key]) }
            });
        });

        await Promise.all(promises);
        res.json({ success: true, message: 'Config updated' });
    } catch (error) {
        console.error('Update Config Error:', error);
        res.status(500).json({ error: 'Failed to update config' });
    }
};

import { createObjectCsvStringifier } from 'csv-writer';

import { getAttendanceMonthlyReport, getAttendanceShortageReport, getAttendanceCriticalReport } from '../services/reportService';

// --- REPORTS ---
export const generateReport: RequestHandler = async (req, res, next) => {
    const { type } = req.params;
    try {
        let records: any[] = [];
        let header: any[] = [];

        if (type === 'attendance_monthly') {
            const report = await getAttendanceMonthlyReport();
            header = report.header;
            records = report.records;
        } else if (type === 'attendance_shortage') {
            const report = await getAttendanceShortageReport();
            header = report.header;
            records = report.records;
        } else if (type === 'attendance_critical') {
            const report = await getAttendanceCriticalReport();
            header = report.header;
            records = report.records;
        } else if (type === 'marks_consolidated') {
            const students = await prisma.student.findMany({
                include: { user: true, assessments: { include: { course: true } } }
            });
            header = [
                { id: 'usn', title: 'USN' },
                { id: 'name', title: 'Student Name' },
                { id: 'dept', title: 'Department' },
                { id: 'sem', title: 'Semester' },
                { id: 'course_code', title: 'Course Code' },
                { id: 'course_name', title: 'Course Name' },
                { id: 'ia1', title: 'IA-1 Marks' },
                { id: 'ia2', title: 'IA-2 Marks' },
                { id: 'ia3', title: 'IA-3 Marks' },
                { id: 'practicals', title: 'Practical Marks' },
                { id: 'finals', title: 'Final Marks' }
            ];
            records = [];
            for (const s of students) {
                const courseAss: { [key: string]: { name: string, assessments: any[] } } = {};
                s.assessments.forEach(ass => {
                    if (!courseAss[ass.course_code]) {
                        courseAss[ass.course_code] = { name: ass.course.course_name, assessments: [] };
                    }
                    courseAss[ass.course_code].assessments.push(ass);
                });
                for (const code in courseAss) {
                    const data = courseAss[code];
                    const getMark = (typeKeyword: string) => {
                        const found = data.assessments.find(a =>
                            a.assessment_type.toLowerCase().replace(/[-_\s]/g, '').includes(typeKeyword)
                        );
                        return found ? found.score.toString() : 'N/A';
                    };
                    records.push({
                        usn: s.usn,
                        name: s.user.full_name,
                        dept: s.department,
                        sem: s.semester,
                        course_code: code,
                        course_name: data.name,
                        ia1: getMark('ia1'),
                        ia2: getMark('ia2'),
                        ia3: getMark('ia3'),
                        practicals: getMark('practical'),
                        finals: getMark('final')
                    });
                }
            }
        } else if (type === 'marks_toppers') {
            const students = await prisma.student.findMany({
                include: { user: true },
                orderBy: [{ department: 'asc' }, { cgpa: 'desc' }]
            });
            header = [
                { id: 'rank', title: 'Rank in Dept' },
                { id: 'dept', title: 'Department' },
                { id: 'usn', title: 'USN' },
                { id: 'name', title: 'Student Name' },
                { id: 'cgpa', title: 'SGPA' },
                { id: 'sem', title: 'Semester' }
            ];
            let currentDept = '';
            let rank = 0;
            records = students.map(s => {
                if (s.department !== currentDept) {
                    currentDept = s.department;
                    rank = 1;
                } else {
                    rank++;
                }
                return {
                    rank,
                    dept: s.department,
                    usn: s.usn,
                    name: s.user.full_name,
                    cgpa: s.cgpa ? s.cgpa.toNumber() : 0.0,
                    sem: s.semester
                };
            });
        } else if (type === 'marks_below_average') {
            const students = await prisma.student.findMany({
                where: { cgpa: { lt: 6.0 } },
                include: { user: true },
                orderBy: { cgpa: 'asc' }
            });
            header = [
                { id: 'usn', title: 'USN' },
                { id: 'name', title: 'Student Name' },
                { id: 'dept', title: 'Department' },
                { id: 'sem', title: 'Semester' },
                { id: 'cgpa', title: 'SGPA' },
                { id: 'standing', title: 'Academic Standing' }
            ];
            records = students.map(s => ({
                usn: s.usn,
                name: s.user.full_name,
                dept: s.department,
                sem: s.semester,
                cgpa: s.cgpa ? s.cgpa.toNumber() : 0.0,
                standing: s.academic_standing || 'Needs Attention'
            }));
        } else if (type === 'risk_high') {
            const highRiskPreds = await prisma.prediction.findMany({
                where: { risk_level: 'High' },
                orderBy: { predicted_at: 'desc' },
                distinct: ['usn'],
                include: {
                    student: { include: { user: true } },
                    explanations: true
                }
            });
            header = [
                { id: 'usn', title: 'USN' },
                { id: 'name', title: 'Student Name' },
                { id: 'dept', title: 'Department' },
                { id: 'sem', title: 'Semester' },
                { id: 'factors', title: 'Top Contributing Factors' }
            ];
            records = highRiskPreds.map(p => ({
                usn: p.usn,
                name: p.student.user.full_name,
                dept: p.student.department,
                sem: p.student.semester,
                factors: p.explanations
                    .map(e => `${e.feature_name}: ${e.impact_description} (${(Number(e.shap_value) * 100).toFixed(1)}%)`)
                    .join('; ')
            }));
        } else if (type === 'risk_interventions') {
            const interventions = await prisma.intervention.findMany({
                include: {
                    student: { include: { user: true } },
                    faculty: { include: { user: true } }
                },
                orderBy: { created_at: 'desc' }
            });
            header = [
                { id: 'date', title: 'Logged Date' },
                { id: 'usn', title: 'Student USN' },
                { id: 'name', title: 'Student Name' },
                { id: 'dept', title: 'Department' },
                { id: 'sem', title: 'Semester' },
                { id: 'action', title: 'Action Taken' },
                { id: 'notes', title: 'Notes' },
                { id: 'status', title: 'Status' },
                { id: 'faculty', title: 'Logged By (Faculty)' }
            ];
            records = interventions.map(i => ({
                date: i.created_at ? new Date(i.created_at).toLocaleDateString() : 'N/A',
                usn: i.usn,
                name: i.student.user.full_name,
                dept: i.student.department,
                sem: i.student.semester,
                action: i.action_taken,
                notes: i.notes || 'N/A',
                status: i.status || 'open',
                faculty: i.faculty.user.full_name
            }));
        } else if (type === 'risk_feedback') {
            const auditLogs = await prisma.auditLog.findMany({
                where: {
                    action: { contains: 'intervention' }
                },
                include: { user: true },
                orderBy: { created_at: 'desc' }
            });
            header = [
                { id: 'date', title: 'Timestamp' },
                { id: 'actor', title: 'Logged By' },
                { id: 'action', title: 'Action Details' },
                { id: 'details', title: 'Log Details' }
            ];
            records = auditLogs.map(a => ({
                date: a.created_at ? new Date(a.created_at).toLocaleString() : 'N/A',
                actor: a.user?.full_name || 'System',
                action: a.action,
                details: JSON.stringify(a.details)
            }));
        } else if (type === 'compliance_naac') {
            const assessments = await prisma.assessment.findMany({
                include: {
                    student: { include: { user: true } },
                    course: true
                },
                orderBy: { recorded_at: 'desc' }
            });
            header = [
                { id: 'usn', title: 'USN' },
                { id: 'name', title: 'Student Name' },
                { id: 'dept', title: 'Department' },
                { id: 'sem', title: 'Semester' },
                { id: 'course', title: 'Course Code' },
                { id: 'type', title: 'Assessment Component' },
                { id: 'score', title: 'Marks Obtained' },
                { id: 'max_score', title: 'Maximum Marks' },
                { id: 'date', title: 'Evaluation Date' }
            ];
            records = assessments.map(a => ({
                usn: a.usn,
                name: a.student.user.full_name,
                dept: a.student.department,
                sem: a.student.semester,
                course: a.course_code,
                type: a.assessment_type,
                score: a.score.toNumber(),
                max_score: a.max_score.toNumber(),
                date: a.recorded_at ? new Date(a.recorded_at).toLocaleDateString() : 'N/A'
            }));
        } else if (type === 'compliance_nep') {
            const students = await prisma.student.findMany({
                include: {
                    user: true,
                    enrollments: { include: { course: true } }
                }
            });
            header = [
                { id: 'usn', title: 'USN' },
                { id: 'name', title: 'Student Name' },
                { id: 'program', title: 'Program' },
                { id: 'dept', title: 'Department' },
                { id: 'sem', title: 'Semester' },
                { id: 'credits', title: 'Total Registered Credits' },
                { id: 'cgpa', title: 'SGPA' }
            ];
            records = students.map(s => {
                const credits = s.enrollments.reduce((sum, e) => sum + e.course.credits, 0);
                return {
                    usn: s.usn,
                    name: s.user.full_name,
                    program: s.program,
                    dept: s.department,
                    sem: s.semester,
                    credits,
                    cgpa: s.cgpa ? s.cgpa.toNumber() : 0.0
                };
            });
        } else if (type === 'compliance_audit') {
            const logs = await prisma.auditLog.findMany({
                include: { user: true },
                orderBy: { created_at: 'desc' },
                take: 500
            });
            header = [
                { id: 'date', title: 'Timestamp' },
                { id: 'actor', title: 'Actor Email' },
                { id: 'action', title: 'Action' },
                { id: 'entity', title: 'Entity Affected' },
                { id: 'details', title: 'Audit Details' }
            ];
            records = logs.map(l => ({
                date: l.created_at ? new Date(l.created_at).toLocaleString() : 'N/A',
                actor: l.user?.email || 'System',
                action: l.action,
                entity: l.entity_type,
                details: JSON.stringify(l.details)
            }));
        } else {
            // Default: 'system' or anything else -> user dump
            const users = await prisma.user.findMany();
            header = [
                { id: 'email', title: 'Email' },
                { id: 'role', title: 'Role' },
                { id: 'status', title: 'Status' },
                { id: 'created_at', title: 'Created At' }
            ];
            records = users.map(u => ({
                email: u.email,
                role: u.role,
                status: u.status,
                created_at: u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'
            }));
        }

        res.json({ success: true, header, records });
    } catch (err: any) {
        console.error('generateReport error:', err, err.stack);
        res.status(500).json({ error: 'Failed to generate report', details: err.message });
    }
};

// --- COURSES ---
export const getCourses: RequestHandler = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const search = (req.query.search as string) || '';
        const department = (req.query.department as string) || 'All';
        const skip = (page - 1) * limit;

        const whereClause: any = {};

        if (department !== 'All') {
            whereClause.department = department;
        }

        if (search) {
            whereClause.OR = [
                { course_code: { contains: search, mode: 'insensitive' } },
                { course_name: { contains: search, mode: 'insensitive' } }
            ];
        }

        const totalCourses = await prisma.course.count({ where: whereClause });

        const courses = await prisma.course.findMany({
            where: whereClause,
            include: {
                enrollments: {
                    select: {
                        faculty_emp_id: true,
                        section: true,
                        usn: true
                    }
                }
            },
            orderBy: [{ semester: 'asc' }, { course_code: 'asc' }],
            skip,
            take: limit
        });

        res.json({
            courses,
            pagination: {
                total: totalCourses,
                page,
                limit,
                totalPages: Math.ceil(totalCourses / limit)
            }
        });
    } catch (error) {
        console.error('Get Courses Error:', error);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
};

export const assignCourseFaculty: RequestHandler = async (req, res, next) => {
    const { courseCode } = req.params;
    const { empId } = req.body;
    try {
        const courseRecord = await prisma.course.findUnique({
            where: { course_code: courseCode }
        });
        if (!courseRecord) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const facultyRecord = await prisma.faculty.findUnique({
            where: { emp_id: empId }
        });
        if (!facultyRecord) {
            return res.status(404).json({ error: 'Faculty not found' });
        }

        const students = await prisma.student.findMany({
            where: {
                department: courseRecord.department,
                semester: courseRecord.semester
            }
        });

        for (const s of students) {
            await prisma.enrollment.upsert({
                where: {
                    usn_course_code: {
                        usn: s.usn,
                        course_code: courseCode
                    }
                },
                update: {
                    faculty_emp_id: empId
                },
                create: {
                    usn: s.usn,
                    course_code: courseCode,
                    faculty_emp_id: empId,
                    section: 'A'
                }
            });
        }

        res.json({ success: true, message: 'Faculty assigned to course successfully' });
    } catch (error) {
        console.error('Assign Course Faculty Error:', error);
        res.status(500).json({ error: 'Failed to assign faculty' });
    }
};
// --- BULK USER CREATION ---
export const createUsersBulk: RequestHandler = async (req, res, next) => {
    const { users } = req.body;
    if (!Array.isArray(users)) {
        res.status(400).json({ error: 'Payload must contain a "users" array.' });
        return;
    }

    try {
        const passwordHash = await bcrypt.hash('password123', 10);
        let imported = 0;
        let skipped = 0;
        const errors: string[] = [];

        for (const u of users) {
            const { name, email, role, dept, semester, usn, emp_id, designation, phone } = u;
            if (!name || !email || !role || !dept) {
                skipped++;
                errors.push(`Row for ${name || 'Unknown'} skipped: missing required fields.`);
                continue;
            }

            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { email: email.trim() }
            });
            if (existingUser) {
                skipped++;
                errors.push(`User with email "${email}" already exists.`);
                continue;
            }

            const normalizedRole = role.toLowerCase() === 'faculty' ? 'teacher' : role.toLowerCase();

            // Create user
            const user = await prisma.user.create({
                data: {
                    email: email.trim(),
                    password_hash: passwordHash,
                    role: normalizedRole,
                    full_name: name.trim(),
                    status: 'active'
                }
            });

            if (normalizedRole === 'student') {
                const finalUsn = (usn || `21${dept.replace(/[^A-Za-z0-9]/g, '').substring(0, 3).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`).trim();
                await prisma.student.create({
                    data: {
                        usn: finalUsn,
                        user_id: user.id,
                        program: 'B.E. ' + dept,
                        department: dept,
                        phone: phone || null,
                        semester: semester ? parseInt(String(semester), 10) : 1,
                        enrollment_date: new Date()
                    }
                });

                // Also seed a default cleared Fee record for the student
                await prisma.fee.create({
                    data: {
                        usn: finalUsn,
                        semester: semester ? parseInt(String(semester), 10) : 1,
                        amount_due: 150000,
                        amount_paid: 0,
                        status: 'Not Assigned',
                        due_date: new Date('2024-09-01')
                    }
                });

                // Auto-enroll the new student in their courses
                await enrollStudentInSemesterCourses(finalUsn, dept, semester ? parseInt(String(semester), 10) : 1);

            } else if (normalizedRole === 'teacher') {
                const finalEmpId = (emp_id || `FAC-${Math.floor(100 + Math.random() * 900)}`).trim();
                await prisma.faculty.create({
                    data: {
                        emp_id: finalEmpId,
                        user_id: user.id,
                        department: dept,
                        designation: designation || 'Faculty'
                    }
                });

                // Retrieve and assign subjects/semester in bulk import
                const teacherSubjects = u.subjects || u.courses;
                if (teacherSubjects) {
                    const courseCodes = String(teacherSubjects)
                        .split(',')
                        .map((s: string) => s.trim())
                        .filter(Boolean);

                    if (courseCodes.length > 0) {
                        for (const cc of courseCodes) {
                            const courseRecord = await prisma.course.findUnique({
                                where: { course_code: cc }
                            });

                            if (courseRecord) {
                                const students = await prisma.student.findMany({
                                    where: {
                                        department: courseRecord.department,
                                        semester: courseRecord.semester
                                    }
                                });

                                for (const s of students) {
                                    await prisma.enrollment.upsert({
                                        where: {
                                            usn_course_code: {
                                                usn: s.usn,
                                                course_code: cc
                                            }
                                        },
                                        update: {
                                            faculty_emp_id: finalEmpId
                                        },
                                        create: {
                                            usn: s.usn,
                                            course_code: cc,
                                            faculty_emp_id: finalEmpId,
                                            section: 'A'
                                        }
                                    });
                                }
                            }
                        }
                    }
                }
            }

            imported++;
        }

        res.json({ success: true, imported, skipped, errors });
    } catch (error) {
        console.error('Bulk Create Users Error:', error);
        res.status(500).json({ error: 'Failed to process bulk import.' });
    }
};

// --- SET HOD ---
export const assignHod: RequestHandler = async (req, res, next) => {
    const { department, emp_id } = req.body;
    if (!department || !emp_id) {
        res.status(400).json({ error: 'Department and emp_id are required' });
        return;
    }

    try {
        // 1. Reset all faculty in the department to is_hod = false
        await prisma.faculty.updateMany({
            where: { department },
            data: { is_hod: false }
        });

        // 2. Set the chosen faculty member to is_hod = true
        const updatedFaculty = await prisma.faculty.update({
            where: { emp_id },
            data: { is_hod: true },
            include: { user: true }
        });

        // 3. Log the action
        await prisma.auditLog.create({
            data: {
                user_id: (req as any).user.id,
                action: 'ASSIGN_HOD',
                entity_type: 'faculty',
                entity_id: emp_id,
                details: `Assigned ${updatedFaculty.user.full_name} as HOD for ${department}`
            }
        });

        res.json({ success: true, message: 'HOD assigned successfully' });
    } catch (error) {
        console.error('Assign HOD Error:', error);
        res.status(500).json({ error: 'Failed to assign HOD' });
    }
}; // Triggering nodemon restart to load new Prisma Client

// --- TOGGLE FEE STATUS / UPDATE FEE STATUS ---
export const toggleFeeStatus: RequestHandler = async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body; // Can be 'Not Assigned', 'Pending', 'Clear'
    try {
        const fee = await prisma.fee.findUnique({ where: { id } });
        if (!fee) {
            res.status(404).json({ error: 'Fee record not found' });
            return;
        }

        let newStatus = status;
        if (!newStatus) {
            // toggle fallback if status not passed
            newStatus = fee.status === 'Clear' ? 'Pending' : 'Clear';
        }

        const updatedFee = await prisma.fee.update({
            where: { id },
            data: {
                status: newStatus,
                amount_paid: newStatus === 'Clear' ? fee.amount_due : 0
            }
        });

        res.json({ success: true, fee: updatedFee });
    } catch (error) {
        console.error('Toggle Fee Status Error:', error);
        res.status(500).json({ error: 'Failed to toggle fee status' });
    }
};

export const getRiskRoster: RequestHandler = async (req, res, next) => {
    try {
        const students = await prisma.student.findMany({
            include: {
                user: true,
                attendance: true,
                assessments: true,
                predictions: {
                    orderBy: { predicted_at: 'desc' },
                    include: { explanations: true },
                    take: 1
                },
                interventions: {
                    orderBy: { created_at: 'desc' },
                    include: {
                        faculty: {
                            include: { user: true }
                        }
                    }
                }
            }
        });

        const roster = students.map(s => {
            const latestPred = s.predictions[0] || null;

            // Health Score Calculation
            let riskMultiplier = 1;
            const riskLevel = latestPred ? latestPred.risk_level : 'Low';
            if (riskLevel === 'High') riskMultiplier = 0.6;
            else if (riskLevel === 'Medium') riskMultiplier = 0.8;

            let totalClasses = s.attendance.length;
            let attendedClasses = s.attendance.filter(a => a.status === 'present').length;
            const attendancePercent = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;

            let totalMarks = 0;
            let maxMarks = 0;
            const ia1Find = s.assessments.find(a => a.assessment_type === 'IA-1');
            const ia2Find = s.assessments.find(a => a.assessment_type === 'IA-2');
            const ia3Find = s.assessments.find(a => a.assessment_type === 'IA-3');
            const practicalFind = s.assessments.find(a => a.assessment_type === 'Practical');

            if (ia1Find) { totalMarks += ia1Find.score.toNumber(); maxMarks += 50; }
            if (ia2Find) { totalMarks += ia2Find.score.toNumber(); maxMarks += 50; }
            if (ia3Find) { totalMarks += ia3Find.score.toNumber(); maxMarks += 50; }
            if (practicalFind) { totalMarks += practicalFind.score.toNumber(); maxMarks += 50; }

            const marksPercent = maxMarks > 0 ? (totalMarks / maxMarks) * 100 : 100;
            const rawHealth = (attendancePercent * 0.5) + (marksPercent * 0.5);
            const health_score = Math.round(rawHealth * riskMultiplier);

            return {
                usn: s.usn,
                name: s.user.full_name,
                email: s.user.email,
                department: s.department,
                semester: s.semester,
                health_score,
                risk_level: riskLevel,
                risk_score: latestPred ? Number(latestPred.risk_score) : 0,
                explanation_text: latestPred ? latestPred.explanation_text : 'No prediction generated yet.',
                predicted_at: latestPred ? latestPred.predicted_at : null,
                model_version: latestPred ? latestPred.model_version : null,
                factors: latestPred ? latestPred.explanations.map(e => ({
                    feature: e.feature_name,
                    value: Number(e.feature_value),
                    shap: Number(e.shap_value),
                    impact: e.impact_description
                })) : [],
                interventions: s.interventions.map(i => ({
                    id: i.id,
                    action_taken: i.action_taken,
                    notes: i.notes,
                    status: i.status || 'open',
                    created_at: i.created_at,
                    faculty_name: i.faculty?.user?.full_name || 'Faculty'
                }))
            };
        });

        res.json({ success: true, roster });
    } catch (error) {
        console.error('Fetch Risk Roster Error:', error);
        res.status(500).json({ error: 'Failed to fetch risk roster' });
    }
};

import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';

const BACKUP_DIR = path.join(process.cwd(), 'backups');

if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function parseDbUrl(url: string) {
    const cleanUrl = url.replace('postgresql://', '').replace('postgres://', '');
    const lastAtIndex = cleanUrl.lastIndexOf('@');
    if (lastAtIndex === -1) {
        throw new Error('Invalid DATABASE_URL format');
    }
    const creds = cleanUrl.substring(0, lastAtIndex);
    const hostPortDb = cleanUrl.substring(lastAtIndex + 1);

    const colonIndex = creds.indexOf(':');
    const user = colonIndex !== -1 ? creds.substring(0, colonIndex) : creds;
    const password = colonIndex !== -1 ? creds.substring(colonIndex + 1) : '';

    const slashIndex = hostPortDb.indexOf('/');
    const hostPort = slashIndex !== -1 ? hostPortDb.substring(0, slashIndex) : hostPortDb;
    const database = slashIndex !== -1 ? hostPortDb.substring(slashIndex + 1) : '';

    const portColonIndex = hostPort.indexOf(':');
    const host = portColonIndex !== -1 ? hostPort.substring(0, portColonIndex) : hostPort;
    const port = portColonIndex !== -1 ? hostPort.substring(portColonIndex + 1) : '5432';

    return { user, password, host, port, database };
}

export const listBackups: RequestHandler = async (req, res, next) => {
    try {
        if (!fs.existsSync(BACKUP_DIR)) {
            return res.json([]);
        }
        const files = fs.readdirSync(BACKUP_DIR);
        const backups = files
            .filter(file => file.endsWith('.sql'))
            .map(file => {
                const filePath = path.join(BACKUP_DIR, file);
                const stats = fs.statSync(filePath);
                const sizeInMB = (stats.size / (1024 * 1024)).toFixed(1);
                const date = stats.birthtime;
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours24 = date.getHours();
                const hours12 = hours24 % 12 || 12;
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const ampm = hours24 >= 12 ? 'PM' : 'AM';
                const dateStr = `${year}-${month}-${day} ${String(hours12).padStart(2, '0')}:${minutes} ${ampm}`;

                return {
                    name: file,
                    size: `${sizeInMB} MB`,
                    type: file.startsWith('backup_manual_') ? 'Manual' : 'Scheduled',
                    date: dateStr,
                    status: 'Completed'
                };
            });

        backups.sort((a, b) => b.name.localeCompare(a.name));
        res.json(backups);
    } catch (error) {
        console.error('List Backups Error:', error);
        res.status(500).json({ error: 'Failed to retrieve backups list' });
    }
};

export const triggerBackup: RequestHandler = async (req, res, next) => {
    try {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            return res.status(500).json({ error: 'DATABASE_URL environment variable is not defined' });
        }

        const { user, password, host, port, database } = parseDbUrl(dbUrl);

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');
        const second = String(now.getSeconds()).padStart(2, '0');

        const filename = `backup_manual_${year}-${month}-${day}_${hour}${minute}${second}.sql`;
        const filePath = path.join(BACKUP_DIR, filename);

        const command = `pg_dump -h ${host} -U ${user} -p ${port} -d ${database} -f "${filePath}"`;
        const env = { ...process.env, PGPASSWORD: password };

        exec(command, { env }, async (error, stdout, stderr) => {
            if (error) {
                console.error('pg_dump error:', error);
                return res.status(500).json({ error: 'pg_dump failed to execute', details: stderr });
            }

            try {
                const adminUser = (req as any).user;
                await prisma.auditLog.create({
                    data: {
                        user_id: adminUser?.id || null,
                        action: 'DATABASE_BACKUP_GENERATED',
                        entity_type: 'System',
                        entity_id: filename,
                        details: { filename, size: `${(fs.statSync(filePath).size / (1024 * 1024)).toFixed(1)} MB` }
                    }
                });
            } catch (auditErr) {
                console.error('Failed to write backup audit log:', auditErr);
            }

            const stats = fs.statSync(filePath);
            const sizeInMB = (stats.size / (1024 * 1024)).toFixed(1);

            res.json({
                success: true,
                message: 'Backup completed successfully',
                backup: {
                    name: filename,
                    size: `${sizeInMB} MB`,
                    type: 'Manual',
                    date: `${year}-${month}-${day} ${hour}:${minute} ${now.getHours() >= 12 ? 'PM' : 'AM'}`,
                    status: 'Completed'
                }
            });
        });
    } catch (error) {
        console.error('Trigger Backup Error:', error);
        res.status(500).json({ error: 'Failed to trigger backup compilation' });
    }
};

export const downloadBackup: RequestHandler = async (req, res, next) => {
    const { filename } = req.params;
    try {
        const filePath = path.join(BACKUP_DIR, filename);
        const resolvedPath = path.resolve(filePath);
        if (!resolvedPath.startsWith(BACKUP_DIR)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Backup archive file not found' });
        }
        res.download(filePath, filename);
    } catch (error) {
        console.error('Download Backup Error:', error);
        res.status(500).json({ error: 'Failed to download backup file' });
    }
};

export const deleteBackup: RequestHandler = async (req, res, next) => {
    const { filename } = req.params;
    try {
        const filePath = path.join(BACKUP_DIR, filename);
        const resolvedPath = path.resolve(filePath);
        if (!resolvedPath.startsWith(BACKUP_DIR)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Backup archive file not found' });
        }
        fs.unlinkSync(filePath);
        res.json({ success: true, message: 'Backup file deleted successfully' });
    } catch (error) {
        console.error('Delete Backup Error:', error);
        res.status(500).json({ error: 'Failed to delete backup file' });
    }
};
export const resetUserPassword: RequestHandler = async (req, res, next) => {
    const { id } = req.params;

    try {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const hashedDefaultPassword = await bcrypt.hash('password123', 10);
        await prisma.user.update({
            where: { id },
            data: { password_hash: hashedDefaultPassword }
        });

        res.json({ success: true, message: 'User password reset to default (password123)' });
    } catch (error) {
        console.error('Reset User Password Error:', error);
        res.status(500).json({ error: 'Failed to reset user password' });
    }
};
