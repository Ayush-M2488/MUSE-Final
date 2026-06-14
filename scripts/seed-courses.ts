import { prisma } from './backend/config/db.js';

const departments = [
    { name: 'AI & ML', prefix: 'AIML', baseNames: ['Mathematics', 'Programming', 'Core AI', 'Machine Learning', 'Lab'] },
    { name: 'AI & DS', prefix: 'AIDS', baseNames: ['Statistics', 'Data Science', 'Programming', 'Analytics', 'Lab'] },
    { name: 'CS Design', prefix: 'CSD', baseNames: ['Mathematics', 'Design Principles', 'Programming', 'HCI', 'Lab'] },
    { name: 'Biomedical', prefix: 'BME', baseNames: ['Biology', 'Medical Devices', 'Engineering', 'Signal Processing', 'Lab'] },
    { name: 'CSE', prefix: 'CSE', baseNames: ['Mathematics', 'Data Structures', 'Algorithms', 'Networking', 'Lab'] }
];

async function seedCourses() {
    console.log('Seeding courses...');
    const coursesToInsert = [];

    for (const dept of departments) {
        for (let sem = 1; sem <= 8; sem++) {
            for (let i = 0; i < 5; i++) {
                const code = `${dept.prefix}${sem}0${i + 1}`;
                const level = sem <= 2 ? 'Introductory' : sem <= 5 ? 'Intermediate' : 'Advanced';
                const name = `${level} ${dept.baseNames[i]} (Sem ${sem})`;

                coursesToInsert.push({
                    course_code: code,
                    course_name: name,
                    department: dept.name,
                    semester: sem,
                    credits: i === 4 ? 2 : 4 // Lab gets 2 credits, others 4
                });
            }
        }
    }

    try {
        await prisma.course.createMany({
            data: coursesToInsert,
            skipDuplicates: true
        });
        console.log(`Successfully seeded ${coursesToInsert.length} courses!`);
    } catch (error) {
        console.error('Error seeding courses:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedCourses();
