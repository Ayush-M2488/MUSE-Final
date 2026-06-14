import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    console.log('--- TESTING STUDENT GRIEVANCES ENDPOINT VIA HTTP ---');
    const user = await prisma.user.findFirst({
        where: { email: 'john.doe@muse.ac.in' },
        include: { student: true }
    });

    if (!user || !user.student) {
        console.error('Student user john.doe@muse.ac.in not found');
        return;
    }

    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, roleId: user.student.usn },
        process.env.JWT_SECRET || 'muse_super_secret_jwt_key_2026',
        { expiresIn: '24h' }
    );

    console.log('Generated JWT token successfully.');

    try {
        const response = await axios.get('http://localhost:3000/api/student/grievances', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log('GET STATUS:', response.status);
        console.log('Grievances count:', response.data.length);
        console.log('First grievance item:', response.data[0]);
    } catch (err: any) {
        console.error('Request failed with error:');
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', err.response.data);
        } else {
            console.error(err.message);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
