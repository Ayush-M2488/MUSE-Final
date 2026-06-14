import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import DashboardStyles from './styles/dashboardStyles';
import { Sidebar, Topbar } from './shared/Primitives';
import StudentDashboard from './student/StudentDashboard';
import TeacherDashboard from './teacher/TeacherDashboard';
import AdminDashboard from './admin/AdminDashboard';
import ForcePasswordChange from './shared/ForcePasswordChange';
import { adminService, teacherService, studentService } from '../../services/api';

export default function Dashboard({ role = 'student', onLogout }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const page = searchParams.get('tab') || 'home';
    const setPage = (val) => {
        const params = new URLSearchParams(searchParams);
        params.set('tab', val);
        setSearchParams(params);
    };

    useEffect(() => {
        const handlePopState = (e) => {
            if (window.location.pathname !== '/dashboard') {
                const confirmed = window.confirm("Are you sure you want to log out?");
                if (confirmed) {
                    window.localStorage.removeItem('muse_token');
                    window.localStorage.removeItem('muse_role');
                    window.localStorage.removeItem('muse_user');
                    onLogout?.();
                } else {
                    // User cancelled, we must go back to the dashboard
                    navigate(`/dashboard?tab=${page}`, { replace: true });
                }
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [navigate, onLogout, page]);
    const [ay, setAy] = useState('2024-25');
    const [unreadCount, setUnreadCount] = useState(0);
    const dk = role !== 'admin';
    
    // Fetch logged-in user data
    const userStr = window.localStorage.getItem('muse_user');
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        const fetchAy = async () => {
            try {
                if (role === 'admin') {
                    const cfg = await adminService.getConfig();
                    if (cfg && cfg.ay) setAy(cfg.ay);
                } else if (role === 'teacher') {
                    const data = await teacherService.getDashboardData();
                    if (data && data.globalConfig?.ay) setAy(data.globalConfig.ay);
                } else if (role === 'student') {
                    const data = await studentService.getDashboardData();
                    if (data && data.globalConfig?.ay) setAy(data.globalConfig.ay);
                    if (data && data.notifications) {
                        const count = data.notifications.filter((n) => !n.read).length;
                        setUnreadCount(count);
                    }
                }
            } catch (err) {
                console.error("Failed to load dynamic academic year:", err);
            }
        };
        fetchAy();
    }, [role]);

    let sub = `Institution-wide · AY ${ay}`;
    if (user && (role === 'student' || role === 'teacher')) {
        sub = `${user.name} · ${user.id} · AY ${ay}`;
    }

    const title = role === 'student' ? 'Student View' : role === 'teacher' ? 'Faculty View' : 'Admin Panel';

    const handleLogout = () => {
        window.localStorage.removeItem('muse_token');
        window.localStorage.removeItem('muse_role');
        window.localStorage.removeItem('muse_user');
        onLogout?.();
    };

    const handleNotificationClick = () => {
        if (role === 'student') {
            setPage('notifications');
        } else {
            alert('No new system notifications.');
        }
    };

    const [requirePasswordChange, setRequirePasswordChange] = useState(user?.require_password_change || false);

    return (
        <>
            <DashboardStyles />
            {requirePasswordChange && (
                <ForcePasswordChange 
                    user={user} 
                    onComplete={() => setRequirePasswordChange(false)} 
                />
            )}
            <div className={`dash ${dk ? 'dk-root' : 'lt-root'}`}>
                <Sidebar role={role} page={page} onNav={setPage} onLogout={handleLogout} />

                <div className="main">
                    <Topbar 
                        title={title} 
                        sub={sub} 
                        dk={dk} 
                        unread={role === 'student' ? unreadCount : 0} 
                        onNotificationClick={handleNotificationClick}
                        showNotification={role === 'student'}
                    />
                    <div className="content">
                        {role === 'student' && <StudentDashboard page={page} setPage={setPage} />}
                        {role === 'teacher' && <TeacherDashboard page={page} setPage={setPage} />}
                        {role === 'admin' && <AdminDashboard page={page} setPage={setPage} />}
                    </div>
                </div>
            </div>
        </>
    );
}