import React from 'react';
import { UserPlus, X, Upload, Download, CheckCircle, XCircle, Trash2, Plus, Edit2 } from 'lucide-react';
import { CH } from '../shared/Primitives';

const Card = ({ children, style }) => (
    <div className="card-lt" style={style}>
        {children}
    </div>
);

export default function UserManagementTab({
    modal, setModal, userError, setUserError, bulkModal, setBulkModal, csvRows, setCsvRows, 
    bulkImporting, bulkFeedback, setBulkFeedback, nu, setNu, userFilters, setUserFilters,
    filteredUsers, allCourses, addUser, delUser, toggleStatus, 
    handleCsvFile, downloadTemplate, submitBulkUsers, openEditUser, openViewUser, t
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {modal && (
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.82)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
                    onClick={(e) => { if (e.target === e.currentTarget) { setModal(false); setUserError(''); } }}
                >
                    <div className="modal-lt" style={{ background: '#fff', border: '1px solid #E4E7EC', borderRadius: 14, width: '100%', maxWidth: 490 }}>
                        <div style={{ padding: '1.1rem 1.25rem', borderBottom: '1px solid #E4E7EC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontWeight: 600, color: t.text }}>Add New User</div>
                            <button onClick={() => { setModal(false); setUserError(''); }}><X size={17} /></button>
                        </div>

                        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '.875rem' }}>
                            {[['Full Name', 'name', 'text'], ['Email', 'email', 'email'],].map(([l, k, type]) => (
                                <div key={k}>
                                    <div className="mlbl" style={{ color: t.muted, marginBottom: '.28rem' }}>{l}</div>
                                    <input type={type} className="inp-lt" value={nu[k]} onChange={(e) => setNu((p) => ({ ...p, [k]: e.target.value }))} />
                                </div>
                            ))}
                            {[['Role', 'role', ['Student', 'Faculty', 'Admin']], ['Department', 'dept', ['AI & ML', 'AI & DS', 'CS Design', 'Biomedical', 'CSE']], ['Status', 'status', ['active', 'inactive']],].map(([l, k, opts]) => (
                                <div key={k}>
                                    <div className="mlbl" style={{ color: t.muted, marginBottom: '.28rem' }}>{l}</div>
                                    <select className="inp-lt" value={nu[k]} onChange={(e) => setNu((p) => ({ ...p, [k]: e.target.value }))}>
                                        {opts.map((o) => (<option key={o}>{o}</option>))}
                                    </select>
                                </div>
                            ))}
                            {nu.role === 'Student' && (
                                    <>
                                        <div>
                                            <div className="mlbl" style={{ color: t.muted, marginBottom: '.28rem' }}>USN</div>
                                            <input type="text" className="inp-lt" value={nu.identifier || ''} onChange={(e) => setNu((p) => ({ ...p, identifier: e.target.value }))} placeholder="e.g. 1RV20CS001" pattern="^[A-Za-z0-9]{5,15}$" title="5-15 alphanumeric characters" />
                                        </div>
                                        <div>
                                            <div className="mlbl" style={{ color: t.muted, marginBottom: '.28rem' }}>Semester</div>
                                            <select className="inp-lt" value={nu.semester} onChange={(e) => setNu((p) => ({ ...p, semester: e.target.value }))}>
                                                {[1,2,3,4,5,6,7,8].map((o) => (<option key={o} value={o}>{o}</option>))}
                                            </select>
                                        </div>
                                        <div>
                                            <div className="mlbl" style={{ color: t.muted, marginBottom: '.28rem' }}>Phone Number (Optional)</div>
                                            <input type="tel" className="inp-lt" value={nu.phone || ''} onChange={(e) => setNu((p) => ({ ...p, phone: e.target.value }))} placeholder="e.g. +91 9876543210" />
                                        </div>
                                    </>
                                )}
                                {nu.role === 'Faculty' && (
                                    <>
                                        <div>
                                            <div className="mlbl" style={{ color: t.muted, marginBottom: '.28rem' }}>Employee ID</div>
                                            <input type="text" className="inp-lt" value={nu.identifier || ''} onChange={(e) => setNu((p) => ({ ...p, identifier: e.target.value }))} placeholder="e.g. FAC-001" pattern="^[A-Za-z0-9-]{3,15}$" title="3-15 alphanumeric characters or hyphens" />
                                        </div>
                                        <div>
                                        <div className="mlbl" style={{ color: t.muted, marginBottom: '.28rem' }}>Subjects (Across All Semesters)</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', maxHeight: 150, overflowY: 'auto', padding: '.5rem', border: `1px solid #E4E7EC`, borderRadius: 8 }}>
                                            {allCourses.filter(c => c.department === nu.dept).length === 0 && (
                                                <div style={{ color: t.muted, fontSize: '.75rem' }}>No subjects found for this department.</div>
                                            )}
                                            {allCourses.filter(c => c.department === nu.dept)
                                                .sort((a, b) => a.semester - b.semester || a.course_code.localeCompare(b.course_code))
                                                .map(c => (
                                                    <label key={c.course_code} style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.75rem', color: t.text, cursor: 'pointer' }}>
                                                        <input 
                                                            type="checkbox" 
                                                            checked={Array.isArray(nu.subjects) && nu.subjects.includes(c.course_code)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setNu(p => ({ ...p, subjects: [...(Array.isArray(p.subjects) ? p.subjects : []), c.course_code] }));
                                                                } else {
                                                                    setNu(p => ({ ...p, subjects: (Array.isArray(p.subjects) ? p.subjects : []).filter(sc => sc !== c.course_code) }));
                                                                }
                                                            }}
                                                        />
                                                        <span style={{ color: t.teal, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', fontSize: '.68rem' }}>[Sem {c.semester}]</span>
                                                        <span title={c.course_name} style={{ fontWeight: 600 }}>{c.course_code}</span>
                                                        <span style={{ color: t.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.course_name}</span>
                                                    </label>
                                                ))
                                            }
                                        </div>
                                    </div>
                                </>
                            )}
                            {userError && (
                                <div style={{ padding: '.5rem .75rem', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8, color: '#DC2626', fontSize: '.75rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                                    <XCircle size={14} />
                                    {userError}
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: '.75rem', marginTop: '.25rem' }}>
                                <button className="btn btn-np" style={{ flex: 1 }} onClick={addUser}><UserPlus size={13} />Add User</button>
                                <button className="btn btn-ng" style={{ flex: 1 }} onClick={() => { setModal(false); setUserError(''); }}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {bulkModal && (
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.82)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
                    onClick={(e) => e.target === e.currentTarget && setBulkModal(false)}
                >
                    <div className="modal-lt" style={{ background: '#fff', border: '1px solid #E4E7EC', borderRadius: 14, width: '100%', maxWidth: 640 }}>
                        <div style={{ padding: '1.1rem 1.25rem', borderBottom: '1px solid #E4E7EC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontWeight: 600, color: t.text }}>Bulk Import Users (CSV)</div>
                            <button onClick={() => { setBulkModal(false); setCsvRows([]); setBulkFeedback(null); }}><X size={17} /></button>
                        </div>

                        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', background: '#F9FAFB', padding: '.75rem 1rem', borderRadius: 10, border: '1px solid #EAECF0' }}>
                                <div>
                                    <div style={{ fontSize: '.8rem', fontWeight: 600, color: t.text }}>Need the CSV structure?</div>
                                    <div style={{ fontSize: '.72rem', color: t.muted }}>Download the pre-formatted template with sample entries.</div>
                                </div>
                                <button className="btn btn-ng" style={{ display: 'flex', gap: '.3rem', alignItems: 'center', padding: '.35rem .75rem', fontSize: '.75rem' }} onClick={downloadTemplate}>
                                    <Download size={13} /> Template
                                </button>
                            </div>

                            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #D0D5DD', borderRadius: 10, padding: '1.5rem 1rem', cursor: 'pointer', background: '#FCFCFD' }}>
                                <Upload size={24} style={{ color: t.muted, marginBottom: '.5rem' }} />
                                <span style={{ fontSize: '.8rem', fontWeight: 600, color: t.text }}>Choose CSV File</span>
                                <span style={{ fontSize: '.7rem', color: t.muted, marginTop: 2 }}>Only standard .csv files accepted</span>
                                <input type="file" accept=".csv" onChange={handleCsvFile} style={{ display: 'none' }} />
                            </label>

                            {csvRows.length > 0 && (
                                <div style={{ border: '1px solid #EAECF0', borderRadius: 10, overflow: 'hidden' }}>
                                    <div style={{ padding: '.5rem .75rem', background: '#F9FAFB', borderBottom: '1px solid #EAECF0', fontSize: '.72rem', fontWeight: 600, color: t.text, display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Spreadsheet Preview ({csvRows.length} rows found)</span>
                                        <span style={{ color: t.teal }}>Standard Password: password123</span>
                                    </div>
                                    <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                                        <table className="tbl tbl-lt" style={{ margin: 0, border: 'none', fontSize: '.72rem' }}>
                                            <thead>
                                                <tr style={{ background: '#FFF' }}><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Phone</th><th>Sem / Detail</th></tr>
                                            </thead>
                                            <tbody>
                                                {csvRows.slice(0, 5).map((row, i) => (
                                                    <tr key={i}>
                                                        <td style={{ fontWeight: 600 }}>{row.name}</td>
                                                        <td>{row.email}</td>
                                                        <td><span className={`b ${row.role.toLowerCase() === 'student' ? 'lAc' : 'lIn'}`}>{row.role}</span></td>
                                                        <td>{row.dept}</td>
                                                        <td>{row.phone || '-'}</td>
                                                        <td>{row.role.toLowerCase() === 'student' ? `Sem ${row.semester}` : `Courses: ${row.subjects || 'None'}`}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {csvRows.length > 5 && (
                                        <div style={{ padding: '.4rem .75rem', borderTop: '1px solid #EAECF0', background: '#FFF', fontSize: '.68rem', color: t.muted, textAlign: 'center' }}>
                                            ... and {csvRows.length - 5} more rows
                                        </div>
                                    )}
                                </div>
                            )}

                            {bulkFeedback && (
                                <div style={{ padding: '.75rem 1rem', borderRadius: 10, border: `1px solid ${bulkFeedback.success ? '#D1FADF' : '#FECDCA'}`, background: bulkFeedback.success ? '#ECFDF3' : '#FEF3F2' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.8rem', fontWeight: 600, color: bulkFeedback.success ? '#027A48' : '#B42318' }}>
                                        {bulkFeedback.success ? <CheckCircle size={15} /> : <XCircle size={15} />}
                                        {bulkFeedback.message}
                                    </div>
                                    {bulkFeedback.errors && bulkFeedback.errors.length > 0 && (
                                        <div style={{ maxHeight: 100, overflowY: 'auto', marginTop: '.4rem', fontSize: '.7rem', color: '#667085', display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            {bulkFeedback.errors.map((err, i) => <div key={i}>• {err}</div>)}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '.75rem', marginTop: '.25rem' }}>
                                <button 
                                    className="btn btn-np" 
                                    style={{ flex: 1, opacity: csvRows.length === 0 || bulkImporting ? 0.6 : 1 }} 
                                    disabled={csvRows.length === 0 || bulkImporting} 
                                    onClick={submitBulkUsers}
                                >
                                    {bulkImporting ? 'Importing...' : `Import ${csvRows.length} Users`}
                                </button>
                                <button className="btn btn-ng" style={{ flex: 1 }} onClick={() => { setBulkModal(false); setCsvRows([]); setBulkFeedback(null); }}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Card>
                <CH 
                    title="User Management" 
                    sub={`${filteredUsers.length} users`} 
                    right={
                        <div style={{ display: 'flex', gap: '.5rem' }}>
                            <button className="btn btn-ng" style={{ padding: '.35rem .75rem', fontSize: '.75rem', display: 'flex', gap: '.3rem', alignItems: 'center' }} onClick={() => setBulkModal(true)}>
                                <Upload size={13} /> Bulk Import (CSV)
                            </button>
                            <button className="btn btn-np" style={{ padding: '.35rem .75rem', fontSize: '.75rem', display: 'flex', gap: '.3rem', alignItems: 'center' }} onClick={() => setModal(true)}>
                                <Plus size={13} /> Add User
                            </button>
                        </div>
                    } 
                />
                
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <select className="inp-lt" style={{ flex: 1, minWidth: '120px' }} value={userFilters.role} onChange={e => setUserFilters(p => ({ ...p, role: e.target.value }))}>
                        <option value="All">All Roles</option>
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option>
                    </select>
                    <select className="inp-lt" style={{ flex: 1, minWidth: '150px' }} value={userFilters.dept} onChange={e => setUserFilters(p => ({ ...p, dept: e.target.value }))}>
                        <option value="All">All Departments</option>
                        <option value="AI & ML">AI & ML</option>
                        <option value="AI & DS">AI & DS</option>
                        <option value="CS Design">CS Design</option>
                        <option value="Biomedical">Biomedical</option>
                        <option value="CSE">CSE</option>
                    </select>
                    {(userFilters.role === 'student' || userFilters.role === 'All') && (
                        <select className="inp-lt" style={{ flex: 1, minWidth: '120px' }} value={userFilters.sem} onChange={e => setUserFilters(p => ({ ...p, sem: e.target.value }))}>
                            <option value="All">All Semesters</option>
                            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                        </select>
                    )}
                    {(userFilters.role === 'teacher' || userFilters.role === 'All') && (
                        <select className="inp-lt" style={{ flex: 1, minWidth: '150px' }} value={userFilters.subject} onChange={e => setUserFilters(p => ({ ...p, subject: e.target.value }))}>
                            <option value="">All Subjects</option>
                            {allCourses
                                .filter(c => (userFilters.dept === 'All' || c.department === userFilters.dept) && (userFilters.sem === 'All' || c.semester === parseInt(userFilters.sem)))
                                .map(c => <option key={c.course_code} value={c.course_code}>{c.course_code} - {c.course_name}</option>)
                            }
                        </select>
                    )}
                </div>

                <table className="tbl tbl-lt">
                    <thead>
                        <tr><th>#</th><th>Name</th><th>Role</th><th>Dept / Details</th><th>Email</th><th>Status</th><th>Last Active</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((u, idx) => (
                            <tr key={u.id} onClick={() => openViewUser(u)} style={{ cursor: 'pointer' }} className="hover-row">
                                <td style={{ color: t.muted, fontSize: '.85rem', fontWeight: 500 }}>{idx + 1}</td>
                                <td>{u.name}</td><td>{u.role}</td>
                                <td>
                                    <div style={{ fontWeight: 500 }}>{u.dept}</div>
                                    {u.role === 'student' && u.semester && <div style={{ fontSize: '.75rem', color: t.muted }}>Semester {u.semester}</div>}
                                    {u.role === 'teacher' && u.subjects && u.subjects.length > 0 && <div style={{ fontSize: '.75rem', color: t.muted, maxWidth: 150, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={u.subjects.join(', ')}>{u.subjects.join(', ')}</div>}
                                </td>
                                <td>{u.email}</td>
                                <td><span className={`b ${u.status === 'active' ? 'lAc' : 'lIn'}`}>{u.status}</span></td>
                                <td>{u.last}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '.4rem' }}>
                                        {u.role !== 'admin' && (
                                            <button 
                                                className="btn btn-dr" 
                                                style={{ padding: '.22rem .42rem', background: u.status === 'active' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)', color: u.status === 'active' ? t.rHigh : t.success, border: 'none' }} 
                                                onClick={(e) => { e.stopPropagation(); toggleStatus(u.id, u.status); }} 
                                                title={u.status === 'active' ? 'Deactivate User' : 'Activate User'}
                                            >
                                                {u.status === 'active' ? <XCircle size={11} /> : <CheckCircle size={11} />}
                                            </button>
                                        )}
                                        <button className="btn btn-dr" style={{ padding: '.22rem .42rem', color: t.teal, border: 'none', background: 'rgba(20, 184, 166, 0.1)' }} onClick={(e) => { e.stopPropagation(); openEditUser(u); }} title="Edit User">
                                            <Edit2 size={11} />
                                        </button>
                                        <button className="btn btn-dr" style={{ padding: '.22rem .42rem' }} onClick={(e) => { e.stopPropagation(); delUser(u.id); }}><Trash2 size={11} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}
