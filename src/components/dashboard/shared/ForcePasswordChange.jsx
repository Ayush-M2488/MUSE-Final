import React, { useState } from 'react';
import { getTheme } from './theme';
import { authService } from '../../../services/api';
import { ShieldCheck, Lock, KeyRound, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function ForcePasswordChange({ user, onComplete }) {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const isAdmin = user?.role === 'admin';
    const t = getTheme(user?.role);
    const primaryColor = isAdmin ? '#111827' : '#FFFFFF';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }

        if (password === 'password123') {
            setError('You cannot use the default password.');
            return;
        }

        setLoading(true);
        try {
            await authService.changePassword('password123', password);
            
            const storedUser = JSON.parse(localStorage.getItem('muse_user') || '{}');
            storedUser.require_password_change = false;
            localStorage.setItem('muse_user', JSON.stringify(storedUser));
            
            onComplete();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: isAdmin ? 'rgba(255, 255, 255, 0.8)' : 'rgba(10, 10, 10, 0.8)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '1rem',
            animation: 'fadeIn 0.3s ease-out'
        }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .fpc-input {
                    width: 100%;
                    padding: 0.85rem 1rem 0.85rem 2.75rem;
                    background: ${isAdmin ? '#FFFFFF' : 'rgba(255,255,255,0.03)'};
                    border: 1px solid ${isAdmin ? '#E5E7EB' : 'rgba(255,255,255,0.1)'};
                    border-radius: 12px;
                    color: ${t.text};
                    font-size: 0.95rem;
                    outline: none;
                    transition: all 0.2s ease;
                }
                .fpc-input:focus {
                    border-color: ${primaryColor};
                    box-shadow: 0 0 0 3px ${primaryColor}33;
                }
                .fpc-icon {
                    position: absolute;
                    left: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: ${t.muted};
                    transition: color 0.2s ease;
                }
                .fpc-input:focus + .fpc-icon, .fpc-input-wrapper:focus-within .fpc-icon {
                    color: ${primaryColor};
                }
            `}</style>

            <div className={isAdmin ? 'card-lt' : 'card-dk'} style={{
                borderRadius: '24px',
                padding: '3rem 2.5rem',
                width: '100%',
                maxWidth: '440px',
                boxShadow: isAdmin ? '0 25px 50px -12px rgba(0,0,0,0.1)' : '0 25px 50px -12px rgba(0,0,0,0.8)',
                animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative',
                overflow: 'hidden',
                border: isAdmin ? '1px solid #E5E7EB' : '1px solid #333333'
            }}>
                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <div style={{ 
                        width: '64px', height: '64px', 
                        borderRadius: '20px', 
                        background: isAdmin ? '#F3F4F6' : '#27272A', 
                        color: isAdmin ? '#111827' : '#FFFFFF',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        margin: '0 auto 1.5rem',
                        border: `1px solid ${isAdmin ? '#E5E7EB' : '#3F3F46'}`,
                    }}>
                        <ShieldCheck size={32} strokeWidth={2} />
                    </div>
                    
                    <h2 style={{ color: t.text, fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>Secure Your Account</h2>
                    <p style={{ color: t.muted, fontSize: '0.95rem', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                        Welcome back, <span style={{ color: t.text, fontWeight: 600 }}>{user?.name?.split(' ')[0]}</span>. Please replace your default password with a secure one to continue.
                    </p>

                    {error && (
                        <div style={{ 
                            background: isAdmin ? '#F3F4F6' : '#27272A', 
                            color: t.text, 
                            padding: '1rem', 
                            borderRadius: '12px', 
                            marginBottom: '1.5rem', 
                            fontSize: '0.9rem', 
                            border: `1px solid ${isAdmin ? '#E5E7EB' : '#3F3F46'}`,
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            textAlign: 'left'
                        }}>
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ textAlign: 'left', position: 'relative' }} className="fpc-input-wrapper">
                            <label style={{ display: 'block', color: t.text, fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>New Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="fpc-input"
                                    placeholder="Enter secure password"
                                    required
                                />
                                <Lock size={18} className="fpc-icon" />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: t.muted, cursor: 'pointer', padding: 0 }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div style={{ textAlign: 'left', position: 'relative' }} className="fpc-input-wrapper">
                            <label style={{ display: 'block', color: t.text, fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>Confirm Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    className="fpc-input"
                                    placeholder="Repeat new password"
                                    required
                                />
                                <KeyRound size={18} className="fpc-icon" />
                                <button 
                                    type="button" 
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: t.muted, cursor: 'pointer', padding: 0 }}
                                >
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            style={{
                                width: '100%', padding: '1rem',
                                background: isAdmin ? '#111827' : '#FFFFFF', 
                                color: isAdmin ? '#FFFFFF' : '#000000',
                                border: 'none', borderRadius: '12px',
                                fontWeight: 600, fontSize: '1rem',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                marginTop: '1rem',
                                opacity: loading ? 0.8 : 1,
                                transition: 'all 0.2s',
                            }}
                        >
                            {loading ? 'Securing Account...' : 'Save & Enter Dashboard'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
