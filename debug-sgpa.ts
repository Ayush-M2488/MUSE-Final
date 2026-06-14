import { prisma } from './backend/config/db.ts';
import { calculateSGPA } from './backend/utils/academicMath.ts';

async function debugPuneeth() {
    const studentData = await prisma.student.findFirst({
        where: { user: { full_name: { contains: 'Punith', mode: 'insensitive' } } },
        include: {
            enrollments: { include: { course: true } },
            assessments: { include: { course: true } }
        }
    });

    if (!studentData) {
        console.log("Puneeth not found");
        return;
    }

    console.log("Current DB cgpa:", studentData.cgpa?.toNumber());

    const courseGroups: { [code: string]: any } = {};
    for (const e of studentData.enrollments) {
        courseGroups[e.course_code] = {
            credits: e.course.credits || 4,
            marks: { ia1: null, ia2: null, ia3: null, practical: null, final: null }
        };
    }

    for (const a of studentData.assessments) {
        if (courseGroups[a.course_code]) {
            const type = a.assessment_type.toLowerCase().replace(/[-_\s]/g, '');
            if (type.includes('ia1')) courseGroups[a.course_code].marks.ia1 = Number(a.score);
            if (type.includes('ia2')) courseGroups[a.course_code].marks.ia2 = Number(a.score);
            if (type.includes('ia3')) courseGroups[a.course_code].marks.ia3 = Number(a.score);
            if (type.includes('practical')) courseGroups[a.course_code].marks.practical = Number(a.score);
            if (type.includes('final')) courseGroups[a.course_code].marks.final = Number(a.score);
        }
    }

    console.log(JSON.stringify(courseGroups, null, 2));

    const sgpa = calculateSGPA(Object.values(courseGroups));
    console.log("Calculated SGPA:", sgpa);
}

debugPuneeth()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
