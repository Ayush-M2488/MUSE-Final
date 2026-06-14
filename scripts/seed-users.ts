import { prisma } from './backend/config/db.js';
import bcrypt from 'bcrypt';

async function seedUsers() {
    console.log('Seeding students and faculty...');
    const passwordHash = await bcrypt.hash('password123', 10);

    const configs = [
        { dept: 'AI & ML', prefix: 'AIML', sems: [3, 5] },
        { dept: 'CSE', prefix: 'CSE', sems: [3, 5] }
    ];

    let usnCounter = 1;
    let empCounter = 1;

    try {
        for (const config of configs) {
            for (const sem of config.sems) {
                // 1. Create Faculty for this Dept and Semester
                const facultyEmail = `faculty_${config.prefix.toLowerCase()}_sem${sem}@muse.ac.in`;
                
                let facultyUser = await prisma.user.findUnique({ where: { email: facultyEmail } });
                if (!facultyUser) {
                    facultyUser = await prisma.user.create({
                        data: {
                            email: facultyEmail,
                            password_hash: passwordHash,
                            role: 'teacher',
                            full_name: `${config.prefix} Professor (Sem ${sem})`,
                            status: 'active'
                        }
                    });
                }

                const empId = `EMP-${config.prefix}-${sem}00${empCounter++}`;
                let faculty = await prisma.faculty.findUnique({ where: { emp_id: empId } });
                if (!faculty) {
                    // check if user already has a faculty
                    faculty = await prisma.faculty.findFirst({ where: { user_id: facultyUser.id } });
                    if (!faculty) {
                        faculty = await prisma.faculty.create({
                            data: {
                                emp_id: empId,
                                user_id: facultyUser.id,
                                department: config.dept,
                                designation: 'Assistant Professor'
                            }
                        });
                    }
                }

                // Get courses for this dept and semester
                const courses = await prisma.course.findMany({
                    where: { department: config.dept, semester: sem }
                });

                // 2. Create 5 Students for this Dept and Semester
                const studentsToCreate = [];
                for (let i = 1; i <= 5; i++) {
                    const studentEmail = `student_${config.prefix.toLowerCase()}_sem${sem}_${i}@muse.ac.in`;
                    let studentUser = await prisma.user.findUnique({ where: { email: studentEmail } });
                    if (!studentUser) {
                        studentUser = await prisma.user.create({
                            data: {
                                email: studentEmail,
                                password_hash: passwordHash,
                                role: 'student',
                                full_name: `${config.prefix} Student ${i} (Sem ${sem})`,
                                status: 'active'
                            }
                        });
                    }

                    const usn = `${config.prefix}00${usnCounter++}`;
                    let student = await prisma.student.findUnique({ where: { usn } });
                    if (!student) {
                        student = await prisma.student.create({
                            data: {
                                usn,
                                user_id: studentUser.id,
                                program: `B.E. ${config.dept}`,
                                department: config.dept,
                                semester: sem,
                                enrollment_date: new Date()
                            }
                        });
                    }
                    studentsToCreate.push(student);
                }

                // 3. Enroll students in the courses under this faculty
                console.log(`Enrolling students for ${config.dept} Sem ${sem} under ${facultyEmail}...`);
                const enrollments = [];
                for (const student of studentsToCreate) {
                    for (const course of courses) {
                        enrollments.push({
                            usn: student.usn,
                            course_code: course.course_code,
                            faculty_emp_id: faculty.emp_id,
                            section: 'A'
                        });
                    }
                }

                if (enrollments.length > 0) {
                    await prisma.enrollment.createMany({
                        data: enrollments,
                        skipDuplicates: true
                    });
                }
            }
        }
        console.log('Successfully seeded students, faculty, and enrollments!');
    } catch (error) {
        console.error('Error seeding users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedUsers();
