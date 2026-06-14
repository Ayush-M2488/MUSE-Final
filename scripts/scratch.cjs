const { Pool } = require('pg');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    try {
        console.log("=== DB REPAIR DETECTIVE ===");
        
        // Find teacher 'ayush'
        const teacher = await prisma.faculty.findFirst({
            where: {
                user: {
                    full_name: {
                        contains: 'ayush',
                        mode: 'insensitive'
                    }
                }
            },
            include: {
                user: true
            }
        });

        if (!teacher) {
            console.log("Could not find teacher 'ayush' in the database.");
            return;
        }

        console.log(`Found teacher: ${teacher.user.full_name} (${teacher.emp_id})`);

        // The subjects they teach are: AM501, AM801, AM403, AM104
        const coursesToAssign = ['AM501', 'AM801', 'AM403', 'AM104'];

        for (const cc of coursesToAssign) {
            const courseRecord = await prisma.course.findUnique({
                where: { course_code: cc }
            });

            if (courseRecord) {
                // Find all students in this department and semester
                const students = await prisma.student.findMany({
                    where: {
                        department: courseRecord.department,
                        semester: courseRecord.semester
                    }
                });

                console.log(`Course ${cc}: Found ${students.length} students in sem ${courseRecord.semester} of ${courseRecord.department}.`);

                for (const s of students) {
                    const upserted = await prisma.enrollment.upsert({
                        where: {
                            usn_course_code: {
                                usn: s.usn,
                                course_code: cc
                            }
                        },
                        update: {
                            faculty_emp_id: teacher.emp_id
                        },
                        create: {
                            usn: s.usn,
                            course_code: cc,
                            faculty_emp_id: teacher.emp_id,
                            section: 'A'
                        }
                    });
                    console.log(`  Mapped student ${s.usn} for course ${cc} to teacher ${teacher.emp_id}`);
                }
            } else {
                console.log(`Course ${cc} not found in catalog.`);
            }
        }

        console.log("\n=== POST-REPAIR ENROLLMENT CHECK ===");
        const activeEnrollments = await prisma.enrollment.findMany({
            where: {
                faculty_emp_id: teacher.emp_id
            },
            include: {
                course: true
            }
        });
        console.log(`Total active enrollments under ${teacher.user.full_name}: ${activeEnrollments.length}`);
        for (const ae of activeEnrollments) {
            console.log(`  USN: ${ae.usn} | Course: ${ae.course_code} (${ae.course?.course_name})`);
        }

    } catch (error) {
        console.error("Error in repair script:", error);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
