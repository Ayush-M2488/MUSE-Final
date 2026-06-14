import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { KeyRound, CheckCircle, Loader, AlertTriangle } from 'lucide-react';
import { authService } from '../../services/api';

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const urlToken = queryParams.get('token');
        if (urlToken) {
            setToken(urlToken);
        } else {
            setError('Invalid or missing password reset token.');
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!token) {
            setError('Missing reset token. Please use the link from your email.');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await authService.resetPassword({ token, newPassword: password });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password. The token may be expired or invalid.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#FAFAFA',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        }}>
            <div style={{
                background: '#fff',
                width: '100%',
                maxWidth: '420px',
                padding: '2.5rem',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                border: '1px solid #E5E7EB'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ 
                        width: '48px', height: '48px', borderRadius: '50%', background: '#F3F4F6', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'
                    }}>
                        <KeyRound size={24} color="#4B5563" />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600', color: '#111827' }}>Set New Password</h2>
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: '#6B7280' }}>
                        Create a strong, secure password for your account.
                    </p>
                </div>

                {success ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ background: '#ECFDF5', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #D1FAE5' }}>
                            <CheckCircle size={24} color="#10B981" style={{ margin: '0 auto 0.5rem' }} />
                            <p style={{ margin: 0, fontSize: '0.875rem', color: '#065F46', fontWeight: '500' }}>
                                Password reset successfully!
                            </p>
                            <p style={{ margin: '0.5rem 0 0', fontSize: '0.8125rem', color: '#047857' }}>
                                You can now log in using your new credentials.
                            </p>
                        </div>
                        <button 
                            onClick={() => navigate('/login')}
                            style={{
                                width: '100%', padding: '0.75rem', background: '#111827', color: '#fff',
                                border: 'none', borderRadius: '6px', fontSize: '0.875rem', fontWeight: '500',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                            }}
                        >
                            Proceed to Login
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div style={{ background: '#FEF2F2', border: '1px solid #FEE2E2', color: '#B91C1C', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8125rem', marginBottom: '1.5rem', textAlign: 'left', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>{error}</div>
                            </div>
                        )}
                        
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                                New Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{
                                    width: '100%', padding: '0.75rem 1rem', background: '#F9FAFB', border: '1px solid #D1D5DB',
                                    borderRadius: '6px', fontSize: '0.875rem', color: '#111827', boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{
                                    width: '100%', padding: '0.75rem 1rem', background: '#F9FAFB', border: '1px solid #D1D5DB',
                                    borderRadius: '6px', fontSize: '0.875rem', color: '#111827', boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <button 
                            type="submit"
                            disabled={loading || !token}
                            style={{
                                width: '100%', padding: '0.75rem', background: '#111827', color: '#fff',
                                border: 'none', borderRadius: '6px', fontSize: '0.875rem', fontWeight: '500',
                                cursor: (loading || !token) ? 'not-allowed' : 'pointer', opacity: (loading || !token) ? 0.7 : 1,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                            }}
                        >
                            {loading ? <Loader size={16} className="spin" /> : 'Update Password'}
                        </button>
                        
                        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                            <Link to="/login" style={{ fontSize: '0.8125rem', color: '#4B5563', textDecoration: 'none' }}>
                                Cancel and return to Login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
            <style dangerouslySetInnerHTML={{__html: `
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}} />
        </div>
    );
}
