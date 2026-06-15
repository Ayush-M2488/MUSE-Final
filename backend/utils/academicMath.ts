export const calculateAttendancePercentage = (presentCount: number, totalClasses: number): number => {
    if (totalClasses === 0) return 100.0;
    if (presentCount < 0 || totalClasses < 0) throw new Error('Counts cannot be negative');
    if (presentCount > totalClasses) throw new Error('Present count cannot exceed total classes');
    
    return Number(((presentCount / totalClasses) * 100).toFixed(1));
};

export const formatRiskLevel = (riskScore: number): string => {
    if (riskScore < 0 || riskScore > 1) throw new Error('Risk score must be between 0 and 1');
    if (riskScore >= 0.7) return 'High';
    if (riskScore >= 0.4) return 'Medium';
    return 'Low';
};

export const calculateConsolidatedMarks = (
    ia1: number | null, 
    ia2: number | null, 
    ia3: number | null,
    practical: number | null,
    finalExam: number | null
) => {
    const ias = [ia1, ia2, ia3].filter(m => m !== null) as number[];
    let iaAverage = 0;
    
    if (ias.length > 0) {
        // Average of best 2, or whatever rule is in place. Assuming simple average for now:
        const sum = ias.reduce((a, b) => a + b, 0);
        iaAverage = sum / ias.length;
    }

    const total = iaAverage + (practical || 0) + (finalExam || 0);

    let maxTotal = 0;
    if (ias.length > 0) maxTotal += 30;
    if (practical !== null) maxTotal += 20;
    if (finalExam !== null) maxTotal += 100;
    if (maxTotal === 0) maxTotal = 1;

    const percentage = (total / maxTotal) * 100;

    return {
        iaAverage: Number(iaAverage.toFixed(1)),
        total: Number(total.toFixed(1)),
        percentage: Number(percentage.toFixed(1)),
        passed: total >= 40 // Assuming 40 is passing
    };
};

export const convertMarksToGradePoint = (totalMarks: number): number => {
    // Standard 10-point UGC grading scale
    if (totalMarks >= 90) return 10.0;
    if (totalMarks >= 80) return 9.0;
    if (totalMarks >= 70) return 8.0;
    if (totalMarks >= 60) return 7.0;
    if (totalMarks >= 55) return 6.0;
    if (totalMarks >= 50) return 5.5;
    if (totalMarks >= 40) return 5.0;
    return 0.0; // Fail
};

export const calculateSGPA = (
    courseData: { credits: number; marks: { ia1: number|null; ia2: number|null; ia3: number|null; practical: number|null; final: number|null } }[]
): number => {
    let totalCreditPoints = 0;
    let totalCredits = 0;

    for (const course of courseData) {
        // Strict SGPA Policy: Only calculate if ALL components are fully entered for the subject.
        if (
            course.marks.ia1 === null ||
            course.marks.ia2 === null ||
            course.marks.ia3 === null ||
            course.marks.practical === null ||
            course.marks.final === null
        ) {
            return 0.0;
        }

        const { percentage } = calculateConsolidatedMarks(
            course.marks.ia1,
            course.marks.ia2,
            course.marks.ia3,
            course.marks.practical,
            course.marks.final
        );

        const gradePoint = convertMarksToGradePoint(percentage);
        
        totalCreditPoints += (gradePoint * course.credits);
        totalCredits += course.credits;
    }

    if (totalCredits === 0) return 0.0;
    return Number((totalCreditPoints / totalCredits).toFixed(2));
};
