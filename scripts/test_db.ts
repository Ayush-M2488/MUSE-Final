import { prisma } from './backend/config/db.js';

async function main() {
    const msgs = await prisma.mentorshipMessage.findMany({
        orderBy: { sent_at: 'desc' },
        take: 5
    });
    console.log(JSON.stringify(msgs, null, 2));
}

main().finally(() => process.exit(0));
