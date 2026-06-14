import { prisma } from './backend/config/db.js';

async function migrateData() {
    console.log('Starting data migration...');

    try {
        // 1. Delete all existing enrollments to clean up old links
        await prisma.enrollment.deleteMany();
        console.log('Deleted old enrollments.');

        // Optional: Delete old courses (like CS501, CS504) that don't match our new pattern 
        // (AIML, AIDS, CSD, BME, CSE).
        const allCourses = await prisma.course.findMany();
        const newPrefixes = ['AIML', 'AIDS', 'CSD', 'BME', 'CSE'];
        const oldCourseCodes = allCourses
            .map(c => c.course_code)
            .filter(code => !newPrefixes.some(p => code.startsWith(p)));
        
        if (oldCourseCodes.length > 0) {
            await prisma.course.deleteMany({
                where: { course_code: { in: oldCourseCodes } }
            });
            console.log(`Deleted old legacy courses: ${oldCourseCodes.join(', ')}`);
        }

        // 2. Fetch all students
        const students = await prisma.student.findMany();
        console.log(`Found ${students.length} students.`);

        // 3. Fetch all faculties grouped by department
        const faculties = await prisma.faculty.findMany();
        const deptFaculties = {};
        for (const fac of faculties) {
            if (!deptFaculties[fac.department]) deptFaculties[fac.department] = [];
            deptFaculties[fac.department].push(fac);
        }

        // 4. Re-enroll students
        const newEnrollments = [];
        let missingFacultyDepts = new Set();

        for (const student of students) {
            // Find courses for this student's department and semester
            const matchingCourses = await prisma.course.findMany({
                where: { department: student.department, semester: student.semester }
            });

            const facsInDept = deptFaculties[student.department] || [];
            if (facsInDept.length === 0) {
                missingFacultyDepts.add(student.department);
                continue; // Cannot enroll without a faculty
            }

            for (const course of matchingCourses) {
                // Assign to a random faculty in that department, or round-robin
                const faculty = facsInDept[Math.floor(Math.random() * facsInDept.length)];
                
                newEnrollments.push({
                    usn: student.usn,
                    course_code: course.course_code,
                    faculty_emp_id: faculty.emp_id,
                    section: 'A'
                });
            }
        }

        if (newEnrollments.length > 0) {
            await prisma.enrollment.createMany({
                data: newEnrollments,
                skipDuplicates: true
            });
            console.log(`Created ${newEnrollments.length} new enrollments using the seeded subjects!`);
        }

        if (missingFacultyDepts.size > 0) {
            console.log(`Warning: Could not enroll students in departments without faculty: ${[...missingFacultyDepts].join(', ')}`);
        }

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

migrateData();
