import { describe, expect, it } from '@jest/globals';
import { calculateAttendancePercentage, formatRiskLevel, calculateConsolidatedMarks } from '../backend/utils/academicMath';

describe('Attendance Logic (attendance.test.ts)', () => {
    describe('calculateAttendancePercentage', () => {
        it('should return 100% when total classes is zero', () => {
            const percentage = calculateAttendancePercentage(0, 0);
            expect(percentage).toBe(100);
        });

        it('should calculate the correct percentage', () => {
            expect(calculateAttendancePercentage(15, 20)).toBe(75);
            expect(calculateAttendancePercentage(1, 3)).toBe(33.3);
            expect(calculateAttendancePercentage(20, 20)).toBe(100);
            expect(calculateAttendancePercentage(0, 20)).toBe(0);
        });

        it('should handle decimal percentages correctly', () => {
            // 7 / 9 = 77.777...
            expect(calculateAttendancePercentage(7, 9)).toBe(77.8);
        });

        it('should throw an error if present is greater than total', () => {
            expect(() => {
                calculateAttendancePercentage(21, 20);
            }).toThrow('Present count cannot exceed total classes');
        });

        it('should throw an error if values are negative', () => {
            expect(() => {
                calculateAttendancePercentage(-1, 10);
            }).toThrow('Counts cannot be negative');

            expect(() => {
                calculateAttendancePercentage(10, -1);
            }).toThrow('Counts cannot be negative');
        });
    });

    describe('formatRiskLevel', () => {
        it('should format risk scores correctly', () => {
            expect(formatRiskLevel(0.8)).toBe('High');
            expect(formatRiskLevel(0.7)).toBe('High');
            expect(formatRiskLevel(0.5)).toBe('Medium');
            expect(formatRiskLevel(0.4)).toBe('Medium');
            expect(formatRiskLevel(0.2)).toBe('Low');
            expect(formatRiskLevel(0)).toBe('Low');
        });

        it('should throw an error for invalid bounds', () => {
            expect(() => formatRiskLevel(-0.1)).toThrow('Risk score must be between 0 and 1');
            expect(() => formatRiskLevel(1.1)).toThrow('Risk score must be between 0 and 1');
        });
    });

    describe('calculateConsolidatedMarks', () => {
        it('should calculate averages and totals correctly', () => {
            // ia1=20, ia2=20, ia3=20 -> avg = 20
            // prac=20, final=60 -> total = 100, passed = true
            expect(calculateConsolidatedMarks(20, 20, 20, 20, 60)).toEqual({
                iaAverage: 20,
                total: 100,
                percentage: 66.7,
                passed: true
            });
        });

        it('should handle null values correctly', () => {
            // ia1=15, others null -> avg = 15
            expect(calculateConsolidatedMarks(15, null, null, null, null)).toEqual({
                iaAverage: 15,
                total: 15,
                percentage: 50.0,
                passed: false // < 40
            });
        });

        it('should handle decimal averages correctly', () => {
            // ia1=15, ia2=20 -> avg = 17.5
            expect(calculateConsolidatedMarks(15, 20, null, 0, 0)).toEqual({
                iaAverage: 17.5,
                total: 17.5,
                percentage: 11.7,
                passed: false
            });
        });
    });
});
