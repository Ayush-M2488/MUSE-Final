import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEPARTMENTS = [
    { name: 'AI & ML', prefix: 'AM' },
    { name: 'AI & DS', prefix: 'AD' },
    { name: 'CS Design', prefix: 'CD' },
    { name: 'Biomedical', prefix: 'BM' },
    { name: 'CSE', prefix: 'CSE' }
];

// Department-specific subject maps for all 8 semesters
const DEPT_SUBJECTS: Record<string, Record<number, string[]>> = {
    'AI & ML': {
        1: ['Engineering Math I', 'Engineering Physics', 'Basic Electrical Eng', 'Programming in C', 'Engineering Graphics'],
        2: ['Engineering Math II', 'Engineering Chemistry', 'Basic Electronics', 'Data Structures & Algos', 'Applied Mechanics'],
        3: ['Discrete Mathematical Structures', 'Object Oriented Programming', 'Digital Electronics', 'Unix & Shell Programming', 'AI Foundations'],
        4: ['Database Management Systems', 'Operating Systems', 'Design & Analysis of Algos', 'Software Engineering', 'Python for AI'],
        5: ['Machine Learning', 'Deep Learning', 'Computer Networks', 'Formal Languages & Automata', 'System Software'],
        6: ['Natural Language Processing', 'Computer Vision', 'Reinforcement Learning', 'AI Ethics & Laws', 'Cloud Computing'],
        7: ['Big Data Analytics', 'Internet of Things', 'Information & Cyber Security', 'Optimization Techniques', 'Distributed Systems'],
        8: ['Major Project Work', 'Technical Seminar', 'Internship Viva-Voce', 'Research Methodology', 'Elective']
    },
    'AI & DS': {
        1: ['Engineering Math I', 'Engineering Physics', 'Basic Electrical Eng', 'Programming in C', 'Engineering Graphics'],
        2: ['Engineering Math II', 'Engineering Chemistry', 'Basic Electronics', 'Data Structures & Algos', 'Applied Mechanics'],
        3: ['Discrete Mathematical Structures', 'Object Oriented Programming', 'Digital Electronics', 'Unix & Shell Programming', 'Probability & Stats'],
        4: ['Database Management Systems', 'Operating Systems', 'Design & Analysis of Algos', 'Software Engineering', 'Data Wrangling'],
        5: ['Data Mining & Warehousing', 'Predictive Analytics', 'Computer Networks', 'Automata Theory', 'Machine Learning in DS'],
        6: ['Big Data Technologies', 'Business Intelligence', 'Data Visualization', 'Ethics in Data Science', 'Cloud Computing'],
        7: ['NoSQL Databases', 'Internet of Things', 'Information & Cyber Security', 'Deep Learning for Data', 'Distributed Systems'],
        8: ['Major Project Work', 'Technical Seminar', 'Internship Viva-Voce', 'Research Methodology', 'Elective']
    },
    'CS Design': {
        1: ['Engineering Math I', 'Engineering Physics', 'Basic Electrical Eng', 'Programming in C', 'Engineering Graphics'],
        2: ['Engineering Math II', 'Engineering Chemistry', 'Basic Electronics', 'Data Structures & Algos', 'Applied Mechanics'],
        3: ['Discrete Mathematical Structures', 'Object Oriented Programming', 'Digital Electronics', 'Introduction to Design', 'UI/UX Principles'],
        4: ['Database Management Systems', 'Operating Systems', 'Design & Analysis of Algos', 'Software Engineering', 'Computer Graphics'],
        5: ['Human Computer Interaction', 'Virtual & Augmented Reality', 'Computer Networks', 'Game Design Foundations', 'Interaction Design'],
        6: ['Web Development', 'Mobile App Development', '3D Modeling & Animation', 'Ethics in Computing', 'Cloud Computing'],
        7: ['Big Data Design', 'Internet of Things', 'Information & Cyber Security', 'Multimedia Systems', 'Distributed Systems'],
        8: ['Major Project Work', 'Technical Seminar', 'Internship Viva-Voce', 'Research Methodology', 'Elective']
    },
    'Biomedical': {
        1: ['Engineering Math I', 'Engineering Physics', 'Basic Electrical Eng', 'Programming in C', 'Engineering Graphics'],
        2: ['Engineering Math II', 'Engineering Chemistry', 'Basic Electronics', 'Data Structures & Algos', 'Applied Mechanics'],
        3: ['Human Anatomy & Physiology', 'Biomedical Sensors', 'Network Analysis', 'Electronic Circuits', 'Medical Biochemistry'],
        4: ['Medical Instrumentation I', 'Signal & Linear Systems', 'Digital Electronics', 'Biomaterials', 'Pathology & Microbiology'],
        5: ['Medical Instrumentation II', 'Diagnostic Medical Imaging', 'Microcontrollers & Embedded', 'Medical Informatics', 'Bio-signal Processing'],
        6: ['Biomedical Equipment Control', 'Biotelemetry & Telemedicine', 'Rehabilitation Engineering', 'Hospital Engineering & Ethics', 'Artificial Organs'],
        7: ['Biophotonics & Laser', 'Medical Device Regulations', 'Information & Cyber Security', 'Embedded Systems in Medicine', 'Biomechanics'],
        8: ['Major Project Work', 'Technical Seminar', 'Internship Viva-Voce', 'Research Methodology', 'Elective']
    },
    'CSE': {
        1: ['Engineering Math I', 'Engineering Physics', 'Basic Electrical Eng', 'Programming in C', 'Engineering Graphics'],
        2: ['Engineering Math II', 'Engineering Chemistry', 'Basic Electronics', 'Data Structures & Algos', 'Applied Mechanics'],
        3: ['Discrete Mathematical Structures', 'Object Oriented Programming', 'Digital Electronics', 'Unix & Shell Programming', 'Computer Organization'],
        4: ['Database Management Systems', 'Operating Systems', 'Design & Analysis of Algos', 'Software Engineering', 'Theory of Computation'],
        5: ['Computer Networks', 'Database Systems II', 'Microprocessors', 'Compiler Design', 'Web Technologies'],
        6: ['Software Testing', 'Computer Architecture', 'Cryptography', 'Cloud Computing', 'Artificial Intelligence'],
        7: ['Big Data Analytics', 'Internet of Things', 'Information & Cyber Security', 'Data Mining', 'Distributed Systems'],
        8: ['Major Project Work', 'Technical Seminar', 'Internship Viva-Voce', 'Research Methodology', 'Elective']
    }
};

async function main() {
    console.log('Clearing existing data from all tables...');
    await prisma.systemConfig.deleteMany();
    await prisma.timetable.deleteMany();
    await prisma.task.deleteMany();
    await prisma.fee.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.explanation.deleteMany();
    await prisma.intervention.deleteMany();
    await prisma.prediction.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.announcement.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.course.deleteMany();
    await prisma.student.deleteMany();
    await prisma.faculty.deleteMany();
    await prisma.admin.deleteMany();
    await prisma.user.deleteMany();

    const passwordHash = await bcrypt.hash('password123', 10);

    console.log('Seeding Admin User only...');
    await prisma.user.create({
        data: {
            email: 'admin@muse.ac.in',
            password_hash: passwordHash,
            role: 'admin',
            full_name: 'System Administrator',
            admin: {
                create: {
                    admin_id: 'MUSE-ADM-001',
                    department: 'IT'
                }
            }
        }
    });

    console.log('Seeding Course Metadata (200 Courses)...');
    const coursesData: Array<{ course_code: string, course_name: string, department: string, semester: number, credits: number }> = [];

    for (const d of DEPARTMENTS) {
        const deptSubjects = DEPT_SUBJECTS[d.name];
        for (let sem = 1; sem <= 8; sem++) {
            const subjects = deptSubjects[sem];
            for (let subIdx = 0; subIdx < 5; subIdx++) {
                const code = `${d.prefix}${sem}0${subIdx + 1}`;
                const name = subjects[subIdx];

                coursesData.push({
                    course_code: code,
                    course_name: name,
                    department: d.name,
                    semester: sem,
                    credits: subIdx === 0 ? 4 : 3
                });
            }
        }
    }

    // Bulk insert courses
    await prisma.course.createMany({
        data: coursesData
    });

    console.log('Seeding System Configuration...');
    await prisma.systemConfig.createMany({
        data: [
            { key: 'minAtt', value: '75' },
            { key: 'iaMax', value: '25' },
            { key: 'highT', value: '0.70' },
            { key: 'medT', value: '0.40' },
            { key: 'semStart', value: '2024-08-01' },
            { key: 'semEnd', value: '2024-12-15' },
            { key: 'ay', value: '2024-2025' }
        ]
    });

    console.log('✅ Seeding complete!');
}

main()
    .catch((e) => {
        console.error('Seeding crashed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        pool.end();
    });