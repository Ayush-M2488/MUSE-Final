import nodemailer from 'nodemailer';

export async function sendHighRiskAlertEmail(
    teacherEmail: string,
    teacherName: string,
    studentName: string,
    studentUsn: string,
    courseCode: string,
    riskScore: number,
    explanation: string
) {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    const emailSubject = `⚠️ ALERT: Critical Intervention Required for Student in ${courseCode}`;
    const emailText = `Dear ${teacherName},\n\nThe MUSE AI Academic Standing System has flagged the following student for CRITICAL INTERVENTION:\n\n- Student: ${studentName} (${studentUsn})\n- Course: ${courseCode}\n\nAI Explanation:\n"${explanation}"\n\nPlease review their records and log an intervention in your Teacher Dashboard if needed.\n\nThis is an automated alert based on your notification preferences.`;
    
    const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 20px; color: #1f2937; max-width: 600px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px;">
                <span style="font-size: 24px;">⚠️</span>
                <h2 style="margin: 0; color: #dc2626; font-size: 20px; font-weight: 700;">Critical Intervention Required</h2>
            </div>
            <p style="font-size: 15px; line-height: 1.5; margin-bottom: 16px;">Dear ${teacherName},</p>
            <p style="font-size: 15px; line-height: 1.5; margin-bottom: 16px;">The MUSE AI Academic Standing System has flagged a student in one of your courses for <strong>CRITICAL INTERVENTION</strong>:</p>
            
            <div style="background-color: #f9fafb; border-left: 4px solid #dc2626; padding: 16px; margin-bottom: 20px; border-radius: 4px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr>
                        <td style="padding: 4px 0; font-weight: 600; width: 120px;">Student Name:</td>
                        <td style="padding: 4px 0;">${studentName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 4px 0; font-weight: 600;">USN:</td>
                        <td style="padding: 4px 0; font-family: monospace;">${studentUsn}</td>
                    </tr>
                    <tr>
                        <td style="padding: 4px 0; font-weight: 600;">Course Code:</td>
                        <td style="padding: 4px 0; font-family: monospace;">${courseCode}</td>
                    </tr>

                </table>
            </div>

            <div style="margin-bottom: 24px;">
                <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #4b5563;">AI Explanation & Insights:</h4>
                <p style="margin: 0; font-size: 14px; font-style: italic; background-color: #f3f4f6; padding: 12px; border-radius: 6px; line-height: 1.4;">
                    "${explanation}"
                </p>
            </div>

            <p style="font-size: 14px; color: #4b5563; line-height: 1.5; margin-bottom: 24px;">
                Please log into your dashboard to review their overall attendance, assessment grades, and log any academic/personal interventions.
            </p>
            
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin-bottom: 16px;" />
            <p style="font-size: 11px; color: #9ca3af; line-height: 1.4; margin: 0;">
                This notification was sent automatically because you have "Risk alerts" enabled in your Notification Preferences. To change this settings, navigate to Settings > Notification Preferences in your Teacher Dashboard.
            </p>
        </div>
    `;

    if (host && user && pass) {
        try {
            const transporter = nodemailer.createTransport({
                host,
                port,
                secure: port === 465,
                auth: { user, pass }
            });

            await transporter.sendMail({
                from: `"MUSE Alert" <${user}>`,
                to: teacherEmail,
                subject: emailSubject,
                text: emailText,
                html: emailHtml
            });

            console.log(`[SMTP] High risk alert email successfully sent to ${teacherEmail}`);
        } catch (error) {
            console.error(`[SMTP ERROR] Failed to send high-risk alert email:`, error);
        }
    } else {
        console.warn(`[SMTP UNCONFIGURED] Fallback mock email triggered:`);
        console.log(`
=============================================================================
=============================================================================
📧 MOCK CRITICAL INTERVENTION STUDENT EMAIL DISPATCHED
-----------------------------------------------------------------------------
To: ${teacherName} <${teacherEmail}>
Subject: ${emailSubject}

Dear ${teacherName},

The MUSE AI Academic Standing System has flagged the following student for CRITICAL INTERVENTION:

- Student: ${studentName} (${studentUsn})
- Course: ${courseCode}

AI Explanation:
"${explanation}"

Please review their records and log an intervention in your Teacher Dashboard if needed.

This is an automated alert based on your notification preferences.
=============================================================================
        `);
    }
}

export const sendPasswordResetEmail = async (toEmail: string, resetToken: string) => {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    const emailSubject = 'Password Reset Request';
    const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #1f2937;">Password Reset</h2>
            <p>You requested a password reset for your MUSE account.</p>
            <p>Click the button below to set a new password:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2D9CDB; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">This link will expire in 1 hour.</p>
            <p style="font-size: 12px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
        </div>
    `;

    if (host && user && pass) {
        try {
            const transporter = nodemailer.createTransport({
                host,
                port,
                secure: port === 465,
                auth: { user, pass }
            });

            await transporter.sendMail({
                from: `"MUSE System" <${user}>`,
                to: toEmail,
                subject: emailSubject,
                html: emailHtml
            });
            console.log(`[SMTP] Reset email successfully sent to ${toEmail}`);
            return true;
        } catch (error) {
            console.error(`[SMTP ERROR] Failed to send reset email:`, error);
            return false;
        }
    } else {
        console.warn(`[SMTP UNCONFIGURED] Mock reset link generated for ${toEmail}: ${resetUrl}`);
        return true;
    }
};
