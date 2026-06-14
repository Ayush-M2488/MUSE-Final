import React from 'react';
import { ArrowLeft, User, Mail, Shield, BookOpen, Hash, Phone, Calendar } from 'lucide-react';

import { adminService } from '../../../services/api';

const Card = ({ children, style }) => (
    <div className="card-lt" style={style}>
        {children}
    </div>
);

export default function ViewUserTab({ user, setPage, t }) {
    const [resetting, setResetting] = React.useState(false);

    if (!user) return null;

    const handleResetPassword = async () => {
        if (!window.confirm(`Are you sure you want to reset ${user.name}'s password to 'password123'?`)) return;
        setResetting(true);
        try {
            await adminService.resetUserPassword(user.id);
            alert(`Password for ${user.name} has been reset to default.`);
        } catch (error) {
            alert('Failed to reset password.');
        } finally {
            setResetting(false);
        }
    };

    const roleLabel = user.role === 'teacher' ? 'Faculty' : user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student';
    
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1050px', margin: '0 auto', width: '100%' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <button 
                    className="btn btn-gh" 
                    onClick={() => setPage('users')}
                    style={{ display: 'flex', alignItems: 'center', gap: '.4rem', padding: '.35rem .75rem', fontSize: '0.8rem', background: '#FFFFFF', color: '#4B5563', borderRadius: 6, border: `1px solid ${t.border}`, fontWeight: 500, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                >
                    <ArrowLeft size={14} /> Back to Directory
                </button>
                <button 
                    onClick={handleResetPassword}
                    disabled={resetting}
                    style={{ display: 'flex', alignItems: 'center', gap: '.4rem', padding: '.35rem .75rem', fontSize: '0.8rem', background: '#FEF2F2', color: '#DC2626', borderRadius: 6, border: '1px solid #FECACA', fontWeight: 500, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', cursor: resetting ? 'not-allowed' : 'pointer', opacity: resetting ? 0.7 : 1 }}
                >
                    <Shield size={14} /> {resetting ? 'Resetting...' : 'Reset Password to Default'}
                </button>
            </div>

            {/* Main Content Area */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(400px, 2fr)', gap: '1.5rem', alignItems: 'start' }}>
                
                {/* Left Column: Profile Card */}
                <Card style={{ overflow: 'hidden' }}>
                    {/* Cover Background */}
                    <div style={{ height: '80px', background: `linear-gradient(135deg, ${t.teal} 0%, #2DD4BF 100%)` }}></div>
                    
                    <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: '-32px' }}>
                        {/* Avatar */}
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #FFF', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'rgba(20, 184, 166, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.teal }}>
                                <User size={28} />
                            </div>
                        </div>
                        
                        {/* Name & Role */}
                        <div style={{ marginTop: '0.75rem' }}>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: t.text, letterSpacing: '-0.02em' }}>{user.name}</div>
                            <div style={{ fontSize: '.85rem', color: t.muted, marginTop: '4px', fontWeight: 500 }}>{roleLabel} · {user.dept || 'No Department'}</div>
                        </div>

                        {/* Status Badge */}
                        <div style={{ marginTop: '1.25rem' }}>
                            <span className={`b ${user.status === 'active' ? 'lAc' : 'lIn'}`} style={{ padding: '6px 14px', fontSize: '.8rem', fontWeight: 600, borderRadius: 20 }}>
                                {user.status === 'active' ? 'Active Account' : 'Inactive Account'}
                            </span>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div style={{ padding: '1.25rem 1.5rem', background: '#F9FAFB', borderTop: `1px solid ${t.border}` }}>
                        <div style={{ fontSize: '.8rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Contact & Activity</div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FFF', border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.muted }}>
                                    <Mail size={16} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '.75rem', color: t.muted, fontWeight: 500, marginBottom: '2px' }}>Email Address</div>
                                    <div style={{ fontSize: '.9rem', color: t.text, fontWeight: 500 }}>{user.email}</div>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FFF', border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.muted }}>
                                    <Phone size={16} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '.75rem', color: t.muted, fontWeight: 500, marginBottom: '2px' }}>Phone Number</div>
                                    <div style={{ fontSize: '.9rem', color: t.text, fontWeight: 500 }}>{user.phone || 'Not Provided'}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FFF', border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.muted }}>
                                    <Calendar size={16} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '.75rem', color: t.muted, fontWeight: 500, marginBottom: '2px' }}>Last Activity</div>
                                    <div style={{ fontSize: '.9rem', color: t.text, fontWeight: 500 }}>{user.last || 'Never Logged In'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Right Column: Academic & System Info */}
                <Card style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Shield size={16} />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: t.text }}>Academic Profile</div>
                            <div style={{ fontSize: '.8rem', color: t.muted, marginTop: '2px' }}>System role and institutional identifiers</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div style={{ background: '#F9FAFB', padding: '1rem', borderRadius: 10, border: `1px solid ${t.border}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: t.muted, marginBottom: '.5rem' }}>
                                <Shield size={14} /> <span style={{ fontSize: '.8rem', fontWeight: 600 }}>System Role</span>
                            </div>
                            <div style={{ fontSize: '1rem', fontWeight: 600, color: t.text }}>{roleLabel}</div>
                        </div>
                        
                        <div style={{ background: '#F9FAFB', padding: '1rem', borderRadius: 10, border: `1px solid ${t.border}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: t.muted, marginBottom: '.5rem' }}>
                                <BookOpen size={14} /> <span style={{ fontSize: '.8rem', fontWeight: 600 }}>Department</span>
                            </div>
                            <div style={{ fontSize: '1rem', fontWeight: 600, color: t.text }}>{user.dept || 'Not Assigned'}</div>
                        </div>

                        {user.role === 'student' && (
                            <>
                                <div style={{ background: '#F9FAFB', padding: '1rem', borderRadius: 10, border: `1px solid ${t.border}` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: t.muted, marginBottom: '.5rem' }}>
                                        <Hash size={14} /> <span style={{ fontSize: '.8rem', fontWeight: 600 }}>University Seat Number</span>
                                    </div>
                                    <div style={{ fontSize: '1rem', fontWeight: 700, color: t.text, fontFamily: 'JetBrains Mono, monospace' }}>
                                        {user.usn || user.identifier || 'Not Assigned'}
                                    </div>
                                </div>
                                <div style={{ background: '#F9FAFB', padding: '1rem', borderRadius: 10, border: `1px solid ${t.border}` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: t.muted, marginBottom: '.5rem' }}>
                                        <BookOpen size={14} /> <span style={{ fontSize: '.8rem', fontWeight: 600 }}>Current Semester</span>
                                    </div>
                                    <div style={{ fontSize: '1rem', fontWeight: 600, color: t.text }}>
                                        {user.semester ? `Semester ${user.semester}` : 'Not Assigned'}
                                    </div>
                                </div>
                            </>
                        )}

                        {user.role === 'teacher' && (
                            <>
                                <div style={{ background: '#F9FAFB', padding: '1rem', borderRadius: 10, border: `1px solid ${t.border}` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: t.muted, marginBottom: '.5rem' }}>
                                        <Hash size={14} /> <span style={{ fontSize: '.8rem', fontWeight: 600 }}>Employee ID</span>
                                    </div>
                                    <div style={{ fontSize: '1rem', fontWeight: 700, color: t.text, fontFamily: 'JetBrains Mono, monospace' }}>
                                        {user.emp_id || user.identifier || 'Not Assigned'}
                                    </div>
                                </div>
                                <div style={{ gridColumn: '1 / -1', background: '#F9FAFB', padding: '1rem', borderRadius: 10, border: `1px solid ${t.border}` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: t.muted, marginBottom: '1rem' }}>
                                        <BookOpen size={14} /> <span style={{ fontSize: '.8rem', fontWeight: 600 }}>Assigned Subjects</span>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem' }}>
                                        {user.subjects && user.subjects.length > 0 ? (
                                            user.subjects.map(sub => (
                                                <span key={sub} style={{ padding: '4px 10px', background: '#FFF', color: '#3B82F6', borderRadius: 6, fontSize: '.8rem', fontWeight: 600, border: '1px solid rgba(59, 130, 246, 0.2)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                                    {sub}
                                                </span>
                                            ))
                                        ) : (
                                            <span style={{ fontSize: '.85rem', color: t.muted }}>No subjects assigned yet.</span>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
