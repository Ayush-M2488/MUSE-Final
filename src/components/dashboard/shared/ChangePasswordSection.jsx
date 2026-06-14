import React, { useState, useEffect } from 'react';
import { getTheme } from './theme';
import { authService } from '../../../services/api';
import { Lock, KeyRound, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';

export default function ChangePasswordSection() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [role, setRole] = useState(null);
    
    // Toggles for visibility
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);

    useEffect(() => {
        const userStr = window.localStorage.getItem('muse_user');
        if (userStr) {
            try {
                const userObj = JSON.parse(userStr);
                setRole(userObj.role);
            } catch (e) {}
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters long.');
            return;
        }

        if (newPassword !== confirm) {
            setError('New passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await authService.changePassword(currentPassword, newPassword);
            setSuccess('Password updated successfully. Your account is secure.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirm('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update password.');
        } finally {
            setLoading(false);
        }
    };

    const isAdmin = role === 'admin';
    const t = getTheme(role);

    return (
        <div className={isAdmin ? 'card-lt' : 'card-dk'} style={{ padding: '1.5rem', borderRadius: '12px', border: `1px solid ${t.border}`, boxShadow: isAdmin ? '0 2px 4px rgba(0,0,0,0.02)' : 'none', maxWidth: 540 }}>
            <style>{`
                .cps-inp {
                    width: 100%;
                    padding: 0.75rem 2.5rem;
                    background: ${isAdmin ? '#FFFFFF' : 'rgba(255,255,255,0.03)'};
                    border: 1px solid ${isAdmin ? '#E5E7EB' : 'rgba(255,255,255,0.1)'};
                    border-radius: 8px;
                    color: ${t.text};
                    font-size: 0.9rem;
                    outline: none;
                    transition: all 0.2s ease;
                }
                .cps-inp:focus {
                    border-color: ${isAdmin ? '#111827' : '#FFFFFF'};
                    box-shadow: 0 0 0 2px ${isAdmin ? 'rgba(17, 24, 39, 0.2)' : 'rgba(255, 255, 255, 0.2)'};
                }
            `}</style>
            
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: `1px solid ${t.border}`, paddingBottom: '1.25rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '12px', background: isAdmin ? '#F3F4F6' : '#27272A', color: isAdmin ? '#111827' : '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={24} strokeWidth={1.5} />
                </div>
                <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: t.text, margin: 0 }}>Security & Credentials</h3>
                    <p style={{ fontSize: '0.85rem', color: t.muted, margin: '2px 0 0 0' }}>Update your password to keep your account safe.</p>
                </div>
            </div>

            {/* Messages */}
            {error && (
                <div style={{ background: isAdmin ? '#FEF2F2' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${isAdmin ? '#FECACA' : 'rgba(239, 68, 68, 0.2)'}`, color: '#EF4444', padding: '0.85rem', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}
            {success && (
                <div style={{ background: isAdmin ? '#F0FDF4' : 'rgba(16, 185, 129, 0.1)', border: `1px solid ${isAdmin ? '#BBF7D0' : 'rgba(16, 185, 129, 0.2)'}`, color: '#10B981', padding: '0.85rem', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <ShieldCheck size={16} />
                    <span>{success}</span>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Current Password */}
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: t.text, marginBottom: '0.5rem' }}>Current Password</label>
                    <div style={{ position: 'relative' }}>
                        <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: t.muted }} />
                        <input
                            type={showCurrent ? "text" : "password"}
                            className="cps-inp"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            placeholder="Enter current password"
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowCurrent(!showCurrent)}
                            style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: t.muted, cursor: 'pointer', padding: 0 }}
                        >
                            {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                {/* New Password */}
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: t.text, marginBottom: '0.5rem' }}>New Password</label>
                    <div style={{ position: 'relative' }}>
                        <KeyRound size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: t.muted }} />
                        <input
                            type={showNew ? "text" : "password"}
                            className="cps-inp"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            placeholder="Must be at least 6 characters"
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowNew(!showNew)}
                            style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: t.muted, cursor: 'pointer', padding: 0 }}
                        >
                            {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                {/* Confirm Password */}
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: t.text, marginBottom: '0.5rem' }}>Confirm New Password</label>
                    <div style={{ position: 'relative' }}>
                        <ShieldCheck size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: t.muted }} />
                        <input
                            type={showNew ? "text" : "password"}
                            className="cps-inp"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            required
                            placeholder="Repeat new password"
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.65rem 1.25rem',
                            background: isAdmin ? '#111827' : '#FFFFFF',
                            color: isAdmin ? '#FFFFFF' : '#000000',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                        }}
                    >
                        <Lock size={16} />
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </form>
        </div>
    );
}
