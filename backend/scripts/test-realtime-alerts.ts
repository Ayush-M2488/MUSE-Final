import { prisma } from '../config/db';
import { markAttendance } from '../controllers/teacherController';
import { generateCoursePredictions } from '../controllers/mlController';
import { sendHighRiskAlertEmail } from '../services/emailService';

// Mock express response object
const mockResponse = () => {
    const res: any = {};
    res.status = (code: number) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data: any) => {
        res.jsonData = data;
        return res;
    };
    return res;
};

async function main() {
    console.log('--- STARTING REAL-TIME ALERTS & WARNING NUDGES INTEGRATION TEST ---');

    // 1. Find the test student (John Doe)
    const student = await prisma.student.findFirst({
        where: { user: { email: 'john.doe@muse.ac.in' } },
        include: { user: true }
    });

    if (!student) {
        console.error('ERROR: Test student john.doe@muse.ac.in not found.');
        return;
    }
    console.log(`Found Student: ${student.user.full_name} (${student.usn})`);

    // 2. Find the test faculty (Jane Smith)
    const faculty = await prisma.faculty.findFirst({
        where: { user: { email: 'jane.smith@muse.ac.in' } },
        include: { user: true }
    });

    if (!faculty) {
        console.error('ERROR: Test faculty jane.smith@muse.ac.in not found.');
        return;
    }
    console.log(`Found Faculty: ${faculty.user.full_name} (${faculty.emp_id})`);

    // 3. Ensure notification preferences are enabled for both features
    await prisma.faculty.update({
        where: { emp_id: faculty.emp_id },
        data: {
            notification_prefs: {
                emailOnHighRisk: true,
                autoNotifyAbsentee: true
            },
            custom_thresholds: {
                AM501: 75 // Set a 75% threshold for course AM501
            }
        }
    });
    console.log('Enabled notification_prefs (emailOnHighRisk, autoNotifyAbsentee) and set threshold for AM501 to 75%.');

    // 4. Test Auto Absentee Nudges
    console.log('\n--- TESTING AUTO ABSENTEE WARNING NUDGES ---');
    
    // Clear previous warnings & attendance
    await prisma.notification.deleteMany({
        where: {
            user_id: student.user_id,
            type: 'Attendance Warning'
        }
    });
    await prisma.attendance.deleteMany({
        where: {
            usn: student.usn,
            course_code: 'AM501'
        }
    });
    console.log('Cleaned up previous attendance records & warnings.');

    // Seed historical attendance: 2 total, 1 present, 1 absent (50% attendance)
    const dates = [new Date('2026-06-01'), new Date('2026-06-02')];
    await prisma.attendance.create({
        data: { usn: student.usn, course_code: 'AM501', status: 'present', date: dates[0], recorded_by: faculty.emp_id }
    });
    await prisma.attendance.create({
        data: { usn: student.usn, course_code: 'AM501', status: 'absent', date: dates[1], recorded_by: faculty.emp_id }
    });
    console.log('Seeded historical attendance (50% attendance rate).');

    // Call markAttendance with another 'absent' mark (drops attendance to 33.3%)
    const reqMark = {
        user: { roleId: faculty.emp_id, id: faculty.user_id },
        params: { courseCode: 'AM501' },
        body: { usn: student.usn, status: 'absent', date: '2026-06-03' }
    } as any;
    const resMark = mockResponse();

    await markAttendance(reqMark, resMark, () => {});
    console.log('Invoked markAttendance handler.');

    // Fetch and check if notification was created
    const warnings = await prisma.notification.findMany({
        where: { user_id: student.user_id, type: 'Attendance Warning' }
    });

    if (warnings.length > 0) {
        console.log('✅ SUCCESS: Attendance Warning Notification Created in real-time!');
        console.log(`Notification Content: "${warnings[0].content}"`);
    } else {
        console.error('❌ FAILURE: No Attendance Warning Notification found.');
    }

    // 5. Test Risk alerts (direct call to emailService to show email dispatch/mock logging)
    console.log('\n--- TESTING EMAIL SERVICE (HIGH-RISK ALERTS) ---');
    await sendHighRiskAlertEmail(
        faculty.user.email,
        faculty.user.full_name,
        student.user.full_name,
        student.usn,
        'AM501',
        0.87,
        'Student has very poor quiz performance and attendance is critically low (33.3%).'
    );

    console.log('\n--- TEST COMPLETE ---');
}

main()
    .catch(err => {
        console.error('Test script failed with error:', err);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
