import { calculateAttendancePercentage, formatRiskLevel, calculateConsolidatedMarks } from '../backend/utils/academicMath';

describe('Academic Math Utilities', () => {
    describe('calculateAttendancePercentage', () => {
        it('should calculate 100% when total classes is 0', () => {
            expect(calculateAttendancePercentage(0, 0)).toBe(100);
        });

        it('should calculate exact percentage', () => {
            expect(calculateAttendancePercentage(75, 100)).toBe(75);
            expect(calculateAttendancePercentage(1, 3)).toBe(33.3);
        });

        it('should throw on negative inputs', () => {
            expect(() => calculateAttendancePercentage(-1, 10)).toThrow();
            expect(() => calculateAttendancePercentage(5, -10)).toThrow();
        });

        it('should throw if present > total', () => {
            expect(() => calculateAttendancePercentage(11, 10)).toThrow();
        });
    });

    describe('formatRiskLevel', () => {
        it('should map score to correct category', () => {
            expect(formatRiskLevel(0.8)).toBe('High');
            expect(formatRiskLevel(0.7)).toBe('High');
            expect(formatRiskLevel(0.5)).toBe('Medium');
            expect(formatRiskLevel(0.4)).toBe('Medium');
            expect(formatRiskLevel(0.2)).toBe('Low');
            expect(formatRiskLevel(0)).toBe('Low');
        });

        it('should throw on out of bounds score', () => {
            expect(() => formatRiskLevel(-0.1)).toThrow();
            expect(() => formatRiskLevel(1.1)).toThrow();
        });
    });

    describe('calculateConsolidatedMarks', () => {
        it('should calculate averages and totals correctly', () => {
            const result = calculateConsolidatedMarks(40, 45, 50, null, null);
            expect(result.iaAverage).toBe(45);
            expect(result.total).toBe(45);
        });

        it('should calculate with practical and final exams', () => {
            const result = calculateConsolidatedMarks(20, 20, null, 25, 40);
            expect(result.iaAverage).toBe(20);
            expect(result.total).toBe(85);
            expect(result.passed).toBe(true);
        });

        it('should fail if total is below 40', () => {
            const result = calculateConsolidatedMarks(10, 10, null, 10, 5);
            expect(result.iaAverage).toBe(10);
            expect(result.total).toBe(25);
            expect(result.passed).toBe(false);
        });
    });
});
