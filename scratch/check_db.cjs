const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const p = await prisma.prediction.findFirst({
        include: { explanations: true },
        orderBy: { predicted_at: 'desc' }
    });
    console.log(JSON.stringify(p, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
