import { prisma } from '../backend/config/db.js';

async function test() {
    const targetDate = new Date('2026-06-01T00:00:00.000Z');
    
    console.log("UTC Day:", targetDate.getUTCDay());
    
    const holiday = await prisma.holiday.findFirst({
        where: { date: targetDate }
    });
    console.log("Holiday:", holiday);
    
    const targetDate2 = new Date('2026-06-05T00:00:00.000Z');
    console.log("UTC Day 2:", targetDate2.getUTCDay());
    const holiday2 = await prisma.holiday.findFirst({
        where: { date: targetDate2 }
    });
    console.log("Holiday 2:", holiday2);
}

test()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
