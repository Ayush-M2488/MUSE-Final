import React from 'react';
import { DK as t } from '../../shared/theme';
import { CH } from '../../shared/Primitives';

export default function TimetableTab({ d, C }) {
    const subjects = d.subjects || [];
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = [
        { label: '10:00 - 11:00', type: 'class' },
        { label: '11:00 - 12:00', type: 'class' },
        { label: '12:00 - 13:00', type: 'class' },
        { label: '13:00 - 14:00', type: 'lunch' },
        { label: '14:00 - 15:00', type: 'class' }
    ];

    // Generate static deterministic timetable based on enrolled subjects
    const getSubjectForSlot = (dayIdx, slotIdx) => {
        if (subjects.length === 0) return null;
        // Simple math to rotate subjects so it looks like a real timetable
        const hash = (dayIdx * 7) + (slotIdx * 3);
        return subjects[hash % subjects.length];
    };

    return (
        <C>
            <CH title="Class Timetable" sub="Weekly Schedule (Default)" dk />
            
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
                                        // Only render the Lunch Break cell once on Monday with a rowSpan, or render it grayed out for each day
                                        return (
                                            <td key={tIdx} style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', color: t.muted, borderRight: `1px solid ${t.border}`, fontStyle: 'italic' }}>
                                                Lunch Break
                                            </td>
                                        );
                                    }

                                    const subject = getSubjectForSlot(dIdx, tIdx);
                                    return (
                                        <td key={tIdx} style={{ padding: '1rem', borderRight: `1px solid ${t.border}` }}>
                                            {subject ? (
                                                <div style={{ fontWeight: 500, color: t.primary }}>{subject.name} <br/> <span style={{fontSize: '0.75rem', color: t.muted}}>{subject.code}</span></div>
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

                {/* Subject & Teacher Mapping */}
                <CH title="Semester Subjects & Faculty" sub="Assigned Teachers" dk />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                    {subjects.length > 0 ? subjects.map((sub, idx) => (
                        <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: `1px solid ${t.border}` }}>
                            <div style={{ fontSize: '.85rem', color: t.muted, marginBottom: '0.25rem' }}>{sub.code}</div>
                            <div style={{ fontWeight: 600, color: t.text, marginBottom: '0.5rem' }}>{sub.name}</div>
                            <div style={{ fontSize: '.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: t.muted }}>Faculty:</span>
                                {sub.teacher && sub.teacher !== 'To Be Declared' && sub.teacher !== 'TBD' ? (
                                    <span style={{ color: t.green }}>{sub.teacher}</span>
                                ) : (
                                    <span style={{ color: t.rHigh }}>Not assigned</span>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div style={{ color: t.muted, fontSize: '.9rem' }}>No subjects enrolled for this semester.</div>
                    )}
                </div>
            </div>
        </C>
    );
}
