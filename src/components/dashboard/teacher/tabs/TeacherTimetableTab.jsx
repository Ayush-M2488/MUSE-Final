import React, { useState } from 'react';
import { DK as t } from '../../shared/theme';
import { CH } from '../../shared/Primitives';

export default function TeacherTimetableTab({ courses = [] }) {
    // Extract unique semesters
    const semesters = [...new Set(courses.map(c => c.semester))].filter(Boolean).sort((a, b) => a - b);
    const [selectedSem, setSelectedSem] = useState('All');

    // Filter courses based on selected semester
    const filteredCourses = selectedSem === 'All' 
        ? courses 
        : courses.filter(c => c.semester === Number(selectedSem));

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = [
        { label: '10:00 - 11:00', type: 'class' },
        { label: '11:00 - 12:00', type: 'class' },
        { label: '12:00 - 13:00', type: 'class' },
        { label: '13:00 - 14:00', type: 'lunch' },
        { label: '14:00 - 15:00', type: 'class' }
    ];

    // Generate static deterministic timetable based on filtered courses
    const getCourseForSlot = (dayIdx, slotIdx) => {
        if (!filteredCourses || filteredCourses.length === 0) return null;
        // Simple math to rotate courses so it looks like a real timetable
        const hash = (dayIdx * 7) + (slotIdx * 3);
        return filteredCourses[hash % filteredCourses.length];
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <CH title="My Timetable" sub="Weekly Teaching Schedule" dk />
                
                {/* Semester Filter */}
                <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ color: t.muted, fontSize: '.85rem', fontWeight: 500 }}>Filter by Semester:</span>
                    <select 
                        className="inp-dk"
                        value={selectedSem} 
                        onChange={(e) => setSelectedSem(e.target.value)}
                        style={{ minWidth: '150px' }}
                    >
                        <option value="All">All Semesters</option>
                        {semesters.map(sem => (
                            <option key={sem} value={sem}>Semester {sem}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            <div style={{ padding: '0 1rem 1rem', overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: '600px', textAlign: 'center', borderCollapse: 'collapse', color: t.text, marginBottom: '2rem' }}>
                    <thead>
                        <tr style={{ borderBottom: `2px solid ${t.border}`, fontSize: '.75rem', textTransform: 'uppercase', color: t.muted, backgroundColor: 'rgba(0,0,0,0.2)' }}>
                            <th style={{ padding: '1rem', borderRight: `1px solid ${t.border}` }}>Day / Time</th>
                            {timeSlots.map((ts, i) => (
                                <th key={i} style={{ padding: '1rem', borderRight: i < timeSlots.length - 1 ? `1px solid ${t.border}` : 'none' }}>
                                    {ts.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {days.map((day, dIdx) => (
                            <tr key={day} style={{ borderBottom: `1px solid ${t.border}`, fontSize: '.85rem' }}>
                                <td style={{ padding: '1rem', fontWeight: 600, borderRight: `1px solid ${t.border}`, backgroundColor: 'rgba(0,0,0,0.1)' }}>
                                    {day}
                                </td>
                                {timeSlots.map((ts, tIdx) => {
                                    if (ts.type === 'lunch') {
                                        // Only render the Lunch Break cell
                                        return (
                                            <td key={tIdx} style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', color: t.muted, borderRight: `1px solid ${t.border}`, fontStyle: 'italic' }}>
                                                Lunch Break
                                            </td>
                                        );
                                    }

                                    const course = getCourseForSlot(dIdx, tIdx);
                                    return (
                                        <td key={tIdx} style={{ padding: '1rem', borderRight: `1px solid ${t.border}` }}>
                                            {course ? (
                                                <div style={{ fontWeight: 500, color: t.primary }}>{course.name} <br/> <span style={{fontSize: '0.75rem', color: t.muted}}>{course.code}</span></div>
                                            ) : (
                                                <div style={{ color: t.muted }}>-</div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Assigned Courses Mapping */}
                <CH title="Assigned Courses" sub={selectedSem === 'All' ? "All courses you are teaching" : `Courses you are teaching for Semester ${selectedSem}`} dk />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                    {filteredCourses && filteredCourses.length > 0 ? filteredCourses.map((course, idx) => (
                        <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: `1px solid ${t.border}` }}>
                            <div style={{ fontSize: '.85rem', color: t.muted, marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
                                <span>{course.code} - Section {course.section}</span>
                                <span>Sem {course.semester}</span>
                            </div>
                            <div style={{ fontWeight: 600, color: t.text, marginBottom: '0.5rem' }}>{course.name}</div>
                            <div style={{ fontSize: '.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: t.muted }}>Enrolled:</span>
                                <span style={{ color: t.teal }}>{course.student_count || 0} Students</span>
                            </div>
                        </div>
                    )) : (
                        <div style={{ color: t.muted, fontSize: '.9rem' }}>No courses found for the selected filter.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
