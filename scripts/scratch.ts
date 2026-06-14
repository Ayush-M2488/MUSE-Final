import { prisma } from './backend/config/db';

async function main() {
    const count = await prisma.fee.count();
    console.log(`Total fee records: ${count}`);
    const sample = await prisma.fee.findMany({ take: 5 });
    console.log('Sample:', sample);
}

main().catch(console.error).finally(() => prisma.$disconnect());
