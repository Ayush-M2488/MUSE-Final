import { prisma } from '../config/db';

async function main() {
    console.log("Checking faculty with emp_id = 'TBD'...");
    const tbdFaculty = await prisma.faculty.findUnique({
        where: { emp_id: 'TBD' }
    });
    console.log("Faculty 'TBD' exists:", !!tbdFaculty);

    console.log("Finding all faculty members:");
    const allFaculty = await prisma.faculty.findMany({
        include: { user: { select: { full_name: true } } }
    });
    console.log(allFaculty.map(f => ({ emp_id: f.emp_id, name: f.user.full_name, dept: f.department })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
