import { Request, Response, RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../services/emailService';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db'; 

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not defined');
}

export const login: RequestHandler = async (req, res, next) => {
    const { email, password, role } = req.body;

    if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
    }

    try {
        // 1. Find user by email with relations
        const user = await prisma.user.findUnique({
            where: { email: email.trim().toLowerCase() },
            include: {
                student: true,
                faculty: true,
                admin: true
            }
        });

        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        if (user.status !== 'active') {
            res.status(403).json({ error: 'Your account has been deactivated. Please contact an administrator.' });
            return;
        }

        // 2. Verify password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        // Check requested role mismatch
        if (role && user.role !== role) {
             res.status(401).json({ error: `Account exists but is not registered as a ${role}` });
             return;
        }

        // 3. Fetch Role-Specific ID (USN, EmpID, AdminID)
        let roleId = null;
        if (user.role === 'student' && user.student) {
            roleId = user.student.usn;
        } else if (user.role === 'teacher' && user.faculty) {
            roleId = user.faculty.emp_id;
        } else if (user.role === 'admin' && user.admin) {
            roleId = user.admin.admin_id;
        }

        const require_password_change = await bcrypt.compare('password123', user.password_hash);

        // 4. Update last login timestamp
        await prisma.user.update({
            where: { id: user.id },
            data: { last_login: new Date() }
        });

        // 5. Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, roleId },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // 6. Return response
        res.json({
            token,
            user: {
                id: roleId || user.id, // Frontend expects USN/EmpID as 'id'
                uuid: user.id,
                name: user.full_name,
                email: user.email,
                role: user.role,
                is_hod: user.faculty?.is_hod || false,
                require_password_change
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateProfile: RequestHandler = async (req, res, next) => {
    // Requires verifyToken middleware
    const userId = req.user?.id;
    const { name, email } = req.body;
    
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { full_name: name, email }
        });
        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

export const forgotPassword: RequestHandler = async (req, res, next) => {
    const { email } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
        if (!user) {
            // We return success anyway to prevent email enumeration
            res.json({ success: true, message: 'If the email exists, a reset link has been sent.' });
            return;
        }
        
        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        await prisma.user.update({
            where: { id: user.id },
            data: {
                reset_token: resetToken,
                reset_token_expiry: tokenExpiry
            }
        });

        await sendPasswordResetEmail(email, resetToken);
        
        res.json({ success: true, message: 'If the email exists, a reset link has been sent.' });
    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
};

export const resetPassword: RequestHandler = async (req, res, next) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
        res.status(400).json({ error: 'Missing token or password' });
        return;
    }
    
    try {
        const user = await prisma.user.findFirst({
            where: {
                reset_token: token,
                reset_token_expiry: { gt: new Date() }
            }
        });

        if (!user) {
            res.status(400).json({ error: 'Invalid or expired token' });
            return;
        }

        const password_hash = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password_hash,
                reset_token: null,
                reset_token_expiry: null
            }
        });

        res.json({ success: true, message: 'Password has been reset successfully.' });
    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
};

export const googleSSO: RequestHandler = async (req, res, next) => {
    // This is a mocked endpoint for SSO. In production, this would verify a Google JWT token.
    res.json({ success: true, message: 'Google SSO flow initiated' });
};
export const changePassword: RequestHandler = async (req, res, next) => {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    if (!currentPassword || !newPassword) {
        res.status(400).json({ error: 'Current and new password are required' });
        return;
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            res.status(400).json({ error: 'Incorrect current password' });
            return;
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password_hash: hashedNewPassword }
        });

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change Password Error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
};
