import { prisma } from './backend/config/db.js';
import bcrypt from 'bcrypt';

const firstNames = ['Aarav', 'Vihaan', 'Aditya', 'Sai', 'Rohan', 'Ishaan', 'Kabir', 'Ananya', 'Diya', 'Kavya', 'Sanya', 'Riya', 'Mira', 'Isha', 'Ramesh', 'Suresh', 'Anita', 'Sunita', 'Priya', 'Rahul', 'Arjun', 'Sneha', 'Neha', 'Vikas', 'Amit', 'Vikram', 'Pooja', 'Deepak', 'Sanjay', 'Kiran'];
const lastNames = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Das', 'Mehta', 'Reddy', 'Rao', 'Gupta', 'Verma', 'Jain', 'Bose', 'Nair', 'Menon', 'Pillai', 'Iyer', 'Deshmukh', 'Patil', 'Joshi', 'Chopra'];

function getRandomName() {
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

const depts = [
    { name: 'AI & ML', prefix: 'AIML' },
    { name: 'AI & DS', prefix: 'AIDS' },
    { name: 'CS Design', prefix: 'CSD' },
    { name: 'Biomedical', prefix: 'BME' },
    { name: 'CSE', prefix: 'CSE' }
];

async function seed() {
    console.log('Starting full database reset and seeding...');
    
    // 1. Wipe all non-admin users and enrollments
    console.log('Wiping existing data (except admin)...');
    await prisma.enrollment.deleteMany({});
    await prisma.user.deleteMany({
        where: { role: { not: 'admin' } }
    });

    const passwordHash = await bcrypt.hash('password123', 10);
    
    let usnCounter = 1000;
    let empCounter = 100;
    const usersToCreate = [];
    const facultiesToCreate = [];
    const studentsToCreate = [];

    for (const dept of depts) {
        console.log(`Processing department: ${dept.name}`);
        
        // 2. Generate 5 Faculty (without initial course assignments)
        const deptFaculties = [];
        for (let i = 1; i <= 5; i++) {
            const empId = `EMP-${dept.prefix}-${empCounter++}`;
            const name = getRandomName();
            const email = `faculty_${dept.prefix.toLowerCase()}_${i}@muse.ac.in`;
            
            deptFaculties.push({ empId, name, email });
        }

        // 3. Generate Faculty records
        for (const fac of deptFaculties) {
            usersToCreate.push({
                email: fac.email,
                password_hash: passwordHash,
                role: 'teacher',
                full_name: fac.name,
                status: 'active'
            });
            facultiesToCreate.push({
                emp_id: fac.empId,
                email: fac.email, // Temp ref
                department: dept.name,
                designation: 'Assistant Professor'
            });
        }

        // 4. Generate 10 Students per semester (1 to 8) (without initial enrollments until subjects are assigned by admin)
        for (let sem = 1; sem <= 8; sem++) {
            for (let i = 1; i <= 10; i++) {
                const name = getRandomName();
                const email = `student_${dept.prefix.toLowerCase()}_s${sem}_${i}@muse.ac.in`;
                const usn = `${dept.prefix}${usnCounter++}`;

                usersToCreate.push({
                    email,
                    password_hash: passwordHash,
                    role: 'student',
                    full_name: name,
                    status: 'active'
                });

                studentsToCreate.push({
                    usn,
                    email, // Temp ref
                    program: `B.E. ${dept.name}`,
                    department: dept.name,
                    semester: sem,
                    enrollment_date: new Date()
                });
            }
        }
    }

    console.log('Inserting generated Users...');
    await prisma.user.createMany({
        data: usersToCreate,
        skipDuplicates: true
    });

    const createdUsers = await prisma.user.findMany({
        where: { role: { not: 'admin' } },
        select: { id: true, email: true }
    });
    
    const emailToUserId: Record<string, string> = {};
    for (const u of createdUsers) {
        emailToUserId[u.email] = u.id;
    }

    console.log('Inserting generated Faculty...');
    const mappedFaculties = facultiesToCreate.map(f => {
        const { email, ...rest } = f;
        return { ...rest, user_id: emailToUserId[email] };
    }).filter(f => f.user_id); // Ensure user_id exists
    
    await prisma.faculty.createMany({
        data: mappedFaculties,
        skipDuplicates: true
    });

    console.log('Inserting generated Students...');
    const mappedStudents = studentsToCreate.map(s => {
        const { email, ...rest } = s;
        return { ...rest, user_id: emailToUserId[email] };
    }).filter(s => s.user_id);
    
    await prisma.student.createMany({
        data: mappedStudents,
        skipDuplicates: true
    });

    console.log('Inserting default Fee records...');
    const feesToCreate = mappedStudents.map(student => {
        const isClear = Math.random() > 0.3; // 70% clear, 30% pending
        const amount_due = 120000;
        const amount_paid = isClear ? 120000 : (Math.random() > 0.5 ? 45000 : 0);
        return {
            usn: student.usn,
            semester: student.semester,
            amount_due,
            amount_paid,
            status: amount_paid >= amount_due ? 'Clear' : 'Pending',
            due_date: new Date('2026-06-30')
        };
    });
    
    await prisma.fee.createMany({
        data: feesToCreate,
        skipDuplicates: true
    });

    console.log('Seeding completed successfully! No subjects/enrollments were automatically assigned.');
    await prisma.$disconnect();
}

seed().catch(e => {
    console.error(e);
    process.exit(1);
});
