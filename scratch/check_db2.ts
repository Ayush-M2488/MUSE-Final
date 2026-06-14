import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function check() {
    const p = await prisma.prediction.findMany({
        where: { course_code: 'CS-504' },
        include: { explanations: true },
        orderBy: { predicted_at: 'desc' },
        take: 1
    });
    console.log(JSON.stringify(p, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
