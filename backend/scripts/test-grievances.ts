import { prisma } from '../config/db';

async function main() {
    console.log('--- STARTING GRIEVANCE PORTAL DATABASE INTEGRATION TEST ---');

    // 1. Find the test student (John Doe)
    const student = await prisma.student.findFirst({
        where: { user: { email: 'john.doe@muse.ac.in' } },
        include: { user: true }
    });

    if (!student) {
        console.error('ERROR: Test student john.doe@muse.ac.in not found. Seed the database first.');
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

    // 3. Clear existing test grievances to start fresh
    await prisma.grievance.deleteMany({
        where: { student_usn: student.usn }
    });
    console.log('Cleaned up previous test grievances.');

    // 4. Create a teacher-directed grievance
    const gTeacher = await prisma.grievance.create({
        data: {
            student_usn: student.usn,
            target_type: 'teacher',
            target_emp_id: faculty.emp_id,
            course_code: 'AM501',
            message: 'Test teacher grievance: Query regarding grading consistency.',
            status: 'pending'
        }
    });
    console.log('Created teacher-directed grievance successfully:', gTeacher.id);

    // 5. Create an admin-directed grievance
    const gAdmin = await prisma.grievance.create({
        data: {
            student_usn: student.usn,
            target_type: 'admin',
            message: 'Test admin grievance: Classroom projector malfunctions.',
            status: 'pending'
        }
    });
    console.log('Created admin-directed grievance successfully:', gAdmin.id);

    // 6. Query student grievances
    const sList = await prisma.grievance.findMany({
        where: { student_usn: student.usn },
        include: { faculty: { include: { user: true } }, course: true }
    });
    console.log(`Retrieved student grievances list. Count: ${sList.length}`);
    sList.forEach(g => {
        console.log(` - ID: ${g.id} | Target: ${g.target_type} | Status: ${g.status} | Message: ${g.message}`);
    });

    // 7. Resolve teacher grievance
    const resolvedTeacher = await prisma.grievance.update({
        where: { id: gTeacher.id },
        data: {
            response: 'Meeting scheduled to review marks on Friday.',
            status: 'resolved',
            updated_at: new Date()
        }
    });
    console.log('Teacher grievance resolved successfully:', resolvedTeacher.status, '| Response:', resolvedTeacher.response);

    // 8. Resolve admin grievance
    const resolvedAdmin = await prisma.grievance.update({
        where: { id: gAdmin.id },
        data: {
            response: 'Technician dispatched. Will be resolved by tomorrow morning.',
            status: 'resolved',
            updated_at: new Date()
        }
    });
    console.log('Admin grievance resolved successfully:', resolvedAdmin.status, '| Response:', resolvedAdmin.response);

    console.log('--- GRIEVANCE PORTAL INTEGRATION TEST PASSED SUCCESSFULLY ---');
}

main()
    .catch(err => {
        console.error('Grievance test script failed with error:', err);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
