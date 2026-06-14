import { prisma } from '../config/db';
import bcrypt from 'bcrypt';

async function main() {
    console.log("Ensuring 'TBD' placeholder faculty exists...");
    
    // Check if the TBD user exists
    let tbdUser = await prisma.user.findFirst({
        where: { email: 'tbd.faculty@muse.ac.in' }
    });

    if (!tbdUser) {
        const passwordHash = await bcrypt.hash('tbdpassword123', 10);
        tbdUser = await prisma.user.create({
            data: {
                email: 'tbd.faculty@muse.ac.in',
                password_hash: passwordHash,
                role: 'teacher',
                full_name: 'To Be Decided',
                status: 'active'
            }
        });
        console.log("Created TBD placeholder user:", tbdUser.id);
    } else {
        console.log("TBD placeholder user already exists:", tbdUser.id);
    }

    // Check if the TBD faculty exists
    const tbdFaculty = await prisma.faculty.findUnique({
        where: { emp_id: 'TBD' }
    });

    if (!tbdFaculty) {
        const newFaculty = await prisma.faculty.create({
            data: {
                emp_id: 'TBD',
                user_id: tbdUser.id,
                department: 'All',
                designation: 'Placeholder'
            }
        });
        console.log("Created TBD placeholder faculty:", newFaculty.emp_id);
    } else {
        console.log("TBD placeholder faculty already exists.");
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
