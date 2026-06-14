import { prisma } from '../config/db';

async function main() {
    const targetDate = new Date('2026-05-22');
    console.log("Deleting holidays for 2026-05-22...");
    const deleteResult = await prisma.holiday.deleteMany({
        where: { date: targetDate }
    });
    console.log(`Successfully deleted ${deleteResult.count} holiday entries.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
