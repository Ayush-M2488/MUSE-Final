import { prisma } from './backend/config/db'; 
async function run() { 
  const student = await prisma.student.findFirst({ 
    where: { user: { full_name: { contains: 'Punith', mode: 'insensitive' } } }, 
    include: { user: true, enrollments: true, assessments: true } 
  }); 
  console.dir(student, { depth: null }); 
} 
run().finally(() => prisma.$disconnect());
