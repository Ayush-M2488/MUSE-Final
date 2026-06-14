const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function restoreAdmin() {
    try {
        console.log('Restoring admin user...');
        
        // 1. Hash the default password
        const passwordHash = await bcrypt.hash('password123', 10);
        
        // 2. Check if admin already exists (just in case)
        let adminUser = await prisma.user.findUnique({
            where: { email: 'admin@muse.ac.in' }
        });

        if (!adminUser) {
            // 3. Create the user
            adminUser = await prisma.user.create({
                data: {
                    email: 'admin@muse.ac.in',
                    password_hash: passwordHash,
                    role: 'admin',
                    full_name: 'System Administrator',
                    status: 'active',
                    admin: {
                        create: {
                            admin_id: 'ADM-001',
                            department: 'Administration'
                        }
                    }
                }
            });
            console.log('Admin user restored successfully!', adminUser.email);
        } else {
            console.log('Admin user already exists.');
        }
    } catch (err) {
        console.error('Error restoring admin user:', err);
    } finally {
        await prisma.$disconnect();
    }
}

restoreAdmin();
