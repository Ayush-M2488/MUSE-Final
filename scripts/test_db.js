import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const msgs = await prisma.mentorshipMessage.findMany({
        orderBy: { sent_at: 'desc' },
        take: 5
    });
    console.log(JSON.stringify(msgs, null, 2));
}

main().finally(() => prisma.$disconnect());
