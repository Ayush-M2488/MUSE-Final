import { prisma } from '../config/db';

async function main() {
    const users = await prisma.user.findMany({
        include: { student: true, faculty: true, admin: true }
    });
    console.log(`Total users in DB: ${users.length}`);
    users.forEach(u => {
        console.log(`- Email: ${u.email} | Role: ${u.role} | Name: ${u.full_name} | ID/USN: ${u.student?.usn || u.faculty?.emp_id || u.admin?.admin_id || 'None'}`);
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
