import React from 'react';
import { CH, Loader } from '../../shared/Primitives';
import { Plus, X, Edit2, Trash2, Search, Users } from 'lucide-react';
import { LT } from '../../shared/theme';
import { adminService } from '../../../../services/api';

const Card = ({ children, style }) => (
    <div className="card-lt" style={style}>
        {children}
    </div>
);

export default function CoursesTab({ t, setPage, allCourses, setAllCourses, users }) {
    const [courseFilters, setCourseFilters] = React.useState({ dept: 'All', sem: 'All', search: '' });

    const uniqueDepts = ['All', ...new Set(allCourses.map(c => c.department).filter(Boolean))];
        const uniqueSems = ['All', ...new Set(allCourses.map(c => c.semester).filter(Boolean))].sort((a,b) => a === 'All' ? -1 : a - b);
        
        const filteredCourses = allCourses.filter(c => {
            if (courseFilters.dept !== 'All' && c.department !== courseFilters.dept) return false;
            if (courseFilters.sem !== 'All' && c.semester.toString() !== courseFilters.sem.toString()) return false;
            if (courseFilters.search && !c.course_name.toLowerCase().includes(courseFilters.search.toLowerCase()) && !c.course_code.toLowerCase().includes(courseFilters.search.toLowerCase())) return false;
            return true;
        });

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <Card>
                    <CH 
                        title="Course Directory & Faculty Assignments" 
                        sub="Manage curriculum and sections" 
                        right={<button className="btn btn-np"><Plus size={13} /> Add Course</button>} 
                    />
                    
                    <div style={{ padding: '1rem', borderBottom: `1px solid ${t.sep}`, display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', background: '#FAFAFA' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
                            <div className="mlbl" style={{ color: t.muted }}>Department</div>
                            <select className="inp-lt" style={{ minWidth: 150 }} value={courseFilters.dept} onChange={e => setCourseFilters({ ...courseFilters, dept: e.target.value })}>
                                {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
                            <div className="mlbl" style={{ color: t.muted }}>Semester</div>
                            <select className="inp-lt" style={{ minWidth: 120 }} value={courseFilters.sem} onChange={e => setCourseFilters({ ...courseFilters, sem: e.target.value })}>
                                {uniqueSems.map(s => <option key={s} value={s}>{s === 'All' ? 'All' : `Semester ${s}`}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '.25rem', flex: 1, minWidth: 200 }}>
                            <div className="mlbl" style={{ color: t.muted }}>Search Subject</div>
                            <div style={{ position: 'relative' }}>
                                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: t.muted }} />
                                <input 
                                    className="inp-lt" 
                                    style={{ width: '100%', paddingLeft: 30 }} 
                                    placeholder="Search by code or name..." 
                                    value={courseFilters.search} 
                                    onChange={e => setCourseFilters({ ...courseFilters, search: e.target.value })} 
                                />
                            </div>
                        </div>
                        {Object.values(courseFilters).some(v => v !== 'All' && v !== '') && (
                            <button className="btn btn-ng" style={{ padding: '.4rem .6rem', fontSize: '.7rem', alignSelf: 'flex-end', height: 35 }} onClick={() => setCourseFilters({ dept: 'All', sem: 'All', search: '' })}>Clear</button>
                        )}
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table className="tbl tbl-lt" style={{ minWidth: 700 }}>
                            <thead>
                                <tr>
                                    <th>Course Code</th>
                                    <th>Course Name</th>
                                    <th>Dept / Sem</th>
                                    <th>Credits</th>
                                    <th>Total Enrolled</th>
                                    <th>Assigned Faculty</th>
                                    <th>Assign Teacher</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCourses.length === 0 ? (
                                    <tr><td colSpan="7" style={{ textAlign: 'center', color: t.muted }}>No courses match the filters.</td></tr>
                                ) : (
                                    filteredCourses.map(c => {
                                        const totalEnrolled = c.enrollments?.length || 0;
                                        const facultyAssigned = [...new Set((c.enrollments || []).map(e => e.faculty_emp_id).filter(Boolean))];
                                        
                                        return (
                                            <tr key={c.course_code}>
                                                <td style={{ fontWeight: 700, color: t.teal, fontFamily: 'JetBrains Mono, monospace', fontSize: '.8rem' }}>{c.course_code}</td>
                                                <td style={{ fontWeight: 600 }}>{c.course_name}</td>
                                                <td>
                                                    <div style={{ fontWeight: 500 }}>{c.department}</div>
                                                    <div style={{ fontSize: '.75rem', color: t.muted }}>Semester {c.semester}</div>
                                                </td>
                                                <td>{c.credits}</td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                                                        <Users size={12} style={{ color: t.muted }} />
                                                        <span style={{ fontWeight: totalEnrolled > 0 ? 600 : 400, color: totalEnrolled > 0 ? t.text : t.muted }}>{totalEnrolled}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    {facultyAssigned.length === 0 ? (
                                                        <span style={{ fontSize: '.75rem', color: t.rHigh, fontWeight: 500 }}>Unassigned</span>
                                                    ) : (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
                                                            {facultyAssigned.map(empId => {
                                                                const matchingUser = users.find(u => u.emp_id === empId);
                                                                return (
                                                                    <div key={empId} style={{ fontSize: '.75rem', background: '#FAF5FF', color: '#6B21A8', padding: '.2rem .5rem', borderRadius: 4, width: 'fit-content', border: '1px solid #E9D5FF', fontWeight: 600 }}>
                                                                        {matchingUser ? matchingUser.name : empId}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    <select 
                                                        className="inp-lt" 
                                                        style={{ width: 140, padding: '.3rem .5rem', fontSize: '.75rem', cursor: 'pointer' }}
                                                        value=""
                                                        onChange={async (e) => {
                                                            const empId = e.target.value;
                                                            if (!empId) return;
                                                            try {
                                                                await adminService.assignCourseFaculty(c.course_code, empId);
                                                                alert('Teacher assigned successfully!');
                                                                const newCourses = await adminService.getCourses(1, 1000);
                                                                setAllCourses(newCourses.courses || newCourses || []);
                                                            } catch (err) {
                                                                alert('Failed to assign teacher');
                                                            }
                                                        }}
                                                    >
                                                        <option value="" disabled>Select to Assign...</option>
                                                        {users.filter(u => (u.role.toLowerCase() === 'teacher' || u.role.toLowerCase() === 'faculty') && u.dept === c.department).map(u => (
                                                            <option key={u.id} value={u.emp_id}>{u.name} ({u.emp_id})</option>
                                                        ))}
                                                    </select>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        );
    
}
