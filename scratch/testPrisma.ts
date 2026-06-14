import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  try {
    const results = await prisma.$queryRaw`
      SELECT 
          s.usn, 
          u.full_name as name, 
          s.department as dept, 
          s.semester as sem,
          COUNT(a.id) as total,
          SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN attendance a ON s.usn = a.student_usn
      GROUP BY s.usn, u.full_name, s.department, s.semester
    `;
    console.log("Success:", results);
  } catch(e) {
    console.error("Prisma Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
