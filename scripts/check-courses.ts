import { prisma } from './backend/config/db.js';
prisma.course.findMany().then(c => console.log(c)).finally(() => prisma.$disconnect());
