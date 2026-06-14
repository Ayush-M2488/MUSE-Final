import { prisma } from '../config/db';

async function main() {
    console.log("Checking holidays in the database...");
    const holidays = await prisma.holiday.findMany();
    console.log("All holidays:", holidays.map(h => ({
        id: h.id,
        date: h.date.toISOString().split('T')[0],
        description: h.description,
        course_code: h.course_code
    })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
