import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    console.log(Object.keys(prisma));
    console.log("MentorshipMessage:", !!prisma.mentorshipMessage);
}
check().finally(() => prisma.$disconnect());
