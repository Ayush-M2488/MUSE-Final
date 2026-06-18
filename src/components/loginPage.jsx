import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, GraduationCap, BookOpen, Shield } from 'lucide-react';
import { authService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const ROLES = [
  { id: 'student', label: 'Student', icon: GraduationCap, color: 'text-blue-400', bg: 'bg-blue-500/5', focusClass: 'focus:border-blue-500/30 focus:ring-1 focus:ring-blue-500/10', btnClass: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 focus:ring-blue-500/20' },
  { id: 'teacher', label: 'Faculty', icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-500/5', focusClass: 'focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/10', btnClass: 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 focus:ring-emerald-500/20' },
  { id: 'admin', label: 'Admin', icon: Shield, color: 'text-rose-400', bg: 'bg-rose-500/5', focusClass: 'focus:border-rose-500/30 focus:ring-1 focus:ring-rose-500/10', btnClass: 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 focus:ring-rose-500/20' }
];

export default function LoginPage({ initialRole = 'student', onBack, onLoginSuccess }) {
  const [activeRole, setActiveRole] = useState(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const role = ROLES.find(r => r.id === activeRole);

  useEffect(() => {
    setEmail('');
    setPassword('');
    setError('');
  }, [activeRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);

    try {
      const data = await authService.login({ email: email.trim().toLowerCase(), password, role: activeRole });
      localStorage.setItem('muse_token', data.token);
      localStorage.setItem('muse_role', data.user.role);
      localStorage.setItem('muse_user', JSON.stringify(data.user));

      setLoading(false);
      onLoginSuccess?.(data.user.role);
    } catch (err) {
      setError(err.response?.data?.error || "Connection failed.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative bg-black font-sans text-white overflow-hidden">
      {/* Background Image & Blur Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: `url('/school-of-engineering.webp')` }}
      />
      <div className="absolute inset-0 z-0 bg-black/60 backdrop-blur-[3px]" />

      {/* Top Left Nav */}
      <div className="absolute top-8 left-8 z-20">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Website
        </button>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[420px] p-8 sm:p-10 bg-[#0A0A0A] border border-[#222] rounded-xl shadow-2xl mx-4">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <img
            src="/mysore_logo.png"
            alt="MUSE Logo"
            className="w-12 h-12 mb-4 object-contain"
          />
          <h1 className="text-xl font-semibold tracking-tight">Sign in to MUSE</h1>
          <p className="text-sm text-gray-500 mt-1">Mysore University School of Engineering</p>
        </div>

        {/* Role Tabs */}
        <div className="flex gap-2 mb-6">
          {ROLES.map(r => {
            const Icon = r.icon;
            const isActive = activeRole === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setActiveRole(r.id)}
                className={`flex-1 py-2.5 px-2 flex flex-col items-center gap-1.5 text-sm font-medium rounded-lg border transition-all duration-500 ease-in-out ${isActive
                  ? `\${r.bg} \${r.color} border-[#333] shadow-sm`
                  : 'bg-[#111] text-gray-500 border-transparent hover:bg-[#1a1a1a] hover:text-gray-300'
                  }`}
              >
                <Icon size={16} className={isActive ? r.color : 'text-gray-500'} />
                {r.label}
              </button>
            );
          })}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className={`w-full bg-[#111] border border-[#333] rounded-md px-4 py-2.5 text-base text-white placeholder-gray-600 focus:outline-none transition-all duration-500 ease-in-out ${role.focusClass}`}
              placeholder="user@muse.edu"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-medium text-gray-400">Password</label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-gray-500 hover:text-white transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className={`w-full bg-[#111] border border-[#333] rounded-md px-4 py-2.5 text-base text-white placeholder-gray-600 focus:outline-none transition-all duration-500 ease-in-out ${role.focusClass}`}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-md text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-3 font-semibold text-base py-3 rounded-md focus:outline-none focus:ring-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-500 ease-in-out flex justify-center items-center gap-2 ${role.btnClass}`}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Sign In
          </button>

        </form>

        {/* Need Help */}
        <div className="mt-6 text-center border-t border-[#222] pt-4">
          <p className="text-sm text-gray-500">
            Need help? <a href="mailto:admin@muse.ac.in" className="text-gray-400 hover:text-white transition-colors">Email: admin@muse.ac.in</a>
          </p>
        </div>

      </div>
    </div>
  );
}