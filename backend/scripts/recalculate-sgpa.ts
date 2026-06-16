import { prisma } from '../config/db';
import { calculateSGPA } from '../utils/academicMath';

async function main() {
    console.log('Recalculating all SGPAs with strict logic...');
    
    const students = await prisma.student.findMany({
        include: {
            enrollments: { include: { course: true } },
            assessments: { include: { course: true } }
        }
    });

    let updatedCount = 0;

    for (const studentData of students) {
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

        const sgpa = calculateSGPA(Object.values(courseGroups));
        
        await prisma.student.update({
            where: { usn: studentData.usn },
            data: { cgpa: sgpa }
        });
        
        updatedCount++;
    }

    console.log(`Successfully recalculated SGPA for ${updatedCount} students.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
