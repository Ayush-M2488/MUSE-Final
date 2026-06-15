import { Request, Response, RequestHandler } from 'express';
import { prisma } from '../config/db';
import { sendHighRiskAlertEmail } from '../services/emailService';

const ML_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5000';

export const generateCoursePredictions: RequestHandler = async (req, res, next) => {
    const empId = req.user?.roleId;
    const { courseCode } = req.params;

    if (!empId) {
        res.status(400).json({ error: 'Employee ID not found in token' });
        return;
    }

    try {
        // Fetch students and their current data for this course
        const enrollments = await prisma.enrollment.findMany({
            where: { course_code: courseCode, faculty_emp_id: empId },
            include: {
                student: {
                    include: {
                        assessments: { where: { course_code: courseCode } },
                        attendance: { where: { course_code: courseCode } }
                    }
                }
            }
        });

        const students = enrollments.map(e => {
            const s = e.student;
            const ia1Find = s.assessments.find(a => a.assessment_type === 'IA-1');
            const ia2Find = s.assessments.find(a => a.assessment_type === 'IA-2');
            const ia3Find = s.assessments.find(a => a.assessment_type === 'IA-3');
            const pracFind = s.assessments.find(a => a.assessment_type === 'Practical');
            
            const ia1 = ia1Find ? ia1Find.score.toNumber() : null;
            const ia2 = ia2Find ? ia2Find.score.toNumber() : null;
            const ia3 = ia3Find ? ia3Find.score.toNumber() : null;
            const practical = pracFind ? pracFind.score.toNumber() : null;
            
            let attendancePercent = 100;
            if (s.attendance.length > 0) {
                const presentCount = s.attendance.filter(a => a.status === 'present').length;
                attendancePercent = (presentCount / s.attendance.length) * 100;
            }

            return {
                usn: s.usn,
                cgpa: s.cgpa?.toNumber() || 0,
                ia1,
                ia2,
                ia3,
                practical,
                attendance: attendancePercent
            };
        });

        if (students.length === 0) {
            res.json({ success: true, predictions: [] });
            return;
        }

        // Call Python ML Service
        const mlResponse = await fetch(`${ML_URL}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ students })
        });

        if (!mlResponse.ok) throw new Error(`ML Service failed with status ${mlResponse.status}`);
        const mlData = await mlResponse.json();

        // EXPLICITLY CAPTURE THE PYTHON MODEL VERSION
        const runtimeVersion = mlData.model_version || 'unknown-model-version';

        await prisma.$transaction(async (tx) => {
            for (const p of mlData.predictions) {
                const pred = await tx.prediction.create({
                    data: {
                        usn: p.usn,
                        course_code: courseCode,
                        risk_level: p.risk_level,
                        risk_score: p.risk_score,
                        explanation_text: p.explanation_text,
                        model_version: runtimeVersion,
                    }
                });

                if (p.factors && Array.isArray(p.factors)) {
                    for (const f of p.factors) {
                        await tx.explanation.create({
                            data: {
                                prediction_id: pred.id,
                                feature_name: f.feature,
                                feature_value: f.value,
                                shap_value: f.shap,
                                impact_description: f.impact
                            }
                        });
                    }
                }
            }
        });

        // Check faculty settings for high risk alerts
        const faculty = await prisma.faculty.findUnique({
            where: { emp_id: empId },
            include: { user: true }
        });

        if (faculty) {
            const prefs = (faculty.notification_prefs as any) || {};
            const emailOnHighRisk = prefs.emailOnHighRisk !== false;

            if (emailOnHighRisk) {
                for (const p of mlData.predictions) {
                    if (p.risk_level === 'High') {
                        const student = await prisma.student.findUnique({
                            where: { usn: p.usn },
                            include: { user: true }
                        });
                        if (student) {
                            sendHighRiskAlertEmail(
                                faculty.user.email,
                                faculty.user.full_name,
                                student.user.full_name,
                                p.usn,
                                courseCode,
                                typeof p.risk_score === 'number' ? p.risk_score : parseFloat(p.risk_score),
                                p.explanation_text
                            ).catch(err => console.error('Failed to send high-risk alert email:', err));
                        }
                    }
                }
            }
        }

        res.json({ success: true });
    } catch (error: any) {
        console.error('ML Error:', error);
        res.status(500).json({ error: `Failed to generate predictions: ${error.message}` });
    }
};

export const getCoursePredictions: RequestHandler = async (req, res, next) => {
    const empId = req.user?.roleId;
    const { courseCode } = req.params;

    if (!empId) {
        res.status(400).json({ error: 'Employee ID not found in token' });
        return;
    }

    try {
        // Fetch distinct latest predictions per USN for this course
        // Since prisma doesn't have a direct distinct ON with full relations easily,
        // we can fetch all predictions for the course, sort by date descending, and filter in JS
        const allPredictions = await prisma.prediction.findMany({
            where: {
                course_code: courseCode,
                student: {
                    enrollments: {
                        some: { faculty_emp_id: empId, course_code: courseCode }
                    }
                }
            },
            include: { explanations: true },
            orderBy: { predicted_at: 'desc' }
        });

        const seenUsn = new Set();
        const latestPredictions = [];
        
        for (const p of allPredictions) {
            if (!seenUsn.has(p.usn)) {
                seenUsn.add(p.usn);
                latestPredictions.push({
                    usn: p.usn,
                    risk_level: p.risk_level,
                    risk_score: p.risk_score?.toNumber() || 0,
                    explanation_text: p.explanation_text,
                    predicted_at: p.predicted_at,
                    factors: p.explanations.map(e => ({
                        feature: e.feature_name,
                        value: e.feature_value?.toNumber() || 0,
                        impact: e.impact_description,
                        shap: e.shap_value?.toNumber() || 0
                    }))
                });
            }
        }

        res.json(latestPredictions);
    } catch (error) {
        console.error('Fetch Predictions Error:', error);
        res.status(500).json({ error: 'Failed to fetch predictions' });
    }
};

export const getStudentRisk: RequestHandler = async (req, res, next) => {
    const usn = req.user?.roleId;

    if (!usn) {
        res.status(400).json({ error: 'USN not found in token' });
        return;
    }

    try {
        // Fetch distinct latest predictions per course code
        const allPredictions = await prisma.prediction.findMany({
            where: { usn },
            orderBy: { predicted_at: 'desc' }
        });

        const seenCourses = new Set();
        const latestPredictions = [];
        
        for (const p of allPredictions) {
            const code = p.course_code || 'general';
            if (!seenCourses.has(code)) {
                seenCourses.add(code);
                latestPredictions.push({
                    course_code: p.course_code,
                    risk_level: p.risk_level,
                    explanation_text: p.explanation_text,
                    predicted_at: p.predicted_at
                });
            }
        }

        res.json(latestPredictions);
    } catch (error) {
        console.error('Fetch Student Risk Error:', error);
        res.status(500).json({ error: 'Failed to fetch student risk' });
    }
};