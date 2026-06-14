import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle, Loader } from 'lucide-react';
import { authService } from '../../services/api';

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!email) {
            setError('Please enter your email address');
            return;
        }

        setLoading(true);
        try {
            await authService.forgotPassword(email);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send reset link. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            backgroundColor: '#000',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            overflow: 'hidden'
        }}>
            {/* Background Image & Blur Overlay */}
            <div 
                style={{ 
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0,
                    backgroundImage: `url('/src/assets/school-of-engineering.webp')`,
                    backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.4 
                }} 
            />
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0,
                backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)'
            }} />

            <div style={{
                position: 'relative',
                zIndex: 10,
                background: '#fff',
                width: '100%',
                maxWidth: '420px',
                padding: '2.5rem',
                borderRadius: '12px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
                border: '1px solid #E5E7EB',
                margin: '0 1rem'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ 
                        width: '48px', height: '48px', borderRadius: '50%', background: '#F3F4F6', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'
                    }}>
                        <Mail size={24} color="#4B5563" />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600', color: '#111827' }}>Forgot Password</h2>
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: '#6B7280' }}>
                        Enter your registered email address and we'll send you a link to reset your password.
                    </p>
                </div>

                {success ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ background: '#ECFDF5', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #D1FAE5' }}>
                            <CheckCircle size={24} color="#10B981" style={{ margin: '0 auto 0.5rem' }} />
                            <p style={{ margin: 0, fontSize: '0.875rem', color: '#065F46', fontWeight: '500' }}>
                                Reset link sent!
                            </p>
                            <p style={{ margin: '0.5rem 0 0', fontSize: '0.8125rem', color: '#047857' }}>
                                Check your inbox and spam folder for the password reset email.
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
                            Return to Login
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div style={{ background: '#FEF2F2', border: '1px solid #FEE2E2', color: '#B91C1C', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8125rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                                {error}
                            </div>
                        )}
                        
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@institution.edu"
                                style={{
                                    width: '100%', padding: '0.75rem 1rem', background: '#F9FAFB', border: '1px solid #D1D5DB',
                                    borderRadius: '6px', fontSize: '0.875rem', color: '#111827', boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', padding: '0.75rem', background: '#111827', color: '#fff',
                                border: 'none', borderRadius: '6px', fontSize: '0.875rem', fontWeight: '500',
                                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                            }}
                        >
                            {loading ? <Loader size={16} className="spin" /> : 'Send Reset Link'}
                        </button>

                        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                            <Link to="/login" style={{ fontSize: '0.8125rem', color: '#4B5563', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                <ArrowLeft size={14} /> Back to Login
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
