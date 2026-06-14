import { prisma } from '../config/db';

export const getAttendanceMonthlyReport = async () => {
    const students = await prisma.student.findMany({
        include: {
            user: true,
            attendance: {
                select: { status: true }
            }
        }
    });

    const header = [
        { id: 'usn', title: 'USN' },
        { id: 'name', title: 'Student Name' },
        { id: 'dept', title: 'Department' },
        { id: 'sem', title: 'Semester' },
        { id: 'present', title: 'Present Count' },
        { id: 'total', title: 'Total Classes' },
        { id: 'rate', title: 'Attendance Rate (%)' }
    ];

    const records = students.map(s => {
        const total = s.attendance.length;
        const present = s.attendance.filter(a => a.status === 'present').length;
        const rate = total > 0 ? ((present / total) * 100).toFixed(1) : '100.0';
        return {
            usn: s.usn,
            name: s.user.full_name,
            dept: s.department,
            sem: s.semester,
            present,
            total,
            rate
        };
    });

    return { header, records };
};

export const getAttendanceShortageReport = async () => {
    const students = await prisma.student.findMany({
        include: {
            user: true,
            attendance: {
                select: { status: true, course_code: true }
            }
        }
    });

    const header = [
        { id: 'usn', title: 'USN' },
        { id: 'name', title: 'Student Name' },
        { id: 'dept', title: 'Department' },
        { id: 'sem', title: 'Semester' },
        { id: 'course', title: 'Course Code' },
        { id: 'rate', title: 'Attendance Rate (%)' }
    ];

    const records: any[] = [];

    students.forEach(s => {
        const courseMap: Record<string, { total: number, present: number }> = {};
        s.attendance.forEach(a => {
            if (!courseMap[a.course_code]) courseMap[a.course_code] = { total: 0, present: 0 };
            courseMap[a.course_code].total++;
            if (a.status === 'present') courseMap[a.course_code].present++;
        });

        for (const [course, data] of Object.entries(courseMap)) {
            const rate = data.total > 0 ? (data.present / data.total) * 100 : 100;
            if (rate < 75) {
                records.push({
                    usn: s.usn,
                    name: s.user.full_name,
                    dept: s.department,
                    sem: s.semester,
                    course,
                    rate: rate.toFixed(1)
                });
            }
        }
    });

    return { header, records };
};

export const getAttendanceCriticalReport = async () => {
    const students = await prisma.student.findMany({
        include: {
            user: true,
            attendance: {
                select: { status: true }
            }
        }
    });

    const header = [
        { id: 'usn', title: 'USN' },
        { id: 'name', title: 'Student Name' },
        { id: 'dept', title: 'Department' },
        { id: 'sem', title: 'Semester' },
        { id: 'rate', title: 'Overall Attendance Rate (%)' }
    ];

    const records: any[] = [];

    students.forEach(s => {
        const total = s.attendance.length;
        const present = s.attendance.filter(a => a.status === 'present').length;
        
        if (total > 0) {
            const rate = (present / total) * 100;
            if (rate < 60) {
                records.push({
                    usn: s.usn,
                    name: s.user.full_name,
                    dept: s.department,
                    sem: s.semester,
                    rate: rate.toFixed(1)
                });
            }
        }
    });

    return { header, records };
};
