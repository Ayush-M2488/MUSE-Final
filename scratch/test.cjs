const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function test() {
  try {
    const results = await prisma.$queryRaw`
      SELECT 
          s.usn, 
          COUNT(a.id) as total,
          SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present
      FROM students s
      LEFT JOIN attendance a ON s.usn = a.student_usn
      GROUP BY s.usn
    `;
    console.log(results);
  } catch(e) {
    console.error('Error:', e);
  }
}
test();
