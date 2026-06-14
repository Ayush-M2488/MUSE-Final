import React from 'react';
import { CH, Loader } from '../../shared/Primitives';
import { AlertTriangle, Search, Activity, X } from 'lucide-react';
import { LT } from '../../shared/theme';

const Card = ({ children, style }) => (
    <div className="card-lt" style={style}>
        {children}
    </div>
);

export default function RiskTab({ 
    t, setPage, riskLoading, riskRoster, handleUpdateInterventionStatus
}) {
    const [selectedStudentRisk, setSelectedStudentRisk] = React.useState(null);
    const [riskSearchQuery, setRiskSearchQuery] = React.useState('');
    const [riskLevelFilter, setRiskLevelFilter] = React.useState('All');
    const [riskSemesterFilter, setRiskSemesterFilter] = React.useState('All');
    const [riskDetailModalOpen, setRiskDetailModalOpen] = React.useState(false);
    const [riskSortKey, setRiskSortKey] = React.useState('score');
    const [riskSortOrder, setRiskSortOrder] = React.useState('desc');
    const [riskDeptFilter, setRiskDeptFilter] = React.useState('All');
    const [healthModalStudent, setHealthModalStudent] = React.useState(null);

    const handleSort = (key) => {
        if (riskSortKey === key) {
            setRiskSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setRiskSortKey(key);
            setRiskSortOrder('asc');
        }
    };

        const filteredRoster = riskRoster.filter(s => {
            const matchesSearch = s.name.toLowerCase().includes(riskSearchQuery.toLowerCase()) || 
                                  s.usn.toLowerCase().includes(riskSearchQuery.toLowerCase());
            const matchesLevel = riskLevelFilter === 'All' || s.risk_level === riskLevelFilter;
            const matchesSem = riskSemesterFilter === 'All' || String(s.semester) === riskSemesterFilter;
            const matchesDept = riskDeptFilter === 'All' || s.department === riskDeptFilter;
            return matchesSearch && matchesLevel && matchesSem && matchesDept;
        });

        const sortedRoster = [...filteredRoster].sort((a, b) => {
            let valA, valB;
            if (riskSortKey === 'name') {
                valA = a.name.toLowerCase();
                valB = b.name.toLowerCase();
            } else if (riskSortKey === 'dept') {
                valA = a.department.toLowerCase();
                valB = b.department.toLowerCase();
            } else if (riskSortKey === 'score') {
                valA = a.risk_score;
                valB = b.risk_score;
            } else if (riskSortKey === 'health') {
                valA = a.health_score || 0;
                valB = b.health_score || 0;
            } else if (riskSortKey === 'level') {
                const levels = { 'Low': 1, 'Medium': 2, 'High': 3 };
                valA = levels[a.risk_level] || 0;
                valB = levels[b.risk_level] || 0;
            } else {
                return 0;
            }

            if (valA < valB) return riskSortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return riskSortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Risk detail / explanation modal */}
                {riskDetailModalOpen && selectedStudentRisk && (
                    <div
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.82)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
                        onClick={(e) => e.target === e.currentTarget && setRiskDetailModalOpen(false)}
                    >
                        <div className="modal-lt" style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, width: '100%', maxWidth: 650 }}>
                            <div style={{ padding: '1.1rem 1.25rem', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 600, color: t.text }}>Student Risk Insights & Explanations</div>
                                    <div style={{ fontSize: '.75rem', color: t.muted }}>{selectedStudentRisk.name} ({selectedStudentRisk.usn}) · Sem {selectedStudentRisk.semester} · {selectedStudentRisk.department}</div>
                                </div>
                                <button onClick={() => setRiskDetailModalOpen(false)} style={{ background: 'none', border: 'none', color: t.muted, cursor: 'pointer' }}><X size={17} /></button>
                            </div>

                            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '550px', overflowY: 'auto' }}>
                                {/* AI Risk Standing Card */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: t.cardAlt, borderRadius: '10px', border: `1px solid ${t.border}` }}>
                                    <div>
                                        <div style={{ fontSize: '.78rem', color: t.muted, fontWeight: 500, marginBottom: '4px' }}>AI CLASSIFICATION</div>
                                        <span className={`b ${selectedStudentRisk.risk_level === 'High' ? 'lH' : selectedStudentRisk.risk_level === 'Medium' ? 'lM' : 'lL'}`} style={{ fontSize: '1rem' }}>
                                            {selectedStudentRisk.risk_level} Risk
                                        </span>
                                    </div>
                                </div>

                                {/* Explanation text */}
                                <div>
                                    <h4 style={{ fontSize: '.85rem', fontWeight: 600, color: t.text, marginBottom: '.35rem' }}>AI Synthesis</h4>
                                    <p style={{ fontSize: '.8rem', color: t.sub, lineHeight: '1.45', background: t.cardAlt, padding: '.75rem', borderRadius: 8, border: `1px solid ${t.border}`, margin: 0 }}>
                                        {selectedStudentRisk.explanation_text}
                                    </p>
                                </div>

                                {/* Factors/SHAP Explanations */}
                                <div>
                                    <h4 style={{ fontSize: '.85rem', fontWeight: 600, color: t.text, marginBottom: '.75rem' }}>Risk Contributing Factors (SHAP Explanations)</h4>
                                    {selectedStudentRisk.factors && selectedStudentRisk.factors.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
                                            {selectedStudentRisk.factors.map((f, idx) => {
                                                const isNegative = f.shap > 0;
                                                const progressPercent = Math.min(100, Math.abs(f.shap) * 100);
                                                return (
                                                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.75rem' }}>
                                                            <span style={{ fontWeight: 600, color: t.text }}>{f.feature} (Value: {f.value})</span>
                                                            <span style={{ color: isNegative ? t.rHigh : t.teal, fontWeight: 600 }}>
                                                                {isNegative ? '+' : '-'}{(Math.abs(f.shap) * 100).toFixed(1)}% risk impact
                                                            </span>
                                                        </div>
                                                        <div style={{ position: 'relative', height: 8, background: t.sep, borderRadius: 4, overflow: 'hidden' }}>
                                                            <div 
                                                                style={{ 
                                                                    position: 'absolute', 
                                                                    height: '100%', 
                                                                    width: `${progressPercent}%`, 
                                                                    background: isNegative ? t.rHigh : t.teal,
                                                                    borderRadius: 4 
                                                                }} 
                                                            />
                                                        </div>
                                                        <div style={{ fontSize: '.7rem', color: t.muted }}>{f.impact}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: '.8rem', color: t.muted, fontStyle: 'italic' }}>No feature analysis available.</div>
                                    )}
                                </div>

                                {/* Active Interventions list */}
                                <div>
                                    <h4 style={{ fontSize: '.85rem', fontWeight: 600, color: t.text, marginBottom: '.75rem' }}>Faculty Interventions ({selectedStudentRisk.interventions.length})</h4>
                                    {selectedStudentRisk.interventions && selectedStudentRisk.interventions.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                                            {selectedStudentRisk.interventions.map((i) => (
                                                <div key={i.id} style={{ display: 'flex', flexDirection: 'column', gap: '.35rem', padding: '.75rem', background: t.cardAlt, borderRadius: 8, border: `1px solid ${t.border}` }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontWeight: 600, fontSize: '.78rem', color: t.text }}>{i.action_taken}</span>
                                                        <select
                                                            value={i.status}
                                                            onChange={(e) => handleUpdateInterventionStatus(i.id, e.target.value)}
                                                            style={{
                                                                padding: '4px 8px',
                                                                fontSize: '0.7rem',
                                                                fontWeight: 600,
                                                                borderRadius: '6px',
                                                                border: `1px solid ${t.border}`,
                                                                background: i.status === 'resolved' ? '#E6F4EA' : i.status === 'in_progress' ? '#FEF7E0' : '#F1F3F4',
                                                                color: i.status === 'resolved' ? '#137333' : i.status === 'in_progress' ? '#B06000' : '#3C4043',
                                                                cursor: 'pointer',
                                                                outline: 'none'
                                                            }}
                                                        >
                                                            <option value="open">Open</option>
                                                            <option value="in_progress">In Progress</option>
                                                            <option value="resolved">Resolved</option>
                                                        </select>
                                                    </div>
                                                    {i.notes && <div style={{ fontSize: '.75rem', color: t.sub }}>{i.notes}</div>}
                                                    <div style={{ fontSize: '.68rem', color: t.muted, marginTop: 2 }}>
                                                        Logged by {i.faculty_name} on {new Date(i.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: '.8rem', color: t.muted, fontStyle: 'italic' }}>No interventions logged yet for this student.</div>
                                    )}
                                </div>
                            </div>

                            <div style={{ padding: '1rem 1.25rem', borderTop: `1px solid ${t.border}`, display: 'flex', justifyContent: 'flex-end', background: t.cardAlt, borderBottomLeftRadius: 14, borderBottomRightRadius: 14 }}>
                                <button className="btn btn-np" onClick={() => setRiskDetailModalOpen(false)}>Done</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Risk Distribution Summary Card */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                    <Card style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem', marginBottom: '.5rem' }}>
                            <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '.45rem', borderRadius: 8, display: 'flex' }}>
                                <AlertTriangle size={15} />
                            </div>
                            <span style={{ fontSize: '.78rem', color: t.muted, fontWeight: 500 }}>Flagged High Risk</span>
                        </div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: t.rHigh }}>
                            {riskRoster.filter(s => s.risk_level === 'High').length} students
                        </div>
                    </Card>

                    <Card style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem', marginBottom: '.5rem' }}>
                            <div style={{ background: '#FEF3C7', color: '#B45309', padding: '.45rem', borderRadius: 8, display: 'flex' }}>
                                <AlertTriangle size={15} />
                            </div>
                            <span style={{ fontSize: '.78rem', color: t.muted, fontWeight: 500 }}>Flagged Medium Risk</span>
                        </div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: t.gold }}>
                            {riskRoster.filter(s => s.risk_level === 'Medium').length} students
                        </div>
                    </Card>

                    <Card style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem', marginBottom: '.5rem' }}>
                            <div style={{ background: '#E0F2FE', color: '#0369A1', padding: '.45rem', borderRadius: 8, display: 'flex' }}>
                                <Activity size={15} />
                            </div>
                            <span style={{ fontSize: '.78rem', color: t.muted, fontWeight: 500 }}>Active Interventions</span>
                        </div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: t.teal }}>
                            {riskRoster.reduce((acc, s) => acc + s.interventions.filter(i => i.status !== 'resolved').length, 0)} open
                        </div>
                    </Card>
                </div>

                <Card>
                    <CH 
                        title="Early Warning & Risk Roster" 
                        sub="Real-time predictive academic risk levels generated by the AI Engine" 
                        right={
                            <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
                                <div style={{ display: 'flex', border: `1px solid ${t.border}`, borderRadius: 8, overflow: 'hidden', background: t.card }}>
                                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 .5rem', color: t.muted }}>
                                        <Search size={13} />
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="Search name or USN..." 
                                        value={riskSearchQuery}
                                        onChange={e => setRiskSearchQuery(e.target.value)}
                                        style={{ border: 'none', outline: 'none', padding: '6px 8px 6px 0', fontSize: '.78rem', width: 160, background: 'transparent', color: t.text }}
                                    />
                                </div>

                                <select 
                                    value={riskLevelFilter}
                                    onChange={e => setRiskLevelFilter(e.target.value)}
                                    style={{ border: `1px solid ${t.border}`, borderRadius: 8, padding: '5px 8px', fontSize: '.78rem', background: t.card, color: t.text, outline: 'none' }}
                                >
                                    <option value="All">All Risk Levels</option>
                                    <option value="High">High Risk</option>
                                    <option value="Medium">Medium Risk</option>
                                    <option value="Low">Low Risk</option>
                                </select>

                                <select 
                                    value={riskSemesterFilter}
                                    onChange={e => setRiskSemesterFilter(e.target.value)}
                                    style={{ border: `1px solid ${t.border}`, borderRadius: 8, padding: '5px 8px', fontSize: '.78rem', background: t.card, color: t.text, outline: 'none' }}
                                >
                                    <option value="All">All Semesters</option>
                                    <option value="1">Semester 1</option>
                                    <option value="2">Semester 2</option>
                                    <option value="3">Semester 3</option>
                                    <option value="4">Semester 4</option>
                                    <option value="5">Semester 5</option>
                                    <option value="6">Semester 6</option>
                                    <option value="7">Semester 7</option>
                                    <option value="8">Semester 8</option>
                                </select>

                                <select 
                                    value={riskDeptFilter}
                                    onChange={e => setRiskDeptFilter(e.target.value)}
                                    style={{ border: `1px solid ${t.border}`, borderRadius: 8, padding: '5px 8px', fontSize: '.78rem', background: t.card, color: t.text, outline: 'none' }}
                                >
                                    <option value="All">All Departments</option>
                                    {[...new Set(riskRoster.map(s => s.department).filter(Boolean))].map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>

                            </div>
                        }
                    />

                    <div style={{ overflowX: 'auto' }}>
                        <table className="tbl tbl-lt" style={{ minWidth: 700 }}>
                            <thead>
                                <tr>
                                    <th>USN</th>
                                    <th onClick={() => handleSort('name')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                        Student Name {riskSortKey === 'name' ? (riskSortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                                    </th>
                                    <th onClick={() => handleSort('dept')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                        Semester & Dept {riskSortKey === 'dept' ? (riskSortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                                    </th>
                                    <th onClick={() => handleSort('level')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                        Risk Level {riskSortKey === 'level' ? (riskSortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                                    </th>
                                    <th onClick={() => handleSort('health')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                        Health Score {riskSortKey === 'health' ? (riskSortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                                    </th>

                                    <th>Interventions</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {riskLoading ? (
                                    <tr><td colSpan="7" style={{ textAlign: 'center', color: t.muted }}>Loading predictive risk roster...</td></tr>
                                ) : filteredRoster.length === 0 ? (
                                    <tr><td colSpan="7" style={{ textAlign: 'center', color: t.muted }}>No flagged students match the criteria.</td></tr>
                                ) : (
                                    sortedRoster.map(s => {
                                        const openInter = s.interventions.filter(i => i.status !== 'resolved').length;
                                        return (
                                            <tr key={s.usn}>
                                                <td style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{s.usn}</td>
                                                <td style={{ fontWeight: 500 }}>{s.name}</td>
                                                <td style={{ fontSize: '.75rem', color: t.muted }}>Sem {s.semester} · {s.department}</td>
                                                <td>
                                                    <span className={`b ${s.risk_level === 'High' ? 'lH' : s.risk_level === 'Medium' ? 'lM' : 'lL'}`}>
                                                        {s.risk_level}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span 
                                                        style={{ fontWeight: 500, fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer', transition: 'all 0.2s', color: s.health_score >= 75 ? t.teal : s.health_score >= 50 ? t.gold : t.rHigh }}
                                                        onClick={() => setHealthModalStudent(s)}
                                                        title="Click to see breakdown"
                                                    >
                                                        {s.health_score || 0}/100
                                                    </span>
                                                </td>

                                                <td>
                                                    {openInter > 0 ? (
                                                        <span className="b lM">
                                                            {openInter} Active Action{openInter > 1 ? 's' : ''}
                                                        </span>
                                                    ) : s.interventions.length > 0 ? (
                                                        <span className="b lL">
                                                            Resolved
                                                        </span>
                                                    ) : (
                                                        <span className="b lIn">
                                                            None Logged
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <button 
                                                        className="btn btn-ng" 
                                                        style={{ fontSize: '.72rem', padding: '4px 8px' }}
                                                        onClick={() => {
                                                            setSelectedStudentRisk(s);
                                                            setRiskDetailModalOpen(true);
                                                        }}
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {healthModalStudent && (
                    <div
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.82)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
                        onClick={(e) => e.target === e.currentTarget && setHealthModalStudent(null)}
                    >
                        <div className="modal-lt" style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, width: '100%', maxWidth: 500 }}>
                            <div style={{ padding: '1.1rem 1.25rem', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 600, color: t.text }}>Academic Health Score</div>
                                    <div style={{ fontSize: '.75rem', color: t.muted }}>{healthModalStudent.name} ({healthModalStudent.usn})</div>
                                </div>
                                <button onClick={() => setHealthModalStudent(null)} style={{ background: 'none', border: 'none', color: t.muted, cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
                            </div>

                            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: t.cardAlt, borderRadius: '10px', border: `1px solid ${t.border}` }}>
                                    <div>
                                        <div style={{ fontSize: '.78rem', color: t.muted, fontWeight: 500 }}>COMPOSITE SCORE</div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: healthModalStudent.health_score >= 75 ? t.teal : healthModalStudent.health_score >= 50 ? t.gold : t.rHigh }}>
                                            {healthModalStudent.health_score}/100
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '.78rem', color: t.muted, fontWeight: 500, marginBottom: '4px' }}>STATUS</div>
                                        <span className={`b ${healthModalStudent.health_score >= 75 ? 'lL' : healthModalStudent.health_score >= 50 ? 'lM' : 'lH'}`}>
                                            {healthModalStudent.health_score >= 75 ? 'Healthy' : healthModalStudent.health_score >= 50 ? 'At Risk' : 'Critical'}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ fontSize: '.85rem', fontWeight: 600, color: t.text, marginBottom: '.35rem' }}>How is this calculated?</h4>
                                    <p style={{ fontSize: '.8rem', color: t.sub, lineHeight: '1.45', background: t.cardAlt, padding: '.75rem', borderRadius: 8, border: `1px solid ${t.border}`, margin: 0 }}>
                                        The Academic Health Score is a unified metric (0-100) combining three key pillars: 
                                        <br/><br/>
                                        <b>1. Attendance (50% Weight)</b>: Weighted academic presence.<br/>
                                        <b>2. Academics (50% Weight)</b>: Based on internal assessment and practical marks.<br/>
                                        <b>3. AI Risk Multiplier</b>: If the AI Engine flags the student as Medium Risk, the raw score is penalized by 20% (x0.8). If High Risk, it is penalized by 40% (x0.6).
                                        <br/><br/>
                                        <i>Student AI Status: {healthModalStudent.risk_level} Risk</i>
                                    </p>
                                </div>
                            </div>

                            <div style={{ padding: '1rem 1.25rem', borderTop: `1px solid ${t.border}`, display: 'flex', justifyContent: 'flex-end', background: t.cardAlt, borderBottomLeftRadius: 14, borderBottomRightRadius: 14 }}>
                                <button className="btn btn-np" onClick={() => setHealthModalStudent(null)}>Close</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    
}
