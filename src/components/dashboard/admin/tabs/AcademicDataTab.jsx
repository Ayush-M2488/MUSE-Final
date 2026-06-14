import React from 'react';
import { CH, Loader } from '../../shared/Primitives';
import { Edit2, X } from 'lucide-react';
import { LT } from '../../shared/theme';

const Card = ({ children, style }) => (
    <div className="card-lt" style={style}>
        {children}
    </div>
);

export default function AcademicDataTab({ 
    t, cfg, setPage, users, 
    hodModal, setHodModal, handleAssignHod, timetables 
}) {
        const deptsMap = {};
        users.forEach(u => {
            if (u.role === 'teacher' || u.role === 'student') {
                if (!deptsMap[u.dept]) deptsMap[u.dept] = { id: u.dept, name: u.dept, facultyCount: 0, hod: 'Not Assigned', hod_emp_id: null, teachers: [] };
                if (u.role === 'teacher') {
                    deptsMap[u.dept].facultyCount++;
                    deptsMap[u.dept].teachers.push(u);
                    if (u.is_hod) {
                        deptsMap[u.dept].hod = u.name;
                        deptsMap[u.dept].hod_emp_id = u.emp_id;
                    }
                }
            }
        });
        const departments = Object.values(deptsMap).filter(d => d.id && d.id !== 'N/A');

        const holidays = [
            { date: 'Aug 15, 2024', name: 'Independence Day', type: 'National' },
            { date: 'Sep 07, 2024', name: 'Ganesh Chaturthi', type: 'Festival' },
            { date: 'Oct 02, 2024', name: 'Gandhi Jayanti', type: 'National' },
            { date: 'Oct 31, 2024', name: 'Diwali Break', type: 'Festival' },
            { date: 'Dec 25, 2024', name: 'Christmas', type: 'Festival' }
        ];

        const classrooms = [
            { room: '101', type: 'Lecture Hall', capacity: 60, status: 'Operational', issue: 'None' },
            { room: '102', type: 'Lecture Hall', capacity: 60, status: 'Operational', issue: 'None' },
            { room: '201', type: 'Computer Lab', capacity: 40, status: 'Maintenance', issue: 'Network upgrade' },
            { room: '205', type: 'Seminar Hall', capacity: 120, status: 'Operational', issue: 'None' }
        ];

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <Card>
                        <CH title="Academic Calendar" sub="Semester dates and holidays" />
                        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '.5rem', borderBottom: `1px solid ${t.sep}` }}>
                                <span style={{ color: t.muted, fontSize: '.8rem' }}>Current Academic Year</span>
                                <span style={{ fontWeight: 600 }}>{cfg?.ay || '2024-25'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '.5rem', borderBottom: `1px solid ${t.sep}` }}>
                                <span style={{ color: t.muted, fontSize: '.8rem' }}>Semester Start Date</span>
                                <span style={{ fontWeight: 600 }}>{cfg?.semStart || 'Aug 01, 2024'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '.5rem', borderBottom: `1px solid ${t.sep}` }}>
                                <span style={{ color: t.muted, fontSize: '.8rem' }}>Semester End Date</span>
                                <span style={{ fontWeight: 600 }}>{cfg?.semEnd || 'Dec 15, 2024'}</span>
                            </div>
                            <button className="btn btn-np" style={{ marginTop: '.5rem', alignSelf: 'flex-start' }} onClick={() => setPage('config')}><Edit2 size={12} /> Edit Calendar Config</button>
                        </div>
                    </Card>

                    <Card>
                        <CH title="Enrollment Windows" sub="Course registration access" />
                        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '.5rem', borderBottom: `1px solid ${t.sep}` }}>
                                <span style={{ color: t.muted, fontSize: '.8rem' }}>Core Subject Reg.</span>
                                <span className="b bM" style={{ background: '#FCE7F3', color: '#BE185D', borderColor: '#FBCFE8' }}>Closed</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '.5rem', borderBottom: `1px solid ${t.sep}` }}>
                                <span style={{ color: t.muted, fontSize: '.8rem' }}>Open Electives</span>
                                <span className="b bM" style={{ background: '#DCFCE7', color: '#166534', borderColor: '#BBF7D0' }}>Active (Closes Oct 10)</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '.5rem', borderBottom: `1px solid ${t.sep}` }}>
                                <span style={{ color: t.muted, fontSize: '.8rem' }}>Late Reg. Window</span>
                                <span className="b bM" style={{ background: '#FEF9C3', color: '#854D0E', borderColor: '#FEF08A' }}>Pending</span>
                            </div>
                        </div>
                    </Card>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <Card>
                        <CH title="Department & HOD Directory" sub="Institutional leadership" />
                        <div style={{ overflowX: 'auto' }}>
                            <table className="tbl tbl-lt" style={{ minWidth: 400 }}>
                                <thead>
                                    <tr><th>Department</th><th>HOD</th><th>Status</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    {departments.length === 0 ? (
                                        <tr><td colSpan="4" style={{ textAlign: 'center', color: t.muted }}>No departments found.</td></tr>
                                    ) : (
                                        departments.map(d => (
                                            <tr key={d.id}>
                                                <td style={{ fontWeight: 500 }}>{d.name}</td>
                                                <td>
                                                    {d.hod === 'Not Assigned' ? 
                                                        <span style={{ color: t.muted, fontStyle: 'italic' }}>Not Assigned</span> : 
                                                        <span style={{ fontWeight: 600 }}>{d.hod}</span>
                                                    }
                                                </td>
                                                <td><span className="b bM" style={{ background: '#DCFCE7', color: '#166534' }}>Active</span></td>
                                                <td>
                                                    <button className="btn btn-np" style={{ fontSize: '.75rem', padding: '4px 8px' }} onClick={() => setHodModal({ dept: d.id, teachers: d.teachers })}>Assign HOD</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {hodModal && (
                            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.82)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={(e) => e.target === e.currentTarget && setHodModal(null)}>
                                <div className="modal-lt" style={{ background: '#fff', border: '1px solid #E4E7EC', borderRadius: 14, width: '100%', maxWidth: 400 }}>
                                    <div style={{ padding: '1.1rem 1.25rem', borderBottom: '1px solid #E4E7EC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontWeight: 600, color: t.text }}>Assign HOD for {hodModal.dept}</div>
                                        <button onClick={() => setHodModal(null)}><X size={17} /></button>
                                    </div>
                                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                                        {hodModal.teachers.length === 0 ? (
                                            <div style={{ color: t.muted, textAlign: 'center' }}>No faculty found in this department.</div>
                                        ) : (
                                            hodModal.teachers.map(tchr => (
                                                <div key={tchr.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', border: '1px solid #E4E7EC', borderRadius: 8 }}>
                                                    <div>
                                                        <div style={{ fontWeight: 600, fontSize: '.9rem' }}>{tchr.name}</div>
                                                        <div style={{ fontSize: '.75rem', color: t.muted }}>{tchr.email}</div>
                                                    </div>
                                                    {tchr.is_hod ? (
                                                        <span className="b" style={{ background: t.teal, color: '#fff' }}>Current HOD</span>
                                                    ) : (
                                                        <button className="btn" style={{ background: t.bgL, border: '1px solid #E4E7EC', color: t.text }} onClick={() => handleAssignHod(hodModal.dept, tchr.emp_id)}>Select</button>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>

                    <Card>
                        <CH title="Detailed Holiday List" sub="Institutional closures" />
                        <div style={{ overflowX: 'auto' }}>
                            <table className="tbl tbl-lt" style={{ minWidth: 400 }}>
                                <thead>
                                    <tr><th>Date</th><th>Occasion</th><th>Type</th></tr>
                                </thead>
                                <tbody>
                                    {holidays.map((h, i) => (
                                        <tr key={i}>
                                            <td style={{ fontWeight: 500 }}>{h.date}</td>
                                            <td>{h.name}</td>
                                            <td><span className="b bM">{h.type}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <Card>
                        <CH title="Classroom & Resource Allocation" sub="Physical infrastructure tracking" />
                        <div style={{ overflowX: 'auto' }}>
                            <table className="tbl tbl-lt" style={{ minWidth: 400 }}>
                                <thead>
                                    <tr><th>Room No.</th><th>Type</th><th>Capacity</th><th>Status</th></tr>
                                </thead>
                                <tbody>
                                    {classrooms.map((c, i) => (
                                        <tr key={i}>
                                            <td style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{c.room}</td>
                                            <td style={{ fontWeight: 500 }}>{c.type}</td>
                                            <td>{c.capacity}</td>
                                            <td>
                                                {c.status === 'Operational' ? 
                                                    <span className="b bM" style={{ background: '#DCFCE7', color: '#166534' }}>{c.status}</span> :
                                                    <span className="b bM" style={{ background: '#FEE2E2', color: '#991B1B' }}>{c.status} ({c.issue})</span>
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <Card>
                        <CH title="Master Timetable" sub="All registered course schedules" />
                        <div style={{ overflowX: 'auto' }}>
                            <table className="tbl tbl-lt" style={{ minWidth: 400 }}>
                                <thead>
                                    <tr><th>Course Code</th><th>Faculty ID</th><th>Day</th><th>Time</th><th>Room</th></tr>
                                </thead>
                                <tbody>
                                    {timetables.length === 0 ? (
                                        <tr><td colSpan="5" style={{ textAlign: 'center', color: t.muted }}>No timetables found.</td></tr>
                                    ) : (
                                        timetables.map(tt => (
                                            <tr key={tt.id}>
                                                <td style={{ fontWeight: 600, color: t.teal, fontFamily: 'JetBrains Mono, monospace' }}>{tt.course_code}</td>
                                                <td style={{ fontWeight: 500 }}>{tt.faculty_emp_id}</td>
                                                <td>{tt.day_of_week}</td>
                                                <td>{tt.start_time} - {tt.end_time}</td>
                                                <td><span className="b bM">{tt.room}</span></td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        );
    
}
