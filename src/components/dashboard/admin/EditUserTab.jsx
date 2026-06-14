import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft } from 'lucide-react';
import { adminService } from '../../../services/api';

const Card = ({ children, style }) => (
    <div className="card-lt" style={style}>
        {children}
    </div>
);

export default function EditUserTab({ user, setPage, setUsers, t }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'Student',
        dept: 'AI & ML',
        status: 'active',
        semester: '1',
        phone: '',
        identifier: ''
    });

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                role: user.role === 'teacher' ? 'Faculty' : user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student',
                dept: user.dept || 'AI & ML',
                status: user.status || 'active',
                semester: user.semester ? String(user.semester) : '1',
                phone: user.phone || '',
                identifier: user.usn || user.emp_id || user.identifier || '' // We'll need usn or emp_id if available
            });
        }
    }, [user]);

    const handleSave = async () => {
        if (!formData.name.trim() || !formData.email.trim() || (['Student', 'Faculty'].includes(formData.role) && !formData.identifier?.trim())) {
            alert('Please fill in all required fields (Name, Email, and USN/EmpID)');
            return;
        }

        if (formData.role === 'Student' && !/^[A-Z0-9]{5,15}$/i.test(formData.identifier.trim())) {
            alert('Invalid USN format. Please enter a valid 5-15 character alphanumeric USN.');
            return;
        }

        if (formData.role === 'Faculty' && !/^[A-Z0-9-]{3,15}$/i.test(formData.identifier.trim())) {
            alert('Invalid Employee ID format. Please enter a valid Employee ID.');
            return;
        }

        setSaving(true);
        try {
            await adminService.updateUser(user.id, formData);
            const freshUsers = await adminService.getUsers(1, 1000);
            setUsers(freshUsers.users || freshUsers || []);
            alert('User updated successfully!');
            setPage('users');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Failed to update user');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: `1px solid ${t.border}` }}>
                <button 
                    className="btn btn-gh" 
                    onClick={() => setPage('users')}
                    style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.4rem .8rem', background: '#F3F4F6', color: '#4B5563', borderRadius: 8, border: 'none' }}
                >
                    <ArrowLeft size={16} /> Back
                </button>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600, color: t.text }}>Edit User Details</div>
                    <div style={{ fontSize: '.8rem', color: t.muted }}>Update the profile information and academic details for {user?.name}.</div>
                </div>
            </div>

            <Card style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Personal Information */}
                    <div>
                        <div style={{ fontSize: '1rem', fontWeight: 600, color: t.text, marginBottom: '1rem', paddingBottom: '.5rem', borderBottom: `1px solid ${t.border}` }}>Personal Information</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
                            <div>
                                <div className="mlbl" style={{ color: t.muted, marginBottom: '.4rem' }}>Full Name</div>
                                <input type="text" className="inp-lt" style={{ padding: '.6rem .8rem' }} value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} />
                            </div>
                            <div>
                                <div className="mlbl" style={{ color: t.muted, marginBottom: '.4rem' }}>Email Address</div>
                                <input type="email" className="inp-lt" style={{ padding: '.6rem .8rem' }} value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} />
                            </div>
                            {formData.role === 'Student' && (
                                <div>
                                    <div className="mlbl" style={{ color: t.muted, marginBottom: '.4rem' }}>Phone Number</div>
                                    <input type="tel" className="inp-lt" style={{ padding: '.6rem .8rem' }} value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} placeholder="+91 0000000000" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Academic Information */}
                    <div>
                        <div style={{ fontSize: '1rem', fontWeight: 600, color: t.text, marginBottom: '1rem', paddingBottom: '.5rem', borderBottom: `1px solid ${t.border}` }}>Academic Details</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
                            <div>
                                <div className="mlbl" style={{ color: t.muted, marginBottom: '.4rem' }}>System Role</div>
                                <select disabled className="inp-lt" value={formData.role} style={{ background: '#F9FAFB', cursor: 'not-allowed', padding: '.6rem .8rem' }}>
                                    <option>Student</option>
                                    <option>Faculty</option>
                                    <option>Admin</option>
                                </select>
                                <div style={{ fontSize: '.7rem', color: t.muted, marginTop: '.3rem' }}>Role cannot be modified.</div>
                            </div>
                            <div>
                                <div className="mlbl" style={{ color: t.muted, marginBottom: '.4rem' }}>Department</div>
                                <select className="inp-lt" style={{ padding: '.6rem .8rem' }} value={formData.dept} onChange={(e) => setFormData((p) => ({ ...p, dept: e.target.value }))}>
                                    {['AI & ML', 'AI & DS', 'CS Design', 'Biomedical', 'CSE'].map((o) => (<option key={o}>{o}</option>))}
                                </select>
                            </div>
                            
                            {formData.role === 'Student' && (
                                <>
                                    <div>
                                        <div className="mlbl" style={{ color: t.muted, marginBottom: '.4rem' }}>University Seat Number (USN)</div>
                                        <input type="text" className="inp-lt" style={{ padding: '.6rem .8rem', textTransform: 'uppercase' }} value={formData.identifier} onChange={(e) => setFormData((p) => ({ ...p, identifier: e.target.value.toUpperCase() }))} pattern="^[A-Za-z0-9]{5,15}$" />
                                    </div>
                                    <div>
                                        <div className="mlbl" style={{ color: t.muted, marginBottom: '.4rem' }}>Current Semester</div>
                                        <select className="inp-lt" style={{ padding: '.6rem .8rem' }} value={formData.semester} onChange={(e) => setFormData((p) => ({ ...p, semester: e.target.value }))}>
                                            {[1,2,3,4,5,6,7,8].map((o) => (<option key={o} value={o}>{o}</option>))}
                                        </select>
                                    </div>
                                </>
                            )}

                            {formData.role === 'Faculty' && (
                                <div>
                                    <div className="mlbl" style={{ color: t.muted, marginBottom: '.4rem' }}>Employee ID</div>
                                    <input type="text" className="inp-lt" style={{ padding: '.6rem .8rem', textTransform: 'uppercase' }} value={formData.identifier} onChange={(e) => setFormData((p) => ({ ...p, identifier: e.target.value.toUpperCase() }))} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Account Settings */}
                    <div>
                        <div style={{ fontSize: '1rem', fontWeight: 600, color: t.text, marginBottom: '1rem', paddingBottom: '.5rem', borderBottom: `1px solid ${t.border}` }}>Account Settings</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
                            <div>
                                <div className="mlbl" style={{ color: t.muted, marginBottom: '.4rem' }}>Account Status</div>
                                <select className="inp-lt" style={{ padding: '.6rem .8rem' }} value={formData.status} onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}>
                                    <option value="active">Active (Access Granted)</option>
                                    <option value="inactive">Inactive (Access Revoked)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: `1px solid ${t.border}`, paddingTop: '1.5rem' }}>
                        <button 
                            className="btn btn-ng" 
                            style={{ padding: '.6rem 1.2rem', background: '#F3F4F6', color: '#374151', border: `1px solid #D1D5DB`, fontWeight: 500 }}
                            onClick={() => setPage('users')}
                        >
                            Cancel
                        </button>
                        <button 
                            className="btn btn-np" 
                            style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.6rem 1.5rem' }}
                            onClick={handleSave}
                            disabled={saving}
                        >
                            <Save size={16} /> {saving ? 'Saving Changes...' : 'Save All Changes'}
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
