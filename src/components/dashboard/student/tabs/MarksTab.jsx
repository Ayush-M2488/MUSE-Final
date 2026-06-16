import React from 'react';
import {
    BarChart,
    Bar,
    ResponsiveContainer,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';
import { DK as t, DK } from '../../shared/theme';
import { CH, CT } from '../../shared/Primitives';

export default function MarksTab({ d, C }) {
    const subjectsList = d.subjects || [];
    const dynamicMarksData = [
        { test: 'IA-1' },
        { test: 'IA-2' },
        { test: 'IA-3' },
        { test: 'Total' }
    ];
    subjectsList.forEach(s => {
        const key = s.code || s.name;
        dynamicMarksData[0][key] = s.ia1 || 0;
        dynamicMarksData[1][key] = s.ia2 || 0;
        dynamicMarksData[2][key] = s.ia3 || 0;
        dynamicMarksData[3][key] = s.overall_total || 0;
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <C>
                <CH title="Marks Overview" sub="IA Scores (Max 30) & Overall (Max 100)" dk />
                <div style={{ padding: '.75rem .25rem .5rem' }}>
                    <ResponsiveContainer width="100%" height={235}>
                        <BarChart data={dynamicMarksData} barSize={16}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis
                                dataKey="test"
                                tick={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fill: t.muted }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: t.muted }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CT />} cursor={{ fill: 'rgba(255,255,255,0.1)' }} />
                            <Legend iconSize={8} wrapperStyle={{ fontSize: '.7rem', color: t.sub }} />
                            {subjectsList.map((s, i) => {
                                const key = s.code || s.name;
                                return (
                                    <Bar 
                                        key={key} 
                                        dataKey={key} 
                                        name={s.name || key} 
                                        fill={DK.chart[i % DK.chart.length]} 
                                        radius={[4, 4, 0, 0]} 
                                    />
                                );
                            })}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </C>

            <C>
                <CH title="Marks Breakdown" sub="IA, Practical & Final Exam (Total 100)" dk />
                <table className="tbl tbl-dk">
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>IA-1</th>
                            <th>IA-2</th>
                            <th>IA-3</th>
                            <th>Avg IA</th>
                            <th>Practical</th>
                            <th>Internal Total</th>
                            <th>Final Exam</th>
                            <th>Overall</th>
                        </tr>
                    </thead>
                    <tbody>
                        {d.subjects.map((s) => {
                            return (
                                <tr key={s.code}>
                                    <td>
                                        <div>{s.name}</div>
                                        <div style={{ fontSize: '.7rem', color: t.muted }}>{s.code}</div>
                                    </td>
                                    <td>{s.ia1 !== null ? `${s.ia1}/30` : '-'}</td>
                                    <td>{s.ia2 !== null ? `${s.ia2}/30` : '-'}</td>
                                    <td>{s.ia3 !== null ? `${s.ia3}/30` : '-'}</td>
                                    <td><span className="b bL">{s.ia_avg !== null ? `${s.ia_avg}/30` : '-'}</span></td>
                                    <td>{s.practical !== null ? `${s.practical}/20` : '-'}</td>
                                    <td><span className="b bM">{s.internal_total !== null ? `${s.internal_total}/50` : '-'}</span></td>
                                    <td>{s.finalExam !== null ? `${s.finalExam}/100` : '-'}</td>
                                    <td><span className="b bH">{s.overall_total !== null ? `${s.overall_total}/100` : '-'}</span></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </C>
        </div>
    );
}
